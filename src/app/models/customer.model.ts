export interface Address {
  country: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
}

export interface PrimaryContact {
  prefix?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  jobTitle?: string;
  email: string;
  phone: string;
  phoneExtension?: string;
}

export interface Customer {
  customerId: string;
  customerCode: string;
  customerName: string;
  partyNumber?: string;
  customerType: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdDate?: string;
  registryId?: string;
  businessClassification?: string;
  businessSubClassification?: string;
  accountType?: string;
  accountDescription?: string;
  primaryContact: PrimaryContact;
  registeredAddress: Address;
  billingAddress: Address;
  servicesEnabled: string[];
  paymentTerms: string;
  paymentMethod?: string;
  accountModel?: string;
  creditLimit: number;
  currency: string;
  lastApprovedDate?: string;
}

export interface SessionUser {
  username: string;
  fullName: string;
  customerId: string;
  customerCode: string;
  customerName: string;
}
