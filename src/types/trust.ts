import { DebtTypeId } from './debt';

export interface TrustCUSIP {
  cusip: string;
  tranche: string;
  rating: string;
  balance: number;
}

export interface TrustData {
  name: string;
  type: DebtTypeId;
  trustee: string;
  years: string[];
  series: string[];
}

export interface Trust {
  trustId: string;
  dealId?: string;
  name: string;
  trustee: string;
  type: DebtTypeId;
  closingDate: string;
  issuanceDate?: string;
  originalBalance: number;
  dealSize?: number;
  cusips: TrustCUSIP[];
  matchScore: number;
  matchReasons: string[];
  secLink?: string;
}

export interface TrustDatabase {
  [prefix: string]: TrustData;
}

export interface TrustSearchParams {
  debtType: DebtTypeId;
  servicerId?: string;
  originYear?: string;
}

export interface TrustSearchResult {
  trusts: Trust[];
  searchTime: number;
  totalMatches: number;
}
