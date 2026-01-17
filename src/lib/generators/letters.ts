import { DebtInfo, DebtTypeId, Trust } from '@/types';
import { getServicer } from '../database/servicers';
import { formatCurrency, formatDate } from '../utils/format';

interface LetterData {
  debtType: DebtTypeId;
  debtInfo: DebtInfo;
  trust: Trust | null;
  servicerAddress: string;
}

/**
 * Generate common header for all letters
 */
const generateLetterHeader = (
  borrowerName: string,
  borrowerAddress: string,
  servicerName: string,
  servicerAddress: string,
  accountNumber: string
): string => {
  const today = formatDate(new Date().toISOString());

  return `${borrowerName}
${borrowerAddress}

${today}

${servicerName}
${servicerAddress}

Re: Account Number: ${accountNumber}

To Whom It May Concern:

`;
};

/**
 * Generate QWR letter body for mortgage debts
 */
const generateMortgageQWR = (data: LetterData): string => {
  const { debtInfo, trust } = data;

  let body = `This is a "Qualified Written Request" under Section 6 of the Real Estate Settlement Procedures Act (RESPA), 12 U.S.C. §2605.

I am writing to request specific information regarding my mortgage loan. I believe my loan may have been securitized and sold into a trust. Based on my research, I have reason to believe my loan may be part of ${trust ? trust.name : 'an asset-backed securities trust'}.

Please provide the following information:

1. OWNERSHIP & CHAIN OF TITLE
   - The complete chain of title showing all assignments, transfers, and sales of my note and mortgage from origination to present
   - All allonges and endorsements on my promissory note
   - The current owner/holder of my original promissory note
   - The name and address of the investor or trust that holds beneficial interest in my loan

2. SECURITIZATION DOCUMENTATION
   - Confirmation of whether my loan was included in any securitized trust
   - The Pooling and Servicing Agreement (PSA) if securitized
   - The loan schedule showing my specific loan in any trust
   - CUSIP numbers associated with my loan

3. PAYMENT HISTORY
   - Complete payment history from loan origination to present
   - All fees and charges assessed to my account with explanations
   - All escrow account statements and analyses

4. SERVICING DOCUMENTATION
   - Copy of the current servicing agreement
   - Your authority to service this loan`;

  if (debtInfo.propertyAddress) {
    body += `

Property Address: ${debtInfo.propertyAddress}${debtInfo.city ? `, ${debtInfo.city}` : ''}${debtInfo.state ? `, ${debtInfo.state}` : ''} ${debtInfo.zip || ''}`;
  }

  if (debtInfo.originalAmount) {
    body += `
Original Loan Amount: ${formatCurrency(debtInfo.originalAmount)}`;
  }

  if (debtInfo.originationDate) {
    body += `
Origination Date: ${formatDate(debtInfo.originationDate)}`;
  }

  return body;
};

/**
 * Generate debt validation letter for auto loans
 */
const generateAutoValidation = (data: LetterData): string => {
  const { debtInfo, trust } = data;

  let body = `This is a formal debt validation request pursuant to the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g.

I am requesting validation of the auto loan debt you claim I owe. My research indicates this loan may have been securitized${trust ? ` into ${trust.name}` : ''}.

Please provide the following:

1. OWNERSHIP VERIFICATION
   - Proof that you own this debt or are authorized to collect it
   - The complete chain of ownership from the original creditor
   - Copy of the original retail installment contract with my signature
   - Bill of sale or assignment document transferring this debt

2. SECURITIZATION INFORMATION
   - Whether this loan has been securitized
   - The name of any trust containing this loan
   - The Pooling and Servicing Agreement if applicable

3. ACCOUNT DOCUMENTATION
   - Complete account statements from origination
   - All payment applications and calculations
   - Current payoff amount with itemized breakdown

4. TITLE DOCUMENTATION
   - Status of the vehicle title
   - Any lien releases or assignments`;

  if (debtInfo.vehicleYear && debtInfo.vehicleMake && debtInfo.vehicleModel) {
    body += `

Vehicle: ${debtInfo.vehicleYear} ${debtInfo.vehicleMake} ${debtInfo.vehicleModel}`;
  }

  if (debtInfo.vin) {
    body += `
VIN: ${debtInfo.vin}`;
  }

  return body;
};

/**
 * Generate debt validation letter for credit card debt
 */
const generateCreditCardValidation = (data: LetterData): string => {
  const { debtInfo, trust } = data;

  let body = `This is a formal debt validation request pursuant to the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g.

I am requesting validation of the credit card debt you claim I owe. My research indicates this account may have been securitized${trust ? ` into ${trust.name}` : ''}.

Please provide:

1. PROOF OF DEBT
   - Original credit card agreement with my signature
   - Complete account statements from account opening to charge-off
   - Proof you are authorized to collect this debt
   - Chain of assignment from original creditor

2. SECURITIZATION DOCUMENTATION
   - Whether this account was included in any securitized trust
   - Master trust documentation if applicable
   - Proof of ownership interest

3. ACCOUNT CALCULATIONS
   - Principal balance at charge-off
   - Interest calculations since charge-off
   - All fees and charges with explanations
   - Detailed accounting of claimed balance`;

  if (debtInfo.cardIssuer) {
    body += `

Original Issuer: ${debtInfo.cardIssuer}`;
  }

  if (debtInfo.lastFourDigits) {
    body += `
Account ending in: ${debtInfo.lastFourDigits}`;
  }

  return body;
};

