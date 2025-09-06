'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { Document, TestResult } from '@/types';
import { Calendar, ExternalLink, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface TestHistoryProps {
  testResults: Document[];
  isLoading: boolean;
  onTestDeleted?: () => void;
}

export function TestHistory({ testResults, isLoading, onTestDeleted }: TestHistoryProps) {
  const [selectedTest, setSelectedTest] = useState<Document | null>(null);
  const { showToast } = useToast();

  const handleDelete = async (doc: Document) => {
    if (!confirm('정말로 이 테스트 결과를 삭제하시겠습니까?')) return;
    
    try {
      await apiClient.deleteDocument(doc.documentId);
      showToast('테스트 결과가 삭제되었습니다.', 'success');
      onTestDeleted?.();
    } catch {
      showToast('삭제에 실패했습니다.', 'error');
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">테스트 히스토리</h2>
        <div className="text-center py-8 text-muted-foreground">
          로딩 중...
        </div>
      </div>
    );
  }

  if (testResults.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">테스트 히스토리</h2>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              아직 저장된 테스트 결과가 없습니다.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              위의 테스트를 진행하고 결과를 저장해보세요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">테스트 히스토리</h2>
      
      <div className="grid gap-4">
        {testResults.map((doc) => {
          let testResult: TestResult;
          try {
            testResult = JSON.parse(doc.content);
          } catch {
            return null;
          }

          return (
            <Card key={doc.documentId} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1" onClick={() => setSelectedTest(doc)}>
                    <CardTitle className="text-lg">{testResult.testType}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{testResult.result}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground" onClick={() => setSelectedTest(doc)}>
                  <Calendar className="h-4 w-4" />
                  {new Date(testResult.takenAt).toLocaleDateString('ko-KR')}
                </div>
              </CardHeader>
              
              {(testResult.description || testResult.externalUrl) && (
                <CardContent className="pt-0" onClick={() => setSelectedTest(doc)}>
                  {testResult.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {testResult.description}
                    </p>
                  )}
                  
                  {testResult.externalUrl && (
                    <a
                      href={testResult.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      테스트 링크
                    </a>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>테스트 결과 상세</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedTest && handleDelete(selectedTest)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </div>
          </DialogHeader>
          {selectedTest && (() => {
            let testResult: TestResult;
            try {
              testResult = JSON.parse(selectedTest.content);
            } catch {
              return <p>데이터를 불러올 수 없습니다.</p>;
            }

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{testResult.testType}</h3>
                  <Badge variant="secondary" className="text-base px-3 py-1">{testResult.result}</Badge>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(testResult.takenAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                {testResult.description && (
                  <div>
                    <h4 className="font-medium mb-2">설명</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{testResult.description}</p>
                  </div>
                )}

                {testResult.externalUrl && (
                  <div>
                    <h4 className="font-medium mb-2">관련 링크</h4>
                    <a
                      href={testResult.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {testResult.externalUrl}
                    </a>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}