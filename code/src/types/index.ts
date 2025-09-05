export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Document {
  documentId: string;
  userId: string;
  type: DocumentType;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'experience' | 'skills' | 'values' | 'achievements' | 'daily_record' | 'mood_tracker' | 'reflection' | 'test_result';

export interface DailyRecord {
  date: string;
  mood: number; // 1-5 scale
  energy: number; // 1-5 scale
  activities: string[];
  notes?: string;
}

export interface TestResult {
  testType: string; // 'MBTI', 'DISC', 'Enneagram', etc.
  result: string;
  description?: string;
  takenAt: string;
  externalUrl?: string;
}

export interface AnalysisResult {
  analysisId: string;
  userId: string;
  result: {
    personalityType: PersonalityType;
    strengths: StrengthItem[];
    weaknesses: WeaknessItem[];
    values: string[];
    interests: string[];
  };
  createdAt: string;
}

export interface StrengthItem {
  title: string;
  description: string;
  evidence: string;
}

export interface WeaknessItem {
  title: string;
  description: string;
  improvement: string;
}

export interface PersonalityType {
  type: string;
  description: string;
  traits: string[];
}

export type JobCategory = 'developer' | 'pm' | 'designer' | 'marketer' | 'data';

export interface ResumeContent {
  resumeId: string;
  userId: string;
  jobCategory: JobCategory;
  jobTitle?: string;
  content: {
    personalInfo: PersonalInfo;
    experience: Experience[];
    skills: string[];
    achievements: string[];
  };
  createdAt: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}