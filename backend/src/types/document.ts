export type DocumentType = 'experience' | 'skills' | 'values' | 'achievements';

export interface BaseDocument {
  documentId: string;
  userId: string;
  type: DocumentType;
  title: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceDocument extends BaseDocument {
  type: 'experience';
}

export interface SkillsDocument extends BaseDocument {
  type: 'skills';
}

export interface ValuesDocument extends BaseDocument {
  type: 'values';
}

export interface AchievementsDocument extends BaseDocument {
  type: 'achievements';
}

export type Document = ExperienceDocument | SkillsDocument | ValuesDocument | AchievementsDocument;

export interface DocumentValidationResult {
  isValid: boolean;
  errors: string[];
}