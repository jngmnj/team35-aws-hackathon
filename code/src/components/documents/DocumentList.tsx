'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Document, DocumentType } from '@/types';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface DocumentListProps {
  documents: Document[];
  onEdit: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onCreate: (type: DocumentType) => void;
  onView: (document: Document) => void;
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'experience', label: 'Experience' },
  { value: 'skills', label: 'Skills' },
  { value: 'values', label: 'Values' },
  { value: 'achievements', label: 'Achievements' }
];

export function DocumentList({ documents, onEdit, onDelete, onCreate, onView }: DocumentListProps) {
  const [activeTab, setActiveTab] = useState<DocumentType>('experience');

  const getDocumentsByType = (type: DocumentType) => {
    return documents.filter(doc => doc.type === type);
  };

  const DocumentCard = ({ document }: { document: Document }) => (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(document)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium truncate">{document.title}</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(document);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(document.documentId);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-gray-600 line-clamp-6 whitespace-pre-wrap font-mono">
        {document.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Updated: {new Date(document.updatedAt).toLocaleDateString()}
      </p>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Documents</h2>
        <Button onClick={() => onCreate(activeTab)}>
          <Plus className="h-4 w-4 mr-2" />
          New {activeTab}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType)}>
        <TabsList className="grid w-full grid-cols-4">
          {documentTypes.map(type => (
            <TabsTrigger key={type.value} value={type.value}>
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {documentTypes.map(type => (
          <TabsContent key={type.value} value={type.value} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getDocumentsByType(type.value).length > 0 ? (
                getDocumentsByType(type.value).map(document => (
                  <DocumentCard key={document.documentId} document={document} />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p>No {type.label.toLowerCase()} documents yet.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => onCreate(type.value)}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first {type.label.toLowerCase()}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default DocumentList;