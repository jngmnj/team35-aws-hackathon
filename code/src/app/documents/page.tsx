'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentEditor, DocumentType } from '@/components/documents/DocumentEditor';
import { DocumentList, Document } from '@/components/documents/DocumentList';
import { Button } from '@/components/ui/button';

import Link from 'next/link';

export default function DocumentsPage() {
  const { user } = useAuth();
  const { documents, createDocument, updateDocument, deleteDocument } = useDocuments();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>로그인이 필요합니다.</p>
        <Link href="/login">
          <Button>로그인</Button>
        </Link>
      </div>
    );
  }

  const handleSave = (data: { title: string; type: DocumentType; content: string }) => {
    if (editingDoc) {
      updateDocument(editingDoc.id, data);
    } else {
      createDocument(data);
    }
    setIsEditorOpen(false);
    setEditingDoc(null);
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    setIsEditorOpen(true);
  };

  const handleNew = () => {
    setEditingDoc(null);
    setIsEditorOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl font-semibold">
              ← 대시보드
            </Link>
            <Button onClick={handleNew}>새 문서 작성</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">문서 관리</h1>
        <DocumentList
          documents={documents}
          onEdit={handleEdit}
          onDelete={deleteDocument}
        />
      </main>

      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {editingDoc ? '문서 수정' : '새 문서 작성'}
              </h2>
              <Button variant="ghost" onClick={() => setIsEditorOpen(false)}>
                ✕
              </Button>
            </div>
            <div className="p-4">
              <DocumentEditor
                onSave={handleSave}
                initialData={editingDoc ? {
                  title: editingDoc.title,
                  type: editingDoc.type,
                  content: editingDoc.content
                } : undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}