# WOQOD Total Control - Open API Documentation

**Version:** 1.0.0  
**Base URL:** `https://api.woqod.qa/api/open/v1` _(Production)_  
**Base URL:** `http://localhost:4200/api/open/v1` _(Development)_

---

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Response Format](#response-format)
4. [Error Codes](#error-codes)
5. [Endpoints](#endpoints)
   - [Customer Profile](#get-customer-profile)
   - [Invoices](#invoices)
   - [Consumption](#consumption)
   - [Vehicles](#vehicles)
6. [Code Examples](#code-examples)
7. [Best Practices](#best-practices)

---

## Authentication

All API endpoints require authentication using API credentials. Include the following headers in every request:

```
X-API-KEY: your_api_key_here
X-API-SECRET: your_secret_key_here
```

### Generating API Credentials

1. Log in to the WOQOD Total Control customer portal
2. Navigate to **Settings** → **API Integration**
3. Click **Generate API Credentials**
4. **IMPORTANT:** Copy and securely store your Secret Key immediately. It will only be displayed once.

### Security Requirements

- ✅ **Never** expose your Secret Key in client-side code or public repositories
- ✅ Store credentials in environment variables or secure secret managers
- ✅ Use HTTPS for all API requests in production
- ✅ Regenerate credentials immediately if compromised
- ✅ Monitor API usage logs regularly

---

## Rate Limiting

**Limit:** 100 requests per minute per API Key

When the rate limit is exceeded, you'll receive a `429 Too Many Requests` response:

```json
{
  "success": false,
  "message": "Rate limit exceeded. Maximum 100 requests per minute.",
  "errorCode": "RATE_LIMIT_EXCEEDED"
}
```

### Rate Limit Headers _(Future Enhancement)_

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": { ... },
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 100,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "ERROR_CODE"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_API_CREDENTIALS` | 401 | Invalid API Key or Secret |
| `MISSING_API_CREDENTIALS` | 401 | Headers X-API-KEY or X-API-SECRET missing |
| `REVOKED_CREDENTIALS` | 403 | API credentials have been revoked |
| `DISABLED_API_ACCESS` | 403 | API access is disabled |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found or doesn't belong to your account |
| `INVALID_DATE_FORMAT` | 400 | Date must be in YYYY-MM-DD format |
| `INVALID_DATE_RANGE` | 400 | fromDate must be before toDate |
| `INVALID_PAGINATION` | 400 | Invalid page or pageSize parameter |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

---

## Endpoints

### GET Customer Profile

Retrieve your customer profile information.

**Endpoint:** `GET /customer/profile`

**Headers:**
```
X-API-KEY: your_api_key
X-API-SECRET: your_secret_key
```

**Response:**
```json
{
  "success": true,
  "message": "Customer profile fetched successfully",
  "data": {
    "customerId": "CUST-001",
    "customerCode": "00001234",
    "customerName": "Hadad Medical Corporation",
    "customerType": "Corporate",
    "status": "Active",
    "primaryContact": {
      "firstName": "Ahmed",
      "lastName": "Al-Mohannadi",
      "email": "ahmed.almohannadi@hadad-medical.com",
      "phone": "+974-4413-9999"
    },
    "creditLimit": 500000,
    "currency": "QAR"
  }
}
```

---

## Invoices

### GET Invoices

Retrieve a paginated list of your invoices with optional filters.

**Endpoint:** `GET /invoices`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fromDate` | string | No | Filter invoices from this date (YYYY-MM-DD) |
| `toDate` | string | No | Filter invoices until this date (YYYY-MM-DD) |
| `status` | string | No | Filter by status: `Paid`, `Pending`, `Overdue`, `Cancelled`, `Partial` |
| `page` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 20, max: 100) |

**Example Request:**
```
GET /invoices?fromDate=2024-01-01&toDate=2024-05-22&status=Paid&page=1&pageSize=20
```

**Response:**
```json
{
  "success": true,
  "message": "Invoices fetched successfully",
  "data": [
    {
      "invoiceNumber": "INV-2024-05-0123",
      "customerName": "Hadad Medical Corporation",
      "invoiceDate": "2024-05-01",
      "dueDate": "2024-05-31",
      "status": "Paid",
      "totalAmount": 13125.00,
      "paidAmount": 13125.00,
      "balanceAmount": 0,
      "currency": "QAR"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 3,
    "totalPages": 1
  }
}
```

### GET Invoice Details

Retrieve detailed information for a specific invoice.

**Endpoint:** `GET /invoices/{invoiceNumber}`

**Path Parameters:**
- `invoiceNumber` (string, required): The invoice number

**Example Request:**
```
GET /invoices/INV-2024-05-0123
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice details fetched successfully",
  "data": {
    "invoiceNumber": "INV-2024-05-0123",
    "customerName": "Hadad Medical Corporation",
    "invoiceDate": "2024-05-01",
    "dueDate": "2024-05-31",
    "status": "Paid",
    "subtotal": 12500.00,
    "taxAmount": 625.00,
    "totalAmount": 13125.00,
    "paidAmount": 13125.00,
    "balanceAmount": 0,
    "currency": "QAR",
    "paymentTerms": "Net 30",
    "billingPeriodStart": "2024-04-01",
    "billingPeriodEnd": "2024-04-30",
    "lines": [
      {
        "lineNumber": 1,
        "description": "Premium Fuel - Vehicle #QAT-12345",
        "quantity": 500,
        "unitPrice": 10.00,
        "lineTotal": 5000.00,
        "taxAmount": 250.00,
        "category": "Fuel"
      }
    ]
  }
}
```

---

## Consumption

### GET Consumption Summary

Retrieve aggregated consumption summary by fuel type and vehicle.

**Endpoint:** `GET /consumption/summary`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fromDate` | string | No | Summary from this date (YYYY-MM-DD) |
| `toDate` | string | No | Summary until this date (YYYY-MM-DD) |

**Example Request:**
```
GET /consumption/summary?fromDate=2024-05-01&toDate=2024-05-22
```

**Response:**
```json
{
  "success": true,
  "message": "Consumption summary fetched successfully",
  "data": {
    "periodStart": "2024-05-01",
    "periodEnd": "2024-05-22",
    "totalTransactions": 5,
    "totalQuantity": 341.2,
    "totalAmount": 651.87,
    "currency": "QAR",
    "byFuelType": [
      {
        "fuelType": "Petrol",
        "transactions": 3,
        "quantity": 125.7,
        "amount": 263.97
      },
      {
        "fuelType": "Diesel",
        "transactions": 2,
        "quantity": 215.5,
        "amount": 387.90
      }
    ],
    "byVehicle": [
      {
        "vehicleNumber": "QAT-12345",
        "transactions": 3,
        "quantity": 125.7,
        "amount": 263.97
      }
    ],
    "topStations": [
      {
        "stationCode": "STN-001",
        "stationName": "WOQOD Petrol Station - Doha Main",
        "transactions": 2,
        "amount": 183.75
      }
    ]
  }
}
```

### GET Consumption Transactions

Retrieve detailed transaction-level consumption records.

**Endpoint:** `GET /consumption/transactions`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fromDate` | string | No | Filter transactions from this date |
| `toDate` | string | No | Filter transactions until this date |
| `vehicleNumber` | string | No | Filter by vehicle number |
| `page` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 20, max: 100) |

**Example Request:**
```
GET /consumption/transactions?vehicleNumber=QAT-12345&page=1&pageSize=10
```

**Response:**
```json
{
  "success": true,
  "message": "Consumption transactions fetched successfully",
  "data": [
    {
      "transactionId": "TXN-2024-05-0245",
      "vehicleNumber": "QAT-12345",
      "stationName": "WOQOD Petrol Station - Doha Main",
      "fuelType": "Petrol",
      "quantity": 45.5,
      "unitPrice": 2.10,
      "totalAmount": 95.55,
      "transactionDate": "2024-05-21",
      "transactionTime": "14:35:00",
      "driverName": "Ahmed Al-Mohannadi",
      "odometerReading": 45230
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalRecords": 3,
    "totalPages": 1
  }
}
```

---

## Vehicles

### GET Vehicles

Retrieve a list of your registered vehicles.

**Endpoint:** `GET /vehicles`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: `Active`, `Suspended`, `Inactive`, `Terminated` |
| `page` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 20, max: 100) |

**Example Request:**
```
GET /vehicles?status=Active
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicles fetched successfully",
  "data": [
    {
      "vehicleId": "VEH-001",
      "vehicleNumber": "QAT-12345",
      "vehicleType": "Car",
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "fuelType": "Petrol",
      "status": "Active",
      "driverName": "Ahmed Al-Mohannadi",
      "currentMonthUsage": 8500.00,
      "monthlyLimit": 15000.00,
      "lastTransactionDate": "2024-05-21"
    }
  ]
}
```

### GET Vehicle Details

Retrieve detailed information for a specific vehicle.

**Endpoint:** `GET /vehicles/{vehicleNumber}`

**Path Parameters:**
- `vehicleNumber` (string, required): The vehicle plate number

**Example Request:**
```
GET /vehicles/QAT-12345
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle details fetched successfully",
  "data": {
    "vehicleId": "VEH-001",
    "vehicleNumber": "QAT-12345",
    "vehicleType": "Car",
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "color": "White",
    "fuelType": "Petrol",
    "status": "Active",
    "registrationDate": "2022-01-15",
    "driverName": "Ahmed Al-Mohannadi",
    "driverPhone": "+974-5555-1234",
    "dailyLimit": 500.00,
    "monthlyLimit": 15000.00,
    "currentMonthUsage": 8500.00,
    "lastTransactionDate": "2024-05-21"
  }
}
```

### GET Vehicle Consumption

Retrieve consumption data for a specific vehicle.

**Endpoint:** `GET /vehicles/{vehicleNumber}/consumption`

**Path Parameters:**
- `vehicleNumber` (string, required): The vehicle plate number

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fromDate` | string | No | Filter from this date |
| `toDate` | string | No | Filter until this date |
| `page` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 20, max: 100) |

**Example Request:**
```
GET /vehicles/QAT-12345/consumption?fromDate=2024-05-01
```

### GET Vehicles by Status

Retrieve vehicles filtered by status.

**Endpoint:** `GET /vehicles/status/{status}`

**Path Parameters:**
- `status` (string, required): One of: `Active`, `Suspended`, `Inactive`, `Terminated`

**Example Request:**
```
GET /vehicles/status/Active
```

---

## Code Examples

### JavaScript (Fetch API)

```javascript
const apiKey = process.env.WOQOD_API_KEY;
const apiSecret = process.env.WOQOD_API_SECRET;

async function getInvoices() {
  const response = await fetch('https://api.woqod.qa/api/open/v1/invoices?page=1&pageSize=20', {
    method: 'GET',
    headers: {
      'X-API-KEY': apiKey,
      'X-API-SECRET': apiSecret,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  console.log(data);
}

getInvoices();
```

### Python (requests)

```python
import os
import requests

api_key = os.getenv('WOQOD_API_KEY')
api_secret = os.getenv('WOQOD_API_SECRET')

headers = {
    'X-API-KEY': api_key,
    'X-API-SECRET': api_secret
}

response = requests.get(
    'https://api.woqod.qa/api/open/v1/invoices',
    headers=headers,
    params={'page': 1, 'pageSize': 20}
)

data = response.json()
print(data)
```

### cURL

```bash
curl -X GET "https://api.woqod.qa/api/open/v1/invoices?page=1&pageSize=20" \
  -H "X-API-KEY: your_api_key_here" \
  -H "X-API-SECRET: your_secret_key_here"
```

### Node.js (Axios)

```javascript
const axios = require('axios');

const apiKey = process.env.WOQOD_API_KEY;
const apiSecret = process.env.WOQOD_API_SECRET;

axios.get('https://api.woqod.qa/api/open/v1/invoices', {
  headers: {
    'X-API-KEY': apiKey,
    'X-API-SECRET': apiSecret
  },
  params: {
    page: 1,
    pageSize: 20
  }
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error('Error:', error.response.data);
});
```

---

## Best Practices

### 1. Secure Credential Storage

❌ **Don't** hardcode credentials:
```javascript
const apiKey = 'csp_00001234_1234567890_abc123';  // DON'T DO THIS
```

✅ **Do** use environment variables:
```javascript
const apiKey = process.env.WOQOD_API_KEY;
```

### 2. Handle Rate Limits Gracefully

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      // Wait 60 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 60000));
      continue;
    }
    
    return response;
  }
  throw new Error('Max retries exceeded');
}
```

### 3. Implement Proper Error Handling

```javascript
async function getInvoices() {
  try {
    const response = await fetch(endpoint, { headers });
    const data = await response.json();
    
    if (!data.success) {
      console.error(`Error: ${data.errorCode} - ${data.message}`);
      return;
    }
    
    // Process successful response
    processInvoices(data.data);
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

### 4. Use Pagination Efficiently

```javascript
async function getAllInvoices() {
  let allInvoices = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await getInvoices({ page, pageSize: 100 });
    allInvoices = allInvoices.concat(response.data);
    
    hasMore = page < response.pagination.totalPages;
    page++;
  }

  return allInvoices;
}
```

### 5. Monitor API Usage

- Regularly check your API request logs in the portal
- Set up alerts for unusual activity
- Review consumption patterns monthly
- Rotate credentials periodically (every 90 days recommended)

---

## Support

For technical support or questions:

- **Email:** api-support@woqod.qa
- **Portal:** Settings → API Integration → View API Logs
- **Status Page:** https://status.woqod.qa

---

**Last Updated:** May 2024  
**API Version:** v1.0.0
