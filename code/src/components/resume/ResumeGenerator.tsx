'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { JobCategorySelector, JobCategory } from './JobCategorySelector';
import { ResumePreview } from './ResumePreview';
import { ResumeTemplates } from './ResumeTemplates';
import { ResumeEditor } from './ResumeEditor';
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
  const [selectedTemplate, setSelectedTemplate] = useState<string>();
  const [resume, setResume] = useState<ResumeContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState<'category' | 'template' | 'generate'>('category');

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
    if (!selectedCategory || !selectedTemplate) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const generatedResume = await apiClient.generateResume(selectedCategory);
      setResume(generatedResume);
    } catch (err: any) {
      setError(err.message);
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
    setIsEditing(true);
  };

  const handleSaveEdit = (updatedResume: ResumeContent) => {
    setResume(updatedResume);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleCategorySelect = (category: JobCategory) => {
    setSelectedCategory(category);
    setStep('template');
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setStep('generate');
  };

  const handleBack = () => {
    if (step === 'template') {
      setStep('category');
      setSelectedTemplate(undefined);
    } else if (step === 'generate') {
      setStep('template');
    }
  };

  if (isEditing && resume) {
    return (
      <ResumeEditor
        resume={resume}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    );
  }

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
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'category' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'template' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'generate' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
          {step !== 'category' && (
            <Button onClick={handleBack} variant="outline" size="sm">
              이전
            </Button>
          )}
        </div>

        {step === 'category' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">직무 선택</h2>
            <JobCategorySelector 
              selectedCategory={selectedCategory}
              onSelect={handleCategorySelect}
            />
          </div>
        )}

        {step === 'template' && selectedCategory && (
          <ResumeTemplates
            selectedCategory={selectedCategory}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleTemplateSelect}
          />
        )}

        {step === 'generate' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">이력서 생성</h2>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                선택된 직무: <span className="font-semibold text-blue-600">{selectedCategory}</span><br/>
                선택된 템플릿: <span className="font-semibold text-blue-600">{selectedTemplate}</span><br/>
                작성된 문서: <span className="font-semibold text-blue-600">{documentCount}개</span>
                {documentCount === 0 && (
                  <p className="text-orange-600 mt-2">
                    이력서 생성을 위해 먼저 문서를 작성해주세요.
                  </p>
                )}
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                <Button 
                  onClick={() => setError(null)} 
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  다시 시도
                </Button>
              </div>
            )}
            
            <Button 
              onClick={handleGenerate}
              disabled={!selectedCategory || !selectedTemplate || isGenerating || documentCount === 0}
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
          </div>
        )}
      </div>
    </Card>
  );
}