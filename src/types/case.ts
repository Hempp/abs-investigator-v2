import { DebtTypeId, DebtInfo } from './debt';
import { Trust } from './trust';
import { Trade } from './trading';

export type CaseStatus =
  | 'draft'
  | 'letter_generated'
  | 'letter_sent'
  | 'awaiting_response'
  | 'response_received'
  | 'follow_up_needed'
  | 'resolved'
  | 'escalated'
  | 'closed';

export interface CaseDocument {
  id: string;
  name: string;
  type: 'letter' | 'response' | 'evidence' | 'other';
  dateAdded: string;
  uploadedAt: string;
  content?: string;
  fileUrl?: string;
}

export interface CaseTimelineEvent {
  id: string;
  date: string;
  type: 'created' | 'updated' | 'letter_sent' | 'response' | 'note' | 'status_change';
  title: string;
  description?: string;
  status?: CaseStatus;
}

export interface CaseReminder {
  id: string;
  date: string;
  title: string;
  description?: string;
  completed: boolean;
}

export interface Case {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: CaseStatus;
  debtType: DebtTypeId;
  debtInfo: DebtInfo;
  trust: Trust | null;
  tradingDataCount: number;
  tradingDataSample: Trade[];
  generatedLetter: string | null;
  documents: CaseDocument[];
  timeline: CaseTimelineEvent[];
  reminders: CaseReminder[];
  notes: string;
  tags: string[];
}

export interface CaseFilters {
  status?: CaseStatus[];
  debtType?: DebtTypeId[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
  tags?: string[];
}

export type CaseSortField = 'createdAt' | 'updatedAt' | 'status' | 'debtType';
export type CaseSortOrder = 'asc' | 'desc';

export interface CaseSort {
  field: CaseSortField;
  order: CaseSortOrder;
}
