'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentType } from './DocumentEditor';

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  content: string;
  createdAt: string;
}

interface DocumentListProps {
  documents: Document[];
  onEdit: (document: Document) => void;
  onDelete: (id: string) => void;
}

const typeLabels: Record<DocumentType, string> = {
  experience: '경험',
  skills: '기술',
  values: '가치관',
  achievements: '성과',
};

export function DocumentList({ documents, onEdit, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">아직 작성된 문서가 없습니다.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {documents.map((doc) => (
        <Card key={doc.id} className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{doc.title}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {typeLabels[doc.type]}
                </span>
              </div>
              <div 
                className="text-sm text-gray-600 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: doc.content }}
              />
              <p className="text-xs text-gray-400 mt-2">
                {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <Button size="sm" variant="outline" onClick={() => onEdit(doc)}>
                수정
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(doc.id)}>
                삭제
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}