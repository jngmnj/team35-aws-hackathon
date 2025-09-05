'use client';

import { useState, useEffect } from 'react';
import { Document } from '@/components/documents/DocumentList';
import { DocumentType } from '@/components/documents/DocumentEditor';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load documents from localStorage
    const stored = localStorage.getItem('documents');
    if (stored) {
      setDocuments(JSON.parse(stored));
    }
  }, []);

  const saveDocuments = (docs: Document[]) => {
    setDocuments(docs);
    localStorage.setItem('documents', JSON.stringify(docs));
  };

  const createDocument = (data: { title: string; type: DocumentType; content: string }) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    
    const updated = [...documents, newDoc];
    saveDocuments(updated);
    return newDoc;
  };

  const updateDocument = (id: string, data: { title: string; type: DocumentType; content: string }) => {
    const updated = documents.map(doc => 
      doc.id === id ? { ...doc, ...data } : doc
    );
    saveDocuments(updated);
  };

  const deleteDocument = (id: string) => {
    const updated = documents.filter(doc => doc.id !== id);
    saveDocuments(updated);
  };

  return {
    documents,
    createDocument,
    updateDocument,
    deleteDocument,
    isLoading,
  };
}