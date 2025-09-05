'use client';

import { useState, useEffect } from 'react';
import { Document, DocumentType } from '@/types';
import { apiClient } from '@/lib/api';

interface CreateDocumentData {
  type: DocumentType;
  title: string;
  content: string;
}

interface UseDocumentsReturn {
  documents: Document[];
  createDocument: (data: CreateDocumentData) => Promise<Document>;
  updateDocument: (id: string, data: Partial<CreateDocumentData>) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load mock documents from localStorage
    const stored = localStorage.getItem('mock_documents');
    if (stored) {
      setDocuments(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const saveToStorage = (docs: Document[]) => {
    localStorage.setItem('mock_documents', JSON.stringify(docs));
  };

  const createDocument = async (data: CreateDocumentData): Promise<Document> => {
    const newDoc: Document = {
      documentId: Date.now().toString(),
      userId: '1',
      type: data.type,
      title: data.title,
      content: data.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updated = [...documents, newDoc];
    setDocuments(updated);
    saveToStorage(updated);
    return newDoc;
  };

  const updateDocument = async (id: string, data: Partial<CreateDocumentData>): Promise<Document> => {
    const updated = documents.map(doc => 
      doc.documentId === id 
        ? { ...doc, ...data, updatedAt: new Date().toISOString() }
        : doc
    );
    setDocuments(updated);
    saveToStorage(updated);
    return updated.find(doc => doc.documentId === id)!;
  };

  const deleteDocument = async (id: string): Promise<void> => {
    const updated = documents.filter(doc => doc.documentId !== id);
    setDocuments(updated);
    saveToStorage(updated);
  };

  return {
    documents,
    createDocument,
    updateDocument,
    deleteDocument,
    isLoading,
    error,
  };
}