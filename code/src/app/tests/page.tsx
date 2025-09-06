'use client';

import { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/components/ui/toast';
import { TestList } from '@/components/tests/TestList';
import { TestResultForm } from '@/components/tests/TestResultForm';
import { TestHistory } from '@/components/tests/TestHistory';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TestResult } from '@/types';

export default function TestsPage() {
  const { documents, createDocument, isLoading } = useDocuments();
  const { showToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const testResults = documents.filter(doc => doc.type === 'test_result');

  const handleTakeTest = (testType: string) => {
    setSelectedTestType(testType);
    setIsFormOpen(true);
  };

  const handleSaveResult = async (result: TestResult) => {
    try {
      await createDocument({
        title: `${result.testType} 결과`,
        type: 'test_result',
        content: JSON.stringify(result)
      });
      showToast('테스트 결과가 저장되었습니다.', 'success');
      setIsFormOpen(false);
    } catch {
      // 오류는 API 클라이언트에서 처리됨
    }
  };

  const handleTestDeleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">성격 테스트 관리</h1>
          <p className="text-muted-foreground" style={{wordBreak: 'keep-all'}}>
            다양한 성격 테스트를 통해 자신을 더 깊이 이해해보세요
          </p>
        </div>

        <TestList onTakeTest={handleTakeTest} />
        
        <TestHistory 
          testResults={testResults} 
          isLoading={isLoading} 
          onTestDeleted={handleTestDeleted}
          key={refreshKey}
        />

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTestType} 결과 입력</DialogTitle>
            </DialogHeader>
            <TestResultForm
              testType={selectedTestType}
              onSave={handleSaveResult}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}