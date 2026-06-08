import { Injectable } from '@angular/core';
import { CspService } from './csp.service';
import {
  CustomerAPICredential,
  APIErrorResponse,
  APISuccessResponse,
  APIResponse,
  API_ERROR_CODES,
  OpenAPIHeaders,
  PaginationMeta,
  Invoice,
  Vehicle,
  ConsumptionTransaction,
  ConsumptionSummary,
  InvoiceQueryParams,
  VehicleQueryParams,
  ConsumptionQueryParams,
  VehicleStatus,
} from '../../models/open-api.model';
import { Customer } from '../../models/customer.model';

interface AuthContext {
  credential: CustomerAPICredential;
  customer: Customer;
}

@Injectable({ providedIn: 'root' })
export class OpenApiService {
  private readonly RATE_LIMIT_MAX = 100; // requests per minute
  private readonly RATE_LIMIT_ENABLED = true;

  constructor(private readonly csp: CspService) {}

  // ===== AUTHENTICATION MIDDLEWARE =====

  /**
   * Authenticate API request using X-API-KEY and X-API-SECRET headers
   * Returns auth context if valid, or error response if invalid
   */
  authenticate(headers: Partial<OpenAPIHeaders>): APIErrorResponse | AuthContext {
    const apiKey = headers['X-API-KEY'];
    const apiSecret = headers['X-API-SECRET'];

    // Check if credentials are provided
    if (!apiKey || !apiSecret) {
      return this.errorResponse(
        'Missing API credentials. Include X-API-KEY and X-API-SECRET headers.',
        API_ERROR_CODES.MISSING_API_CREDENTIALS
      );
    }

    // Get stored credential
    const credential = this.csp.getCustomerAPICredential();

    if (!credential) {
      return this.errorResponse(
        'No API credentials found for this customer. Generate credentials first.',
        API_ERROR_CODES.INVALID_API_CREDENTIALS
      );
    }

    // Validate API Key
    if (credential.apiKey !== apiKey) {
      return this.errorResponse(
        'Invalid API Key',
        API_ERROR_CODES.INVALID_API_CREDENTIALS
      );
    }

    // Validate Secret Key (in production, use bcrypt.compareSync)
    // For this prototype, we'll do a simple check since we don't have real hashing
    const isSecretValid = this.validateSecret(apiSecret, credential.secretHash);
    if (!isSecretValid) {
      return this.errorResponse(
        'Invalid API Secret',
        API_ERROR_CODES.INVALID_API_CREDENTIALS
      );
    }

    // Check if credential is revoked
    if (credential.status === 'Revoked') {
      return this.errorResponse(
        'API credentials have been revoked',
        API_ERROR_CODES.REVOKED_CREDENTIALS
      );
    }

    // Check if credential is disabled
    if (!credential.isEnabled || credential.status === 'Disabled') {
      return this.errorResponse(
        'API access is disabled for this customer',
        API_ERROR_CODES.DISABLED_API_ACCESS
      );
    }

    // Get customer data
    const customer = this.csp.getCustomer();

    // Update last used timestamp
    this.csp.updateAPICredentialLastUsed();

    // Return auth context
    return {
      credential,
      customer,
    };
  }

  /**
   * Validate secret key against hash
   * In production, use: bcrypt.compareSync(plainSecret, secretHash)
   */
  private validateSecret(plainSecret: string, secretHash: string): boolean {
    // For prototype: we'll accept any secret that starts with 'csp_secret_'
    // In production, this would be: return bcrypt.compareSync(plainSecret, secretHash);
    return plainSecret.startsWith('csp_secret_');
  }

  /**
   * Check rate limit for API key
   */
  checkRateLimit(apiKey: string): boolean {
    if (!this.RATE_LIMIT_ENABLED) {
      return true;
    }
    return this.csp.checkRateLimit(apiKey, this.RATE_LIMIT_MAX);
  }

  /**
   * Log API request
   */
  private logRequest(
    credential: CustomerAPICredential,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    responseStatus: number,
    isSuccess: boolean,
    errorMessage?: string,
    executionTimeMs: number = 0
  ): void {
    this.csp.logAPIRequest({
      customerId: credential.customerId,
      apiCredentialId: credential.id,
      endpoint,
      httpMethod: method,
      requestIp: '127.0.0.1', // Mock IP
      userAgent: navigator.userAgent,
      responseStatus,
      isSuccess,
      errorMessage,
      executionTimeMs,
    });
  }

