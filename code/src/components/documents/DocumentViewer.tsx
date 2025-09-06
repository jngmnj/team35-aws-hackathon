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
              {document.type === 'experience' ? '경험' : document.type === 'skills' ? '기술' : document.type === 'values' ? '가치관' : '성과'}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>수정일: {new Date(document.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <Button onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          수정
        </Button>
      </div>

      <Card className="p-6 flex-1">
        {document.type === 'daily_record' ? (
          (() => {
            try {
              const data = JSON.parse(document.content);
              return (
                <div className="space-y-6 min-h-[400px]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-accent rounded-lg">
                      <div className="text-3xl font-bold text-primary">{data.mood}/5</div>
                      <div className="text-sm text-muted-foreground">기분</div>
                    </div>
                    <div className="text-center p-4 bg-accent rounded-lg">
                      <div className="text-3xl font-bold text-primary">{data.energy}/5</div>
                      <div className="text-sm text-muted-foreground">에너지</div>
                    </div>
                  </div>
                  
                  {data.activities && data.activities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">오늘의 활동</h3>
                      <div className="flex flex-wrap gap-2">
                        {data.activities.map((activity: string, i: number) => (
                          <span key={i} className="px-3 py-2 bg-accent text-foreground rounded-lg">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {data.notes && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">메모</h3>
                      <div className="p-4 bg-accent rounded-lg">
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">{data.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            } catch {
              return (
                <div 
                  className="prose prose-lg max-w-none min-h-[400px] whitespace-pre-wrap [&_strong]:font-bold [&_em]:italic [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_p]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded"
                  dangerouslySetInnerHTML={{ __html: document.content }}
                />
              );
            }
          })()
        ) : (
          <div 
            className="prose prose-lg max-w-none min-h-[400px] whitespace-pre-wrap [&_strong]:font-bold [&_em]:italic [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_p]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
        )}
      </Card>
    </div>
  );
}

export default DocumentViewer;