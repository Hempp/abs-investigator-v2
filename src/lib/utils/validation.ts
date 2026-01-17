import { z } from 'zod';
import { DebtTypeId } from '@/types';

/**
 * Common validation patterns
 */
export const patterns = {
  phone: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
  zip: /^\d{5}(-\d{4})?$/,
  vin: /^[A-HJ-NPR-Z0-9]{17}$/i,
  cusip: /^[A-Z0-9]{9}$/i,
  accountNumber: /^[A-Z0-9-]{4,20}$/i,
  loanNumber: /^[A-Z0-9-]{4,20}$/i,
  ssn: /^\d{3}-?\d{2}-?\d{4}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

/**
 * Common field schemas
 */
export const schemas = {
  // Personal info
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),

  email: z
    .string()
    .email('Invalid email address'),

  phone: z
    .string()
    .regex(patterns.phone, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),

  // Address fields
  street: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address is too long'),

  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City name is too long'),

  state: z
    .string()
    .length(2, 'Use 2-letter state code'),

  zip: z
    .string()
    .regex(patterns.zip, 'Invalid ZIP code'),

  // Financial fields
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(100000000, 'Amount is too large'),

  accountNumber: z
    .string()
    .regex(patterns.accountNumber, 'Invalid account number format'),

  loanNumber: z
    .string()
    .regex(patterns.loanNumber, 'Invalid loan number format'),

  // Vehicle fields
  vin: z
    .string()
    .regex(patterns.vin, 'Invalid VIN format'),

  vehicleYear: z
    .string()
    .regex(/^\d{4}$/, 'Invalid year format')
    .refine(
      (val) => {
        const year = parseInt(val);
        return year >= 1980 && year <= new Date().getFullYear() + 1;
      },
      { message: 'Year must be between 1980 and next year' }
    ),

  // Date fields
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),

  // CUSIP
  cusip: z
    .string()
    .regex(patterns.cusip, 'Invalid CUSIP format'),
};

/**
 * Create debt info validation schema based on debt type
 */
export const createDebtInfoSchema = (debtType: DebtTypeId) => {
  const baseSchema = z.object({
    borrowerName: schemas.name.optional(),
    accountNumber: z.string().optional(),
    loanNumber: z.string().optional(),
    servicer: z.string().optional(),
    servicerName: z.string().optional(),
  });

  switch (debtType) {
    case 'mortgage':
      return baseSchema.extend({
        propertyAddress: z.string().min(5).optional(),
        city: z.string().min(2).optional(),
        state: z.string().length(2).optional(),
        zip: z.string().optional(),
        originalAmount: z.number().positive().optional(),
        originationDate: z.string().optional(),
        originator: z.string().optional(),
      });

    case 'auto':
      return baseSchema.extend({
        vehicleYear: z.string().optional(),
        vehicleMake: z.string().optional(),
        vehicleModel: z.string().optional(),
        vin: z.string().optional(),
        dealership: z.string().optional(),
        originalAmount: z.number().positive().optional(),
        originationDate: z.string().optional(),
      });

    case 'creditCard':
      return baseSchema.extend({
        cardIssuer: z.string().optional(),
        lastFourDigits: z
          .string()
          .regex(/^\d{4}$/, 'Must be 4 digits')
          .optional(),
        creditLimit: z.number().positive().optional(),
        accountOpenDate: z.string().optional(),
      });

    case 'studentLoan':
      return baseSchema.extend({
        schoolName: z.string().optional(),
        loanType: z.string().optional(),
        disbursementDate: z.string().optional(),
        originalLender: z.string().optional(),
        originalAmount: z.number().positive().optional(),
      });

    case 'utility':
      return baseSchema.extend({
        utilityType: z.string().optional(),
        serviceAddress: z.string().optional(),
        utilityCompany: z.string().optional(),
        accountHolder: z.string().optional(),
      });

    case 'personalLoan':
      return baseSchema.extend({
        loanPurpose: z.string().optional(),
        originator: z.string().optional(),
        originalAmount: z.number().positive().optional(),
        originationDate: z.string().optional(),
      });

    case 'medical':
      return baseSchema.extend({
        providerName: z.string().optional(),
        serviceDate: z.string().optional(),
        serviceType: z.string().optional(),
        originalAmount: z.number().positive().optional(),
      });

    case 'telecom':
      return baseSchema.extend({
        accountHolder: z.string().optional(),
        mailingAddress: z.string().optional(),
      });

    default:
      return baseSchema;
  }
};

/**
 * Validate required fields for investigation
 */
export const validateRequiredFields = (
  debtType: DebtTypeId,
  debtInfo: Record<string, unknown>
): { isValid: boolean; missingFields: string[] } => {
  const requiredFieldsMap: Record<DebtTypeId, string[]> = {
    mortgage: ['borrowerName', 'propertyAddress', 'servicer'],
    auto: ['borrowerName', 'servicer'],
    creditCard: ['borrowerName', 'servicer'],
    studentLoan: ['borrowerName', 'servicer'],
    utility: ['accountHolder', 'servicer'],
    personalLoan: ['borrowerName', 'servicer'],
    medical: ['borrowerName', 'servicer'],
    telecom: ['accountHolder', 'servicer'],
  };

  const required = requiredFieldsMap[debtType] || ['borrowerName', 'servicer'];
  const missing: string[] = [];

  for (const field of required) {
    const value = debtInfo[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(field);
    }
  }

  return {
    isValid: missing.length === 0,
    missingFields: missing,
  };
};

/**
 * Sanitize input string (prevent XSS)
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate VIN checksum
 */
export const validateVIN = (vin: string): boolean => {
  if (!patterns.vin.test(vin)) return false;

  const transliteration: Record<string, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
    J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
    S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  };

  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = vin[i].toUpperCase();
    const value = /[0-9]/.test(char)
      ? parseInt(char)
      : transliteration[char] || 0;
    sum += value * weights[i];
  }

  const checkDigit = sum % 11;
  const expectedCheck = checkDigit === 10 ? 'X' : checkDigit.toString();

  return vin[8].toUpperCase() === expectedCheck;
};
