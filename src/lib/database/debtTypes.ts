import {
  Home,
  Car,
  Zap,
  CreditCard,
  GraduationCap,
  Wallet,
  Heart,
  Phone,
  LucideIcon,
} from 'lucide-react';
import { DebtType, DebtTypeId, DebtColor } from '@/types';

export const DEBT_TYPES: Record<DebtTypeId, DebtType> = {
  mortgage: {
    id: 'mortgage',
    name: 'Mortgage',
    icon: Home,
    color: 'amber',
    description: 'Residential and commercial mortgages securitized into RMBS/CMBS',
    fields: {
      required: ['borrowerName', 'propertyAddress', 'loanNumber', 'originalAmount'],
      optional: ['city', 'state', 'zip', 'originationDate', 'originator', 'servicer', 'currentBalance', 'currentServicer'],
    },
  },
  auto: {
    id: 'auto',
    name: 'Auto Loan',
    icon: Car,
    color: 'blue',
    description: 'Vehicle loans packaged into auto loan ABS',
    fields: {
      required: ['borrowerName', 'vehicleMake', 'vehicleModel', 'loanNumber'],
      optional: ['vehicleYear', 'vin', 'originalAmount', 'originationDate', 'dealership', 'servicer', 'currentBalance', 'currentServicer'],
    },
  },
  utility: {
    id: 'utility',
    name: 'Utility Bill',
    icon: Zap,
    color: 'yellow',
    description: 'Utility receivables sold to collection trusts',
    fields: {
      required: ['accountHolder', 'accountNumber', 'utilityType'],
      optional: ['serviceAddress', 'utilityCompany', 'servicer', 'currentBalance', 'currentServicer'],
    },
  },
  creditCard: {
    id: 'creditCard',
    name: 'Credit Card',
    icon: CreditCard,
    color: 'purple',
    description: 'Credit card receivables securitized into card ABS',
    fields: {
      required: ['borrowerName', 'cardIssuer', 'accountNumber'],
      optional: ['lastFourDigits', 'creditLimit', 'accountOpenDate', 'servicer', 'currentBalance', 'currentServicer'],
    },
  },
  studentLoan: {
    id: 'studentLoan',
    name: 'Student Loan',
    icon: GraduationCap,
    color: 'green',
    description: 'Private student loans in SLABS trusts',
    fields: {
      required: ['borrowerName', 'schoolName', 'loanNumber', 'originalAmount'],
      optional: ['loanType', 'disbursementDate', 'originalLender', 'servicer', 'currentBalance', 'currentServicer'],
    },
  },
  personalLoan: {
    id: 'personalLoan',
    name: 'Personal Loan',
    icon: Wallet,
    color: 'pink',
    description: 'Unsecured personal loans in consumer ABS',
    fields: {
      required: ['borrowerName', 'loanNumber', 'originalAmount'],
      optional: ['originationDate', 'loanPurpose', 'originator', 'servicer', 'currentBalance', 'currentServicer'],
    },
  },
  medical: {
    id: 'medical',
    name: 'Medical Debt',
    icon: Heart,
    color: 'red',
    description: 'Healthcare receivables sold to collection entities',
    fields: {
      required: ['borrowerName', 'providerName', 'accountNumber'],
      optional: ['originalAmount', 'serviceDate', 'serviceType', 'servicer', 'currentBalance', 'currentServicer'],
    },
  },
  telecom: {
    id: 'telecom',
    name: 'Telecom',
    icon: Phone,
    color: 'cyan',
    description: 'Telecommunications receivables in specialty ABS',
    fields: {
      required: ['accountHolder', 'accountNumber'],
      optional: ['mailingAddress', 'servicer', 'currentBalance', 'currentServicer'],
    },
  },
};

export const getDebtType = (id: DebtTypeId): DebtType => DEBT_TYPES[id];

export const getDebtTypeIcon = (id: DebtTypeId): LucideIcon => DEBT_TYPES[id].icon;

export const getDebtTypeColor = (id: DebtTypeId): DebtColor => DEBT_TYPES[id].color;

export const getAllDebtTypes = (): DebtType[] => Object.values(DEBT_TYPES);

export const getDebtTypeFields = (id: DebtTypeId) => DEBT_TYPES[id].fields;
