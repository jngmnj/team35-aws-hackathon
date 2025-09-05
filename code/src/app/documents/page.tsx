'use client';

import { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentEditor } from '@/components/documents/DocumentEditor';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Document, DocumentType } from '@/types';

export default function DocumentsPage() {
  const { documents, createDocument, updateDocument, deleteDocument, isLoading } = useDocuments();
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
      } else {
        savedDocument = await createDocument(data);
      }
      
      setIsEditorOpen(false);
      setEditingDocument(null);
      
      // If we came from viewer, return to viewer with updated document
      if (viewingDocument) {
        setViewingDocument(savedDocument || { ...viewingDocument, ...data });
        setIsViewerOpen(true);
      }
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(documentId);
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <DocumentList
          documents={documents}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onView={handleView}
        />

        {/* View Document Modal */}
        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>View Document</DialogTitle>
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
                {editingDocument ? 'Edit Document' : `Create New ${newDocumentType}`}
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
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}