export interface APIGatewayResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export interface User {
  userId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  documentId: string;
  userId: string;
  type: 'experience' | 'skills' | 'values' | 'achievements';
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analysis {
  analysisId: string;
  userId: string;
  personalityType: string;
  strengths: string[];
  weaknesses: string[];
  createdAt: string;
}

export interface Resume {
  resumeId: string;
  userId: string;
  jobType: string;
  content: string;
  createdAt: string;
}