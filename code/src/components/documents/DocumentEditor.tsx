'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { DocumentType, DailyRecord } from '@/types';
import { DailyRecordForm } from './DailyRecordForm';

interface DocumentEditorProps {
  onSave: (data: { title: string; type: DocumentType; content: string }) => void;
  initialData?: { title: string; type: DocumentType; content: string };
  isModal?: boolean;
}

const placeholders = {
  experience: '업무 경험, 프로젝트, 성과를 설명해주세요...',
  skills: '기술적 능력과 소프트 스킬을 나열해주세요...',
  values: '업무와 삶에서 중요하게 생각하는 가치는 무엇인가요?...',
  achievements: '주요 성취와 수상 경력을 강조해주세요...',
  daily_record: '오늘 하루는 어땠나요?',
  mood_tracker: '기분과 감정을 기록해보세요...',
  reflection: '오늘의 성찰과 깨달음을 적어보세요...',
  test_result: '테스트 결과와 해석을 기록해보세요...'
};

export function DocumentEditor({ onSave, initialData, isModal = false }: DocumentEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState<DocumentType>(initialData?.type || 'experience');
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholders[type],
      }),
    ],
    content: initialData?.content || '',
    immediatelyRender: false,
  });

  const handleSave = async () => {
    if (!editor || !title.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        type,
        content: editor.getHTML(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDailyRecordSave = async (data: { title: string; content: string }) => {
    setIsSaving(true);
    try {
      await onSave({
        title: data.title,
        type,
        content: data.content,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isModal) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-4 p-6">
          <Input
            placeholder="문서 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <select 
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={type} 
            onChange={(e) => setType(e.target.value as DocumentType)}
          >
            <option value="experience">경험</option>
            <option value="skills">기술</option>
            <option value="values">가치관</option>
            <option value="achievements">성과</option>
            <option value="daily_record">일상기록</option>
            <option value="mood_tracker">기분추적</option>
            <option value="reflection">성찰</option>
            <option value="test_result">테스트결과</option>
          </select>

          {type === 'daily_record' ? (
            <DailyRecordForm 
              onSave={handleDailyRecordSave}
              initialData={initialData?.content ? JSON.parse(initialData.content) : undefined}
            />
          ) : (
            <div className="border rounded-md p-4 min-h-[400px] max-h-[400px] overflow-y-auto prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-blockquote:text-gray-600 prose-code:text-blue-600 prose-pre:bg-gray-100">
              <EditorContent editor={editor} />
            </div>
          )}
        </div>
        
        {type !== 'daily_record' && (
          <div className="flex-shrink-0 p-6 pt-0">
            <Button onClick={handleSave} disabled={!title.trim() || isSaving} className="w-full">
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Input
          placeholder="문서 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <select 
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={type} 
          onChange={(e) => setType(e.target.value as DocumentType)}
        >
          <option value="experience">경험</option>
          <option value="skills">기술</option>
          <option value="values">가치관</option>
          <option value="achievements">성과</option>
          <option value="daily_record">일상기록</option>
          <option value="mood_tracker">기분추적</option>
          <option value="reflection">성찰</option>
          <option value="test_result">테스트결과</option>
        </select>

        <div className="border rounded-md p-4 min-h-[500px] prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-blockquote:text-gray-600 prose-code:text-blue-600 prose-pre:bg-gray-100">
          <EditorContent editor={editor} />
        </div>

        <Button onClick={handleSave} disabled={!title.trim() || isSaving}>
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </Card>
  );
}

export default DocumentEditor;