/**
 * Generate debt validation letter for student loans
 */
const generateStudentLoanValidation = (data: LetterData): string => {
  const { debtInfo, trust } = data;

  let body = `This is a formal request for documentation regarding my student loan pursuant to applicable federal and state laws.

I believe my student loan has been securitized${trust ? ` and may be part of ${trust.name}` : ''}. Please provide:

1. LOAN OWNERSHIP
   - Current holder of my promissory note
   - Complete chain of ownership and assignment
   - Copy of original Master Promissory Note
   - All endorsements and assignments

2. SECURITIZATION INFORMATION
   - Confirmation of trust inclusion
   - Pooling and Servicing Agreement
   - CUSIP numbers associated with my loans

3. PAYMENT HISTORY
   - Complete payment history from disbursement
   - How payments were applied (principal, interest, fees)
   - All forbearance and deferment periods

4. SERVICER AUTHORITY
   - Servicing agreement
   - Proof of authority to service these loans`;

  if (debtInfo.schoolName) {
    body += `

School: ${debtInfo.schoolName}`;
  }

  if (debtInfo.loanType) {
    body += `
Loan Type: ${debtInfo.loanType}`;
  }

  return body;
};

/**
 * Generate generic debt validation letter
 */
const generateGenericValidation = (data: LetterData): string => {
  const { trust } = data;

  return `This is a formal debt validation request pursuant to the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g.

I am requesting validation of the debt you claim I owe. My research indicates this debt may have been securitized${trust ? ` into ${trust.name}` : ''}.

Please provide:

1. PROOF OF DEBT
   - Original signed agreement or contract
   - Complete account history
   - Proof of ownership of this debt
   - Chain of assignment from original creditor

2. SECURITIZATION DOCUMENTATION
   - Whether this debt was securitized
   - Trust documentation if applicable
   - Proof of beneficial ownership

3. ACCOUNT DETAILS
   - Itemized breakdown of amount claimed
   - All fees and interest calculations
   - Accounting of all payments received

Please note that under the FDCPA, you must cease collection activities until you have provided the requested validation.`;
};

/**
 * Generate letter closing
 */
const generateLetterClosing = (borrowerName: string): string => {
  return `

Please respond within 30 days as required by law. Until proper validation is received, please cease all collection activity on this account.

I reserve all rights under applicable federal and state laws.

Sincerely,



${borrowerName}

---
NOTICE: This letter is sent via certified mail with return receipt requested. Please keep a copy for your records.`;
};

/**
 * Main function to generate complete letter
 */
export const generateLetter = (data: LetterData): string => {
  const { debtType, debtInfo, trust } = data;

  // Get borrower name and address
  const borrowerName = debtInfo.borrowerName || debtInfo.accountHolder || '[YOUR NAME]';
  const borrowerAddress =
    debtInfo.mailingAddress ||
    [debtInfo.propertyAddress, debtInfo.city, debtInfo.state, debtInfo.zip]
      .filter(Boolean)
      .join(', ') ||
    '[YOUR ADDRESS]';

  // Get servicer info
  const servicer = debtInfo.servicer
    ? getServicer(debtType, debtInfo.servicer)
    : null;
  const servicerName =
    servicer?.name || debtInfo.servicerName || '[SERVICER NAME]';
  const servicerAddress = servicer?.address || data.servicerAddress || '[SERVICER ADDRESS]';

  // Get account number
  const accountNumber =
    debtInfo.accountNumber || debtInfo.loanNumber || '[ACCOUNT NUMBER]';

  // Build letter
  let letter = generateLetterHeader(
    borrowerName,
    borrowerAddress,
    servicerName,
    servicerAddress,
    accountNumber
  );

  // Add type-specific body
  switch (debtType) {
    case 'mortgage':
      letter += generateMortgageQWR(data);
      break;
    case 'auto':
      letter += generateAutoValidation(data);
      break;
    case 'creditCard':
      letter += generateCreditCardValidation(data);
      break;
    case 'studentLoan':
      letter += generateStudentLoanValidation(data);
      break;
    default:
      letter += generateGenericValidation(data);
  }

  // Add trust-specific information if available
  if (trust) {
    letter += `

SECURITIZATION RESEARCH FINDINGS:

Based on my research, I have identified the following potential securitization:

Trust Name: ${trust.name}
Trustee: ${trust.trustee}
Trust ID: ${trust.trustId}
Match Score: ${trust.matchScore}%

Match Reasons:
${trust.matchReasons.map((r) => `- ${r}`).join('\n')}

${
  trust.cusips.length > 0
    ? `Associated CUSIPs:
${trust.cusips.map((c) => `- ${c.cusip} (${c.tranche}, ${c.rating})`).join('\n')}`
    : ''
}`;
  }

  letter += generateLetterClosing(borrowerName);

  return letter;
};

/**
 * Get letter type description based on debt type
 */
export const getLetterTypeDescription = (debtType: DebtTypeId): string => {
  switch (debtType) {
    case 'mortgage':
      return 'Qualified Written Request (QWR)';
    case 'auto':
    case 'creditCard':
    case 'studentLoan':
    case 'personalLoan':
    case 'medical':
    case 'utility':
    case 'telecom':
      return 'Debt Validation Letter';
    default:
      return 'Debt Validation Letter';
  }
};
