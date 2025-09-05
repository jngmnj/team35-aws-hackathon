export type DocumentType = 'experience' | 'skills' | 'values' | 'achievements';

export interface BaseDocument {
  documentId: string;
  userId: string;
  type: DocumentType;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceDocument extends BaseDocument {
  type: 'experience';
  content: string; // Rich text content describing work experience
}

export interface SkillsDocument extends BaseDocument {
  type: 'skills';
  content: string; // List of technical and soft skills
}

export interface ValuesDocument extends BaseDocument {
  type: 'values';
  content: string; // Personal values and principles
}

export interface AchievementsDocument extends BaseDocument {
  type: 'achievements';
  content: string; // Notable accomplishments and awards
}

export type Document = ExperienceDocument | SkillsDocument | ValuesDocument | AchievementsDocument;

export interface DocumentValidationResult {
  isValid: boolean;
  errors: string[];
}