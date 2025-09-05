'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TestResult } from '@/types';

interface TestResultFormProps {
  testType: string;
  onSave: (result: TestResult) => void;
  onCancel: () => void;
}

export function TestResultForm({ testType, onSave, onCancel }: TestResultFormProps) {
  const [result, setResult] = useState('');
  const [description, setDescription] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!result.trim()) return;

    const testResult: TestResult = {
      testType,
      result: result.trim(),
      description: description.trim() || undefined,
      takenAt: new Date().toISOString(),
      externalUrl: externalUrl.trim() || undefined
    };

    onSave(testResult);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="result">테스트 결과 *</Label>
        <Input
          id="result"
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="예: ENFP, DISC-I, 7번 유형 등"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">상세 설명</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="테스트 결과에 대한 상세한 설명이나 느낀 점을 적어보세요"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="externalUrl">테스트 링크 (선택)</Label>
        <Input
          id="externalUrl"
          type="url"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          저장
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          취소
        </Button>
      </div>
    </form>
  );
}