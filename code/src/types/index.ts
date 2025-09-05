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

export type DocumentType = 'experience' | 'skills' | 'values' | 'achievements';

export interface AnalysisResult {
  analysisId: string;
  userId: string;
  result: {
    personalityType: PersonalityType;
    strengths: string[];
    weaknesses: string[];
    values: string[];
    interests: string[];
  };
  createdAt: string;
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
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}