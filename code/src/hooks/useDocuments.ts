'use client';

import { useState, useEffect } from 'react';
import { Document, DocumentType } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';

interface CreateDocumentData {
  title: string;
  type: DocumentType;
  content: string;
}

interface UpdateDocumentData {
  title?: string;
  type?: DocumentType;
  content?: string;
}

interface UseDocumentsReturn {
  documents: Document[];
  createDocument: (data: CreateDocumentData) => Promise<Document>;
  updateDocument: (id: string, data: UpdateDocumentData) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadDocuments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const docs = await apiClient.getDocuments();
      setDocuments(docs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const createDocument = async (data: CreateDocumentData): Promise<Document> => {
    setError(null);
    try {
      const newDocument = await apiClient.createDocument(data);
      setDocuments(prev => [...prev, newDocument]);
      return newDocument;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create document';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateDocument = async (id: string, data: UpdateDocumentData): Promise<Document> => {
    setError(null);
    try {
      const updatedDocument = await apiClient.updateDocument(id, data);
      setDocuments(prev => prev.map(doc => 
        doc.documentId === id ? updatedDocument : doc
      ));
      return updatedDocument;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    setError(null);
    try {
      await apiClient.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.documentId !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    documents,
    createDocument,
    updateDocument,
    deleteDocument,
    isLoading,
    error,
    refetch: loadDocuments,
  };
}