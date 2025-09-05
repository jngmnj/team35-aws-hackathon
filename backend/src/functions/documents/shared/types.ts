export type DocumentType = 'experience' | 'skills' | 'values' | 'achievements' | 'daily_record' | 'mood_tracker' | 'reflection' | 'test_result';

export interface Document {
  documentId: string;
  userId: string;
  type: DocumentType;
  title: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}