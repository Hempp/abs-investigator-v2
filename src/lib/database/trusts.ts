import { TrustDatabase, TrustData, DebtTypeId } from '@/types';

export const TRUST_DB: TrustDatabase = {
  // Mortgage RMBS Trusts
  CWABS: {
    name: 'Countrywide Asset-Backed Securities',
    type: 'mortgage',
    trustee: 'Bank of New York Mellon',
    years: ['2004', '2005', '2006', '2007', '2008'],
    series: ['OA', 'BC', 'IMC', 'SD'],
  },
  GSAMP: {
    name: 'Goldman Sachs Alternative Mortgage Products',
    type: 'mortgage',
    trustee: 'Deutsche Bank National Trust',
    years: ['2005', '2006', '2007'],
    series: ['HE', 'NC', 'FV'],
  },
  RALI: {
    name: 'Residential Accredit Loans Inc',
    type: 'mortgage',
    trustee: 'US Bank National Association',
    years: ['2005', '2006', '2007', '2008'],
    series: ['QS', 'QA', 'QH', 'QO'],
  },
  WMALT: {
    name: 'Washington Mutual Alternative Mortgage',
    type: 'mortgage',
    trustee: 'Deutsche Bank National Trust',
    years: ['2005', '2006', '2007'],
    series: ['AR', 'OC', 'IA'],
  },
  JPMMT: {
    name: 'J.P. Morgan Mortgage Trust',
    type: 'mortgage',
    trustee: 'US Bank National Association',
    years: ['2005', '2006', '2007', '2008'],
    series: ['A', 'B', 'C', 'LTV'],
  },
  CSMC: {
    name: 'Credit Suisse Mortgage Capital',
    type: 'mortgage',
    trustee: 'Wells Fargo Bank',
    years: ['2006', '2007', '2008'],
    series: ['HE', 'LX', 'NC'],
  },
  MSM: {
    name: 'Morgan Stanley Mortgage Loan Trust',
    type: 'mortgage',
    trustee: 'Bank of New York Mellon',
    years: ['2005', '2006', '2007'],
    series: ['AR', 'SL', 'IO'],
  },
  MLMI: {
    name: 'Merrill Lynch Mortgage Investors',
    type: 'mortgage',
    trustee: 'Bank of New York Mellon',
    years: ['2005', '2006', '2007'],
    series: ['HE', 'NC', 'AR'],
  },
  BSABS: {
    name: 'Bear Stearns Asset Backed Securities',
    type: 'mortgage',
    trustee: 'Bank of New York Mellon',
    years: ['2005', '2006', '2007'],
    series: ['HE', 'AR', 'EC'],
  },
  BCAP: {
    name: 'Bear Stearns ARM Trust',
    type: 'mortgage',
    trustee: 'Bank of New York Mellon',
    years: ['2005', '2006', '2007'],
    series: ['LLC'],
  },
  WAMU: {
    name: 'Washington Mutual Mortgage',
    type: 'mortgage',
    trustee: 'Deutsche Bank National Trust',
    years: ['2004', '2005', '2006', '2007'],
    series: ['AR', 'HE', 'MSC'],
  },
  GSAA: {
    name: 'Goldman Sachs Alt-A Securities',
    type: 'mortgage',
    trustee: 'Deutsche Bank National Trust',
    years: ['2005', '2006', '2007'],
    series: ['FV', 'MT', 'AF'],
  },
  SARM: {
    name: 'Structured Adjustable Rate Mortgage',
    type: 'mortgage',
    trustee: 'US Bank National Association',
    years: ['2005', '2006', '2007'],
    series: ['AR', 'SL'],
  },
  CWALT: {
    name: 'Countrywide Alternative Loan Trust',
    type: 'mortgage',
    trustee: 'Bank of New York Mellon',
    years: ['2005', '2006', '2007'],
    series: ['RS', 'OC', 'NL'],
  },
  RAST: {
    name: 'Residential Asset Securitization Trust',
    type: 'mortgage',
    trustee: 'Bank of New York Mellon',
    years: ['2005', '2006', '2007'],
    series: ['A', 'B', 'C'],
  },
  INDX: {
    name: 'IndyMac INDX Mortgage Loan Trust',
    type: 'mortgage',
    trustee: 'Deutsche Bank National Trust',
    years: ['2005', '2006', '2007'],
    series: ['AR', 'FP'],
  },
  OPTM: {
    name: 'Option One Mortgage Loan Trust',
    type: 'mortgage',
    trustee: 'Wells Fargo Bank',
    years: ['2005', '2006', '2007'],
    series: ['PN', 'HE', 'NC'],
  },
  CARR: {
    name: 'Carrington Mortgage Loan Trust',
    type: 'mortgage',
    trustee: 'Wilmington Trust',
    years: ['2006', '2007', '2008'],
    series: ['NC', 'HE', 'FRE'],
  },
  NCMT: {
    name: 'New Century Mortgage Trust',
    type: 'mortgage',
    trustee: 'Deutsche Bank National Trust',
    years: ['2005', '2006', '2007'],
    series: ['HE', 'NC', 'SL'],
  },
  SABR: {
    name: 'Securitized Asset Backed Receivables',
    type: 'mortgage',
    trustee: 'Bank of New York Mellon',
    years: ['2005', '2006', '2007'],
    series: ['HE', 'AR', 'NC'],
  },
  SLSR: {
    name: 'Specialized Loan Servicing RMBS',
    type: 'mortgage',
    trustee: 'US Bank National Association',
    years: ['2006', '2007', '2008'],
    series: ['A', 'B', 'C'],
  },

  // Auto Loan ABS
  SDART: {
    name: 'Santander Drive Auto Receivables Trust',
    type: 'auto',
    trustee: 'Wilmington Trust',
    years: ['2018', '2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C', 'D', 'E'],
  },
  DRIVE: {
    name: 'Drive Auto Receivables Trust',
    type: 'auto',
    trustee: 'Wilmington Trust',
    years: ['2018', '2019', '2020', '2021', '2022'],
    series: ['A', 'B', 'C'],
  },
  ALLY: {
    name: 'Ally Auto Receivables Trust',
    type: 'auto',
    trustee: 'Bank of New York Mellon',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C'],
  },
  COAFT: {
    name: 'Capital One Auto Finance Trust',
    type: 'auto',
    trustee: 'Bank of New York Mellon',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C'],
  },
  CARMX: {
    name: 'CarMax Auto Owner Trust',
    type: 'auto',
    trustee: 'US Bank National Association',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C', 'D'],
  },
  WLAKE: {
    name: 'Westlake Automobile Receivables Trust',
    type: 'auto',
    trustee: 'Wilmington Trust',
    years: ['2018', '2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C', 'D'],
  },
  SCUSA: {
    name: 'Santander Consumer USA',
    type: 'auto',
    trustee: 'Wilmington Trust',
    years: ['2018', '2019', '2020', '2021', '2022'],
    series: ['A', 'B', 'C'],
  },
  AMCAR: {
    name: 'AmeriCredit Automobile Receivables',
    type: 'auto',
    trustee: 'Bank of New York Mellon',
    years: ['2018', '2019', '2020', '2021', '2022'],
    series: ['A', 'B', 'C'],
  },
  DT: {
    name: 'DriveTime Automotive Group Trust',
    type: 'auto',
    trustee: 'Wilmington Trust',
    years: ['2018', '2019', '2020', '2021', '2022'],
    series: ['A', 'B', 'C'],
  },
  EXTRN: {
    name: 'Exeter Automobile Receivables Trust',
    type: 'auto',
    trustee: 'Wilmington Trust',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C'],
  },

  // Utility Receivables
  APSUT: {
    name: 'APS Utility Receivables Trust',
    type: 'utility',
    trustee: 'Wells Fargo Bank',
    years: ['2019', '2020', '2021', '2022'],
    series: ['A', 'B'],
  },
  DKEUT: {
    name: 'Duke Energy Utility Receivables',
    type: 'utility',
    trustee: 'Bank of New York Mellon',
    years: ['2019', '2020', '2021', '2022'],
    series: ['A', 'B'],
  },
  PGEUR: {
    name: 'PG&E Utility Receivables',
    type: 'utility',
    trustee: 'US Bank National Association',
    years: ['2019', '2020', '2021', '2022'],
    series: ['A'],
  },
  SOUTL: {
    name: 'Southern Company Utility Trust',
    type: 'utility',
    trustee: 'Wells Fargo Bank',
    years: ['2019', '2020', '2021', '2022'],
    series: ['A', 'B'],
  },
  NRGUT: {
    name: 'NRG Utility Receivables Trust',
    type: 'utility',
    trustee: 'Wilmington Trust',
    years: ['2020', '2021', '2022'],
    series: ['A'],
  },

  // Credit Card ABS
  SYNCC: {
    name: 'Synchrony Credit Card Master Note Trust',
    type: 'creditCard',
    trustee: 'US Bank National Association',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C'],
  },
  DCENT: {
    name: 'Discover Card Execution Note Trust',
    type: 'creditCard',
    trustee: 'Bank of New York Mellon',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B'],
  },
  CITCC: {
    name: 'Citibank Credit Card Issuance Trust',
    type: 'creditCard',
    trustee: 'Deutsche Bank National Trust',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C', 'D'],
  },
  CHAIT: {
    name: 'Chase Issuance Trust',
    type: 'creditCard',
    trustee: 'US Bank National Association',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C'],
  },
  AMXCA: {
    name: 'American Express Credit Account Master Trust',
    type: 'creditCard',
    trustee: 'Bank of New York Mellon',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B'],
  },
  COMET: {
    name: 'Capital One Multi-Asset Execution Trust',
    type: 'creditCard',
    trustee: 'Wilmington Trust',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C'],
  },
  GECCN: {
    name: 'GE Capital Credit Card Master Note',
    type: 'creditCard',
    trustee: 'Deutsche Bank National Trust',
    years: ['2018', '2019', '2020', '2021'],
    series: ['A', 'B'],
  },

  // Student Loan ABS
  SLABS: {
    name: 'Student Loan Asset-Backed Securities',
    type: 'studentLoan',
    trustee: 'Bank of New York Mellon',
    years: ['2015', '2016', '2017', '2018', '2019', '2020', '2021'],
    series: ['A', 'B', 'C'],
  },
  NAVSL: {
    name: 'Navient Student Loan Trust',
    type: 'studentLoan',
    trustee: 'Wilmington Trust',
    years: ['2016', '2017', '2018', '2019', '2020', '2021', '2022'],
    series: ['A', 'B', 'C'],
  },
  NELLT: {
    name: 'Nelnet Student Loan Trust',
    type: 'studentLoan',
    trustee: 'US Bank National Association',
    years: ['2017', '2018', '2019', '2020', '2021', '2022'],
    series: ['A', 'B'],
  },
  SOFSL: {
    name: 'SoFi Student Loan Trust',
    type: 'studentLoan',
    trustee: 'Wilmington Trust',
    years: ['2018', '2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'R'],
  },
  CBSLT: {
    name: 'CommonBond Student Loan Trust',
    type: 'studentLoan',
    trustee: 'Wilmington Trust',
    years: ['2019', '2020', '2021', '2022'],
    series: ['A', 'B'],
  },
  GLSLT: {
    name: 'Great Lakes Student Loan Trust',
    type: 'studentLoan',
    trustee: 'US Bank National Association',
    years: ['2016', '2017', '2018', '2019', '2020'],
    series: ['A', 'B'],
  },
  NCSLT: {
    name: 'National Collegiate Student Loan Trust',
    type: 'studentLoan',
    trustee: 'Wilmington Trust',
    years: ['2004', '2005', '2006', '2007'],
    series: ['A', 'B', 'C'],
  },

  // Personal Loan ABS
  LCLUB: {
    name: 'LendingClub Receivables Trust',
    type: 'personalLoan',
    trustee: 'Wilmington Trust',
    years: ['2018', '2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C'],
  },
  PROSP: {
    name: 'Prosper Marketplace Issuance Trust',
    type: 'personalLoan',
    trustee: 'Wilmington Trust',
    years: ['2018', '2019', '2020', '2021', '2022'],
    series: ['A', 'B'],
  },
  SOFPL: {
    name: 'SoFi Consumer Loan Program Trust',
    type: 'personalLoan',
    trustee: 'Wilmington Trust',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C'],
  },
  UPST: {
    name: 'Upstart Securitization Trust',
    type: 'personalLoan',
    trustee: 'Wilmington Trust',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C'],
  },
  AVANT: {
    name: 'Avant Loans Funding Trust',
    type: 'personalLoan',
    trustee: 'Bank of New York Mellon',
    years: ['2018', '2019', '2020', '2021', '2022'],
    series: ['A', 'B'],
  },
  GSPL: {
    name: 'Goldman Sachs Personal Loan Trust',
    type: 'personalLoan',
    trustee: 'Bank of New York Mellon',
    years: ['2020', '2021', '2022', '2023'],
    series: ['A', 'B'],
  },

  // Medical Debt
  PRAA: {
    name: 'PRA Group Medical Receivables Trust',
    type: 'medical',
    trustee: 'Wilmington Trust',
    years: ['2019', '2020', '2021', '2022'],
    series: ['A', 'B'],
  },
  ECMG: {
    name: 'Encore Medical Group Trust',
    type: 'medical',
    trustee: 'US Bank National Association',
    years: ['2019', '2020', '2021', '2022'],
    series: ['A', 'B'],
  },
  MDCBS: {
    name: 'Medical Debt Collection ABS',
    type: 'medical',
    trustee: 'Wilmington Trust',
    years: ['2019', '2020', '2021', '2022'],
    series: ['A'],
  },
  CVGHC: {
    name: 'Convergent Healthcare Receivables Trust',
    type: 'medical',
    trustee: 'Bank of New York Mellon',
    years: ['2020', '2021', '2022'],
    series: ['A', 'B'],
  },
  R1RCM: {
    name: 'R1 RCM Medical Receivables Trust',
    type: 'medical',
    trustee: 'US Bank National Association',
    years: ['2020', '2021', '2022', '2023'],
    series: ['A', 'B'],
  },

  // Telecom Receivables
  ATTRC: {
    name: 'AT&T Receivables Corporation',
    type: 'telecom',
    trustee: 'Bank of New York Mellon',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B'],
  },
  VZWRC: {
    name: 'Verizon Wireless Receivables Trust',
    type: 'telecom',
    trustee: 'US Bank National Association',
    years: ['2019', '2020', '2021', '2022', '2023'],
    series: ['A', 'B', 'C'],
  },
  TMORC: {
    name: 'T-Mobile Receivables Trust',
    type: 'telecom',
    trustee: 'Wilmington Trust',
    years: ['2020', '2021', '2022', '2023'],
    series: ['A', 'B'],
  },
  SPTRC: {
    name: 'Sprint Receivables Corporation',
    type: 'telecom',
    trustee: 'Wilmington Trust',
    years: ['2018', '2019', '2020'],
    series: ['A', 'B'],
  },
  CMCRC: {
    name: 'Comcast Cable Receivables Trust',
    type: 'telecom',
    trustee: 'Bank of New York Mellon',
    years: ['2019', '2020', '2021', '2022'],
    series: ['A', 'B'],
  },
};

export const getTrustData = (prefix: string): TrustData | undefined => {
  return TRUST_DB[prefix];
};

export const getTrustsByDebtType = (debtType: DebtTypeId): TrustData[] => {
  return Object.values(TRUST_DB).filter((trust) => trust.type === debtType);
};

export const getTrustPrefixesByDebtType = (debtType: DebtTypeId): string[] => {
  return Object.entries(TRUST_DB)
    .filter(([_, trust]) => trust.type === debtType)
    .map(([prefix]) => prefix);
};

export const getAllTrustPrefixes = (): string[] => {
  return Object.keys(TRUST_DB);
};

export const getTrustees = (): string[] => {
  const trustees = new Set(Object.values(TRUST_DB).map((trust) => trust.trustee));
  return Array.from(trustees);
};
