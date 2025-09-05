'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Document } from '@/types';
import { Pencil, Calendar } from 'lucide-react';

interface DocumentViewerProps {
  document: Document;
  onEdit: () => void;
}

export function DocumentViewer({ document, onEdit }: DocumentViewerProps) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">{document.title}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="capitalize bg-gray-100 px-2 py-1 rounded">
              {document.type}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Updated: {new Date(document.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <Button onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <Card className="p-6 flex-1">
        <div 
          className="prose prose-lg max-w-none min-h-[400px] whitespace-pre-wrap [&_strong]:font-bold [&_em]:italic [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_p]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded"
          dangerouslySetInnerHTML={{ __html: document.content }}
        />
      </Card>
    </div>
  );
}

export default DocumentViewer;