  // ===== HELPER METHODS =====

  private successResponse<T>(data: T, message: string = 'Success', pagination?: PaginationMeta): APISuccessResponse<T> {
    return {
      success: true,
      message,
      data,
      pagination,
    };
  }

  private errorResponse(message: string, errorCode: string): APIErrorResponse {
    return {
      success: false,
      message,
      errorCode,
    };
  }

  /**
   * Execute API request with authentication, rate limiting, and logging
   */
  private executeRequest<T>(
    headers: Partial<OpenAPIHeaders>,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    handler: (context: AuthContext) => APIResponse<T>
  ): APIResponse<T> {
    const startTime = Date.now();

    // Authenticate
    const authResult = this.authenticate(headers);
    if ('errorCode' in authResult) {
      const executionTime = Date.now() - startTime;
      // Log failed authentication
      if (headers['X-API-KEY']) {
        this.csp.logAPIRequest({
          customerId: 'unknown',
          apiCredentialId: 'unknown',
          endpoint,
          httpMethod: method,
          requestIp: '127.0.0.1',
          userAgent: navigator.userAgent,
          responseStatus: 401,
          isSuccess: false,
          errorMessage: authResult.message,
          executionTimeMs: executionTime,
        });
      }
      return authResult;
    }

    const context = authResult as AuthContext;

    // Check rate limit
    if (!this.checkRateLimit(context.credential.apiKey)) {
      const executionTime = Date.now() - startTime;
      this.logRequest(context.credential, endpoint, method, 429, false, 'Rate limit exceeded', executionTime);
      return this.errorResponse(
        `Rate limit exceeded. Maximum ${this.RATE_LIMIT_MAX} requests per minute.`,
        API_ERROR_CODES.RATE_LIMIT_EXCEEDED
      );
    }

    // Execute handler
    try {
      const result = handler(context);
      const executionTime = Date.now() - startTime;

      // Log request
      const isSuccess = 'success' in result && result.success === true;
      const responseStatus = isSuccess ? 200 : 400;
      const errorMessage = !isSuccess && 'message' in result ? result.message : undefined;

      this.logRequest(context.credential, endpoint, method, responseStatus, isSuccess, errorMessage, executionTime);

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      this.logRequest(context.credential, endpoint, method, 500, false, errorMessage, executionTime);
      return this.errorResponse(errorMessage, API_ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Paginate array data
   */
  private paginate<T>(data: T[], page: number = 1, pageSize: number = 20): { data: T[]; pagination: PaginationMeta } {
    const validPageSize = Math.min(Math.max(pageSize, 1), 100); // Max 100 items per page
    const validPage = Math.max(page, 1);
    const totalRecords = data.length;
    const totalPages = Math.ceil(totalRecords / validPageSize);
    const startIndex = (validPage - 1) * validPageSize;
    const endIndex = startIndex + validPageSize;

    return {
      data: data.slice(startIndex, endIndex),
      pagination: {
        page: validPage,
        pageSize: validPageSize,
        totalRecords,
        totalPages,
      },
    };
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  private isValidDate(dateStr: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Validate date range
   */
  private validateDateRange(fromDate?: string, toDate?: string): APIErrorResponse | null {
    if (fromDate && !this.isValidDate(fromDate)) {
      return this.errorResponse('Invalid fromDate format. Use YYYY-MM-DD.', API_ERROR_CODES.INVALID_DATE_FORMAT);
    }
    if (toDate && !this.isValidDate(toDate)) {
      return this.errorResponse('Invalid toDate format. Use YYYY-MM-DD.', API_ERROR_CODES.INVALID_DATE_FORMAT);
    }
    if (fromDate && toDate && fromDate > toDate) {
      return this.errorResponse('fromDate must be before toDate', API_ERROR_CODES.INVALID_DATE_RANGE);
    }
    return null;
  }

  // ===== OPEN API ENDPOINTS =====

  /**
   * GET /api/open/v1/customer/profile
   * Get authenticated customer profile
   */
  getCustomerProfile(headers: Partial<OpenAPIHeaders>): APIResponse<Customer> {
    return this.executeRequest<Customer>(
      headers,
      '/api/open/v1/customer/profile',
      'GET',
      (context) => {
        return this.successResponse(context.customer, 'Customer profile fetched successfully');
      }
    );
  }

  /**
   * GET /api/open/v1/invoices
   * Get customer invoices with optional filters and pagination
   */
  getInvoices(headers: Partial<OpenAPIHeaders>, params: InvoiceQueryParams = {}): APIResponse<Invoice[]> {
    return this.executeRequest<Invoice[]>(
      headers,
      '/api/open/v1/invoices',
      'GET',
      (context) => {
        // Validate date range
        const dateError = this.validateDateRange(params.fromDate, params.toDate);
        if (dateError) return dateError;

        // Get invoices for this customer only
        let invoices = this.csp.getMockInvoices(context.customer.customerId);

        // Filter by date range
        if (params.fromDate) {
          invoices = invoices.filter(inv => inv.invoiceDate >= params.fromDate!);
        }
        if (params.toDate) {
          invoices = invoices.filter(inv => inv.invoiceDate <= params.toDate!);
        }

        // Filter by status
        if (params.status) {
          invoices = invoices.filter(inv => inv.status === params.status);
        }

        // Paginate
        const { data, pagination } = this.paginate(invoices, params.page, params.pageSize);

        return this.successResponse(data, 'Invoices fetched successfully', pagination);
      }
    );
  }

  /**
   * GET /api/open/v1/invoices/{invoiceNumber}
   * Get invoice details by invoice number
   */
  getInvoiceByNumber(headers: Partial<OpenAPIHeaders>, invoiceNumber: string): APIResponse<Invoice> {
    return this.executeRequest<Invoice>(
      headers,
      `/api/open/v1/invoices/${invoiceNumber}`,
      'GET',
      (context) => {
        const invoice = this.csp.getInvoiceByNumber(invoiceNumber, context.customer.customerId);

        if (!invoice) {
          return this.errorResponse(
            `Invoice ${invoiceNumber} not found or does not belong to your account`,
            API_ERROR_CODES.RESOURCE_NOT_FOUND
          );
        }

        return this.successResponse(invoice, 'Invoice details fetched successfully');
      }
    );
  }

  /**
   * GET /api/open/v1/consumption/summary
   * Get consumption summary
   */
  getConsumptionSummary(headers: Partial<OpenAPIHeaders>, fromDate?: string, toDate?: string): APIResponse<ConsumptionSummary> {
    return this.executeRequest<ConsumptionSummary>(
      headers,
      '/api/open/v1/consumption/summary',
      'GET',
      (context) => {
        // Validate date range
        const dateError = this.validateDateRange(fromDate, toDate);
        if (dateError) return dateError;

        const summary = this.csp.getConsumptionSummary(fromDate, toDate, context.customer.customerId);

        return this.successResponse(summary, 'Consumption summary fetched successfully');
      }
    );
  }

  /**
   * GET /api/open/v1/consumption/transactions
   * Get consumption transactions with filters and pagination
   */
  getConsumptionTransactions(headers: Partial<OpenAPIHeaders>, params: ConsumptionQueryParams = {}): APIResponse<ConsumptionTransaction[]> {
    return this.executeRequest<ConsumptionTransaction[]>(
      headers,
      '/api/open/v1/consumption/transactions',
      'GET',
      (context) => {
        // Validate date range
        const dateError = this.validateDateRange(params.fromDate, params.toDate);
        if (dateError) return dateError;

        // Get transactions for this customer only
        let transactions = this.csp.getMockConsumptionTransactions(context.customer.customerId);

        // Filter by date range
        if (params.fromDate) {
          transactions = transactions.filter(txn => txn.transactionDate >= params.fromDate!);
        }
        if (params.toDate) {
          transactions = transactions.filter(txn => txn.transactionDate <= params.toDate!);
        }

        // Filter by vehicle
        if (params.vehicleNumber) {
          transactions = transactions.filter(txn => txn.vehicleNumber === params.vehicleNumber);
        }

        // Paginate
        const { data, pagination } = this.paginate(transactions, params.page, params.pageSize);

        return this.successResponse(data, 'Consumption transactions fetched successfully', pagination);
      }
    );
  }

  /**
   * GET /api/open/v1/vehicles
   * Get customer vehicles with optional status filter
   */
  getVehicles(headers: Partial<OpenAPIHeaders>, params: VehicleQueryParams = {}): APIResponse<Vehicle[]> {
    return this.executeRequest<Vehicle[]>(
      headers,
      '/api/open/v1/vehicles',
      'GET',
      (context) => {
        // Get vehicles for this customer only
        let vehicles = this.csp.getMockVehicles(context.customer.customerId);

        // Filter by status
        if (params.status) {
          vehicles = vehicles.filter(v => v.status === params.status);
        }

        // Paginate
        const { data, pagination } = this.paginate(vehicles, params.page, params.pageSize);

        return this.successResponse(data, 'Vehicles fetched successfully', pagination);
      }
    );
  }

  /**
   * GET /api/open/v1/vehicles/{vehicleNumber}
   * Get vehicle details by vehicle number
   */
  getVehicleByNumber(headers: Partial<OpenAPIHeaders>, vehicleNumber: string): APIResponse<Vehicle> {
    return this.executeRequest<Vehicle>(
      headers,
      `/api/open/v1/vehicles/${vehicleNumber}`,
      'GET',
      (context) => {
        const vehicle = this.csp.getVehicleByNumber(vehicleNumber, context.customer.customerId);

        if (!vehicle) {
          return this.errorResponse(
            `Vehicle ${vehicleNumber} not found or does not belong to your account`,
            API_ERROR_CODES.RESOURCE_NOT_FOUND
          );
        }

        return this.successResponse(vehicle, 'Vehicle details fetched successfully');
      }
    );
  }

  /**
   * GET /api/open/v1/vehicles/{vehicleNumber}/consumption
   * Get consumption data for a specific vehicle
   */
  getVehicleConsumption(
    headers: Partial<OpenAPIHeaders>,
    vehicleNumber: string,
    params: ConsumptionQueryParams = {}
  ): APIResponse<ConsumptionTransaction[]> {
    return this.executeRequest<ConsumptionTransaction[]>(
      headers,
      `/api/open/v1/vehicles/${vehicleNumber}/consumption`,
      'GET',
      (context) => {
        // First verify the vehicle belongs to this customer
        const vehicle = this.csp.getVehicleByNumber(vehicleNumber, context.customer.customerId);
        if (!vehicle) {
          return this.errorResponse(
            `Vehicle ${vehicleNumber} not found or does not belong to your account`,
            API_ERROR_CODES.RESOURCE_NOT_FOUND
          );
        }

        // Validate date range
        const dateError = this.validateDateRange(params.fromDate, params.toDate);
        if (dateError) return dateError;

        // Get transactions for this vehicle
        let transactions = this.csp.getMockConsumptionTransactions(context.customer.customerId)
          .filter(txn => txn.vehicleNumber === vehicleNumber);

        // Filter by date range
        if (params.fromDate) {
          transactions = transactions.filter(txn => txn.transactionDate >= params.fromDate!);
        }
        if (params.toDate) {
          transactions = transactions.filter(txn => txn.transactionDate <= params.toDate!);
        }

        // Paginate
        const { data, pagination } = this.paginate(transactions, params.page, params.pageSize);

        return this.successResponse(data, 'Vehicle consumption fetched successfully', pagination);
      }
    );
  }

  /**
   * GET /api/open/v1/vehicles/status/{status}
   * Get vehicles filtered by status
   */
  getVehiclesByStatus(headers: Partial<OpenAPIHeaders>, status: VehicleStatus): APIResponse<Vehicle[]> {
    return this.executeRequest<Vehicle[]>(
      headers,
      `/api/open/v1/vehicles/status/${status}`,
      'GET',
      (context) => {
        // Get vehicles for this customer with this status
        const vehicles = this.csp.getMockVehicles(context.customer.customerId)
          .filter(v => v.status === status);

        return this.successResponse(vehicles, `${status} vehicles fetched successfully`);
      }
    );
  }
}
