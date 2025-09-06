export type DocumentType = 'experience' | 'skills' | 'values' | 'achievements' | 'daily_record' | 'mood_tracker' | 'reflection' | 'test_result';

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

export interface DailyRecordDocument extends BaseDocument {
  type: 'daily_record';
}

export interface MoodTrackerDocument extends BaseDocument {
  type: 'mood_tracker';
}

export interface ReflectionDocument extends BaseDocument {
  type: 'reflection';
}

export interface TestResultDocument extends BaseDocument {
  type: 'test_result';
}

export type Document = ExperienceDocument | SkillsDocument | ValuesDocument | AchievementsDocument | DailyRecordDocument | MoodTrackerDocument | ReflectionDocument | TestResultDocument;

export interface DocumentValidationResult {
  isValid: boolean;
  errors: string[];
}