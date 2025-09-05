import axios, { AxiosInstance } from 'axios';
import { User, Document, AnalysisResult, ResumeContent, DocumentType } from '@/types';

let showToastCallback: ((message: string, type: 'success' | 'error' | 'info') => void) | null = null;

export function setToastCallback(callback: (message: string, type: 'success' | 'error' | 'info') => void) {
  showToastCallback = callback;
}

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
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://oxunoozv13.execute-api.us-east-1.amazonaws.com/prod',
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

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
        }
        
        let message = 'An error occurred';
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          message = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
        } else if (error.response?.status === 500) {
          message = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.response?.status === 429) {
          message = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.response?.status === 401) {
          message = '인증이 만료되었습니다. 다시 로그인해주세요.';
        } else {
          message = error.response?.data?.error?.message || error.message || message;
        }
        
        if (showToastCallback) {
          showToastCallback(message, 'error');
        }
        
        throw new Error(message);
      }
    );
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
    return { user: data.data, token: data.data.token };
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const { data } = await this.client.post('/auth/register', { email, password, name });
    return { user: data.data, token: data.data.token };
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    const { data } = await this.client.get('/documents');
    return data.data.documents;
  }

  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const { data } = await this.client.post('/documents', documentData);
    return data.data;
  }

  async updateDocument(id: string, documentData: Partial<CreateDocumentData>): Promise<Document> {
    const { data } = await this.client.put(`/documents/${id}`, documentData);
    return data.data;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.client.delete(`/documents/${id}`);
  }

  // Analysis methods
  async generateAnalysis(): Promise<AnalysisResult> {
    const { data } = await this.client.post('/analysis');
    return data.data;
  }

  async getAnalysis(): Promise<AnalysisResult[]> {
    const { data } = await this.client.get('/analysis');
    return data.data.analyses;
  }

  // Resume methods
  async generateResume(jobCategory: string, jobTitle?: string): Promise<ResumeContent> {
    const { data } = await this.client.post('/resume', { jobCategory, jobTitle });
    return data.data;
  }

  async getResumes(jobCategory?: string): Promise<ResumeContent[]> {
    const url = jobCategory ? `/resume?jobCategory=${jobCategory}` : '/resume';
    const { data } = await this.client.get(url);
    return data.data.resumes;
  }
}

export const apiClient = new ApiClient();