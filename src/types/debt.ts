import { LucideIcon } from 'lucide-react';

export type DebtTypeId =
  | 'mortgage'
  | 'auto'
  | 'utility'
  | 'creditCard'
  | 'studentLoan'
  | 'personalLoan'
  | 'medical'
  | 'telecom';

export type DebtColor =
  | 'amber'
  | 'blue'
  | 'yellow'
  | 'purple'
  | 'green'
  | 'pink'
  | 'red'
  | 'cyan';

export interface DebtTypeFields {
  required: (keyof DebtInfo)[];
  optional: (keyof DebtInfo)[];
}

export interface DebtType {
  id: DebtTypeId;
  name: string;
  icon: LucideIcon;
  color: DebtColor;
  description: string;
  fields: DebtTypeFields;
}

export interface DebtInfo {
  // Common fields
  borrowerName?: string;
  loanNumber?: string;
  accountNumber?: string;

  // Mortgage fields
  propertyAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  originalAmount?: number;
  originationDate?: string;
  originator?: string;

  // Auto fields
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vin?: string;
  dealership?: string;

  // Utility fields
  utilityType?: string;
  serviceAddress?: string;
  utilityCompany?: string;

  // Credit Card fields
  cardIssuer?: string;
  lastFourDigits?: string;
  creditLimit?: number;
  accountOpenDate?: string;

  // Student Loan fields
  schoolName?: string;
  loanType?: string;
  disbursementDate?: string;
  originalLender?: string;

  // Personal Loan fields
  loanPurpose?: string;

  // Medical fields
  providerName?: string;
  serviceDate?: string;
  serviceType?: string;

  // Servicer
  servicer?: string;
  servicerName?: string;
  currentServicer?: string;

  // Balance
  currentBalance?: number;

  // Additional
  mailingAddress?: string;
  accountHolder?: string;
}

export interface Servicer {
  id: string;
  name: string;
  address: string;
  trusts: string[];
}

export interface ServicersDatabase {
  [debtType: string]: {
    [servicerId: string]: Servicer;
  };
}
