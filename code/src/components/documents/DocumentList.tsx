'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Document, DocumentType } from '@/types';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { LoadingCard, LoadingSpinner } from '@/components/ui/loading';

interface DocumentListProps {
  documents: Document[];
  onEdit: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onCreate: (type: DocumentType) => void;
  onView: (document: Document) => void;
  isLoading?: boolean;
  error?: string | null;
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'experience', label: '경험' },
  { value: 'skills', label: '기술' },
  { value: 'values', label: '가치관' },
  { value: 'achievements', label: '성과' },
  { value: 'daily_record', label: '일상기록' },
  { value: 'mood_tracker', label: '기분추적' },
  { value: 'reflection', label: '성찰' },
  { value: 'test_result', label: '테스트결과' }
];

export function DocumentList({ documents, onEdit, onDelete, onCreate, onView, isLoading, error }: DocumentListProps) {
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
      <div className="text-sm text-muted-foreground line-clamp-6 whitespace-pre-wrap font-mono">
        {document.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
      </div>
      <p className="text-xs text-muted-foreground/70 mt-2">
수정일: {new Date(document.updatedAt).toLocaleDateString()}
      </p>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">내 문서</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => onCreate('daily_record')} 
            disabled={isLoading}
            variant="default"
            className="w-full sm:w-auto"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            <Plus className="h-4 w-4 mr-2" />
            일상기록
          </Button>
          <Button onClick={() => onCreate(activeTab)} disabled={isLoading} variant="outline" className="w-full sm:w-auto">
            {isLoading && <LoadingSpinner size="sm" />}
            <Plus className="h-4 w-4 mr-2" />
            새 {documentTypes.find(t => t.value === activeTab)?.label || '문서'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType)}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1">
          {documentTypes.map(type => (
            <TabsTrigger key={type.value} value={type.value} className="text-xs sm:text-sm px-2 py-1">
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {documentTypes.map(type => (
          <TabsContent key={type.value} value={type.value} className="mt-4">
            {error && (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
                <Button className="mt-4" onClick={() => window.location.reload()}>
다시 시도
                </Button>
              </div>
            )}
            
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {getDocumentsByType(type.value).length > 0 ? (
                  getDocumentsByType(type.value).map(document => (
                    <DocumentCard key={document.documentId} document={document} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p className="text-sm sm:text-base">아직 {type.label} 문서가 없습니다.</p>
                    <Button 
                      className="mt-4 w-full sm:w-auto" 
                      onClick={() => onCreate(type.value)}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      첫 번째 {type.label} 작성하기
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default DocumentList;