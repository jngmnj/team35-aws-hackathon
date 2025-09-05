'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { DocumentType } from '@/types';

interface DocumentEditorProps {
  onSave: (data: { title: string; type: DocumentType; content: string }) => void;
  initialData?: { title: string; type: DocumentType; content: string };
}

const placeholders = {
  experience: 'Describe your work experience, projects, and achievements...',
  skills: 'List your technical and soft skills...',
  values: 'What values are important to you in work and life?...',
  achievements: 'Highlight your key accomplishments and awards...'
};

export function DocumentEditor({ onSave, initialData }: DocumentEditorProps) {
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

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Input
          placeholder="Document title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <select 
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={type} 
          onChange={(e) => setType(e.target.value as DocumentType)}
        >
          <option value="experience">Experience</option>
          <option value="skills">Skills</option>
          <option value="values">Values</option>
          <option value="achievements">Achievements</option>
        </select>

        <div className="border rounded-md p-4 min-h-[500px] prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-blockquote:text-gray-600 prose-code:text-blue-600 prose-pre:bg-gray-100">
          <EditorContent editor={editor} />
        </div>

        <Button onClick={handleSave} disabled={!title.trim() || isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </Card>
  );
}

export default DocumentEditor;