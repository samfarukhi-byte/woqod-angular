export interface DocumentType {
  code: string;
  name: string;
  required: boolean;
  description: string;
  expiryRequired: boolean;
  accepted: string[];
  maxSizeMB: number;
}

export interface ExistingDocument {
  docType: string;
  fileName: string;
  fileSize: number;
  uploadedDate: string;
  version: number;
  status: string;
  expiryDate?: string | null;
}

export interface StagedDocument {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: string;
}

export type StagedDocumentMap = Record<string, StagedDocument>;
