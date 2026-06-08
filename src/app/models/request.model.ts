import { StagedDocumentMap } from './document.model';

export type RequestStatus =
  | 'Submitted'
  | 'Maker Review'
  | 'Checker Review'
  | 'Maker-Approved'
  | 'Approved'
  | 'Rejected'
  | 'Returned';

export interface ProfileChangeDraft {
  submittedAt: string;
  changedFields: string[];
  oldValues: Record<string, string>;
  newValues: Record<string, string>;
}

export interface ApprovalTrailEntry {
  stage: string;
  action: string;
  timestamp: string;
  user: string;
  remarks?: string | null;
}

export interface CspRequest {
  requestId: string;
  customerId: string;
  customerName: string;
  submittedBy: string;
  submittedAt: string;
  requestType: string;
  status: RequestStatus;
  stage: string;
  reason?: string;
  comments?: string | null;
  profileChanges: ProfileChangeDraft | null;
  documents: StagedDocumentMap;
  approvalTrail: ApprovalTrailEntry[];
}

export interface RequestSubmissionInput {
  reason: string;
  comments?: string | null;
  profileChanges: ProfileChangeDraft | null;
  documents: StagedDocumentMap;
}
