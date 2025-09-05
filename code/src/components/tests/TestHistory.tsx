'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Document, TestResult } from '@/types';
import { Calendar, ExternalLink } from 'lucide-react';

interface TestHistoryProps {
  testResults: Document[];
  isLoading: boolean;
}

export function TestHistory({ testResults, isLoading }: TestHistoryProps) {
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
            <Card key={doc.documentId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{testResult.testType}</CardTitle>
                  <Badge variant="secondary">{testResult.result}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(testResult.takenAt).toLocaleDateString('ko-KR')}
                </div>
              </CardHeader>
              
              {(testResult.description || testResult.externalUrl) && (
                <CardContent className="pt-0">
                  {testResult.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {testResult.description}
                    </p>
                  )}
                  
                  {testResult.externalUrl && (
                    <a
                      href={testResult.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
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
    </div>
  );
}