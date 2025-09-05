'use client';

import { useState, useEffect } from 'react';
import { Document, DocumentType } from '@/types';
import { useAuth } from '@/lib/auth-context';

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
}

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Mock data for development
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock documents
        const mockDocuments: Document[] = [
          {
            documentId: '1',
            userId: user?.userId || 'mock-user',
            type: 'experience',
            title: 'Software Developer at TechCorp',
            content: '<p>Worked as a full-stack developer for 3 years...</p>',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            documentId: '2',
            userId: user?.userId || 'mock-user',
            type: 'skills',
            title: 'Technical Skills',
            content: '<p>JavaScript, TypeScript, React, Node.js...</p>',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ];
        
        setDocuments(mockDocuments);
      } catch (err) {
        setError('Failed to load documents');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadDocuments();
    }
  }, [user]);

  const createDocument = async (data: CreateDocumentData): Promise<Document> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newDocument: Document = {
        documentId: Date.now().toString(),
        userId: user?.userId || 'mock-user',
        type: data.type,
        title: data.title,
        content: data.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDocuments(prev => [...prev, newDocument]);
      return newDocument;
    } catch (err) {
      setError('Failed to create document');
      throw err;
    }
  };

  const updateDocument = async (id: string, data: UpdateDocumentData): Promise<Document> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDocuments(prev => prev.map(doc => 
        doc.documentId === id 
          ? { ...doc, ...data, updatedAt: new Date().toISOString() }
          : doc
      ));

      const updatedDoc = documents.find(doc => doc.documentId === id);
      if (!updatedDoc) throw new Error('Document not found');
      
      return { ...updatedDoc, ...data, updatedAt: new Date().toISOString() };
    } catch (err) {
      setError('Failed to update document');
      throw err;
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDocuments(prev => prev.filter(doc => doc.documentId !== id));
    } catch (err) {
      setError('Failed to delete document');
      throw err;
    }
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