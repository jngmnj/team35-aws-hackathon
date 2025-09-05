'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { JobCategorySelector, JobCategory } from './JobCategorySelector';
import { ResumePreview } from './ResumePreview';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ResumeContent } from '@/types';

interface ResumeContentDisplay {
  personalInfo: { summary: string };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  skills: string[];
  achievements: string[];
}

interface ResumeGeneratorProps {
  onGenerate?: (category: JobCategory) => Promise<ResumeContent>;
}

export function ResumeGenerator({ onGenerate }: ResumeGeneratorProps) {
  const [selectedCategory, setSelectedCategory] = useState<JobCategory>();
  const [resume, setResume] = useState<ResumeContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const documents = await apiClient.getDocuments();
        setDocumentCount(documents.length);
      } catch {
        setDocumentCount(0);
      }
    };
    
    loadDocuments();
  }, []);

  const handleGenerate = async () => {
    if (!selectedCategory) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const generatedResume = await apiClient.generateResume(selectedCategory);
      setResume(generatedResume);
    } catch (err: any) {
      if (err.message.includes('401')) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
      } else if (err.message.includes('429')) {
        setError('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('이력서 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsGenerating(false);
    }
  };



  const handleDownload = () => {
    if (!resume) return;
    
    const content = `
이력서

요약: ${resume.content.personalInfo.name}

경험:
${resume.content.experience.map(exp => `${exp.title} - ${exp.company} (${exp.duration})\n${exp.description}`).join('\n\n')}

기술: ${resume.content.skills.join(', ')}

성과:
${resume.content.achievements.map(achievement => `• ${achievement}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${selectedCategory}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEdit = () => {
    setResume(null);
  };

  if (resume) {
    const displayResume: ResumeContentDisplay = {
      personalInfo: { summary: resume.content.personalInfo.name },
      experience: resume.content.experience,
      skills: resume.content.skills,
      achievements: resume.content.achievements
    };
    
    return (
      <ResumePreview 
        resume={displayResume} 
        onDownload={handleDownload}
        onEdit={handleEdit}
      />
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">이력서 생성</h2>
          <JobCategorySelector 
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
        
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          작성된 문서: <span className="font-semibold text-blue-600">{documentCount}개</span>
          {documentCount === 0 && (
            <p className="text-orange-600 mt-2">
              이력서 생성을 위해 먼저 문서를 작성해주세요.
            </p>
          )}
        </div>
        
        <Button 
          onClick={handleGenerate}
          disabled={!selectedCategory || isGenerating || documentCount === 0}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              이력서 생성 중...
            </>
          ) : (
            '이력서 생성'
          )}
        </Button>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </Card>
  );
}