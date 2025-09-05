'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Card } from '@/components/ui/card';
import { useState } from 'react';

export type DocumentType = 'experience' | 'skills' | 'values' | 'achievements';

interface DocumentEditorProps {
  onSave: (data: { title: string; type: DocumentType; content: string }) => void;
  initialData?: { title: string; type: DocumentType; content: string };
}

export function DocumentEditor({ onSave, initialData }: DocumentEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState<DocumentType>(initialData?.type || 'experience');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '문서 내용을 입력하세요...',
      }),
    ],
    content: initialData?.content || '',
    immediatelyRender: false,
  });

  const handleSave = () => {
    if (!editor || !title.trim()) return;
    
    onSave({
      title: title.trim(),
      type,
      content: editor.getHTML(),
    });
  };

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
        </select>

        <div className="border rounded-md p-4 min-h-[300px]">
          <EditorContent editor={editor} />
        </div>

        <Button onClick={handleSave} disabled={!title.trim()}>
          저장
        </Button>
      </div>
    </Card>
  );
}