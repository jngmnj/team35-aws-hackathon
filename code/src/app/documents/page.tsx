'use client';

import { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/components/ui/toast';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentEditor } from '@/components/documents/DocumentEditor';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Document, DocumentType } from '@/types';

export default function DocumentsPage() {
  const { documents, createDocument, updateDocument, deleteDocument, isLoading, error } = useDocuments();
  const { showToast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [newDocumentType, setNewDocumentType] = useState<DocumentType>('experience');

  const handleCreate = (type: DocumentType) => {
    setNewDocumentType(type);
    setEditingDocument(null);
    setIsEditorOpen(true);
  };

  const handleView = (document: Document) => {
    setViewingDocument(document);
    setIsViewerOpen(true);
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setIsViewerOpen(false);
    setIsEditorOpen(true);
  };

  const handleEditFromViewer = () => {
    if (viewingDocument) {
      setEditingDocument(viewingDocument);
      setIsEditorOpen(true);
      // Keep viewer open in background
    }
  };

  const handleSave = async (data: { title: string; type: DocumentType; content: string }) => {
    try {
      let savedDocument;
      if (editingDocument) {
        savedDocument = await updateDocument(editingDocument.documentId, data);
        showToast('문서가 성공적으로 수정되었습니다.', 'success');
      } else {
        savedDocument = await createDocument(data);
        showToast('새 문서가 성공적으로 생성되었습니다.', 'success');
      }
      
      setIsEditorOpen(false);
      setEditingDocument(null);
      
      // If we came from viewer, return to viewer with updated document
      if (viewingDocument) {
        setViewingDocument(savedDocument || { ...viewingDocument, ...data });
        setIsViewerOpen(true);
      }
    } catch {
      // 오류는 API 클라이언트에서 토스트로 처리됨
    }
  };

  const handleDelete = async (documentId: string) => {
    if (confirm('정말로 이 문서를 삭제하시겠습니까?')) {
      try {
        await deleteDocument(documentId);
        showToast('문서가 성공적으로 삭제되었습니다.', 'success');
      } catch {
        // 오류는 API 클라이언트에서 토스트로 처리됨
      }
    }
  };



  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <DocumentList
          documents={documents}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onView={handleView}
          isLoading={isLoading}
          error={error}
        />

        {/* View Document Modal */}
        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>문서 보기</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              {viewingDocument && (
                <DocumentViewer
                  document={viewingDocument}
                  onEdit={handleEditFromViewer}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Document Modal */}
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editingDocument ? '문서 수정' : `새 ${newDocumentType === 'experience' ? '경험' : newDocumentType === 'skills' ? '기술' : newDocumentType === 'values' ? '가치관' : '성과'} 작성`}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <DocumentEditor
                onSave={handleSave}
                initialData={editingDocument ? {
                  title: editingDocument.title,
                  type: editingDocument.type,
                  content: editingDocument.content
                } : {
                  title: '',
                  type: newDocumentType,
                  content: ''
                }}
                isModal={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}