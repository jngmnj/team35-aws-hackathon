import axios, { AxiosInstance } from 'axios';
import { User, Document, AnalysisResult, ResumeContent, JobCategory, DocumentType } from '@/types';

interface AuthResponse {
  user: User;
  token: string;
}

interface CreateDocumentData {
  type: DocumentType;
  title: string;
  content: string;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  loadToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.token = token;
      }
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.client.post('/auth/login', { email, password });
    return data;
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const { data } = await this.client.post('/auth/register', { email, password, name });
    return data;
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    const { data } = await this.client.get('/documents');
    return data;
  }

  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const { data } = await this.client.post('/documents', documentData);
    return data;
  }

  async updateDocument(id: string, documentData: Partial<CreateDocumentData>): Promise<Document> {
    const { data } = await this.client.put(`/documents/${id}`, documentData);
    return data;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.client.delete(`/documents/${id}`);
  }

  // Analysis methods
  async generateAnalysis(): Promise<AnalysisResult> {
    const { data } = await this.client.post('/analysis/generate');
    return data;
  }

  async getAnalysis(): Promise<AnalysisResult> {
    const { data } = await this.client.get('/analysis');
    return data;
  }

  // Resume methods
  async generateResume(jobCategory: JobCategory): Promise<ResumeContent> {
    const { data } = await this.client.post('/resume/generate', { jobCategory });
    return data;
  }

  async getResume(jobCategory: JobCategory): Promise<ResumeContent> {
    const { data } = await this.client.get(`/resume/${jobCategory}`);
    return data;
  }
}

export const apiClient = new ApiClient();