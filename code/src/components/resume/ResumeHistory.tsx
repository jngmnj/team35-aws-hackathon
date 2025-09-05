'use client';

import { useState, useEffect } from 'react';
import { ResumeContent, JobCategory } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { FileText } from 'lucide-react';

interface ResumeHistoryProps {
  onSelectResume: (resume: ResumeContent) => void;
}

const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  developer: '개발자',
  pm: 'PM',
  designer: '디자이너',
  marketer: '마케터',
  data: '데이터 사이언티스트'
};

export function ResumeHistory({ onSelectResume }: ResumeHistoryProps) {
  const [resumes, setResumes] = useState<ResumeContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        setIsLoading(true);
        const categories: JobCategory[] = ['developer', 'pm', 'designer', 'marketer', 'data'];
        const resumePromises = categories.map(category => 
          apiClient.getResume(category).catch(() => null)
        );
        
        const results = await Promise.all(resumePromises);
        const validResumes = results.filter((resume): resume is ResumeContent => resume !== null);
        setResumes(validResumes);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadResumes();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          다시 시도
        </Button>
      </Card>
    );
  }

  if (resumes.length === 0) {
    return (
      <Card className="p-12 text-center bg-accent">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">생성된 이력서가 없습니다</h3>
        <p className="text-muted-foreground">첫 번째 이력서를 생성해보세요.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {resumes.map((resume) => (
        <Card key={resume.resumeId} className="p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary hover:border-l-primary/80" onClick={() => onSelectResume(resume)}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                  {JOB_CATEGORY_LABELS[resume.jobCategory]}
                </span>
                <span className="text-muted-foreground text-sm">
                  {new Date(resume.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <h4 className="font-bold text-xl text-foreground mb-1">{resume.content.personalInfo.name}</h4>
              <p className="text-muted-foreground text-sm mb-3">
                {resume.content.experience[0]?.title || '경험 정보 없음'} • {resume.content.experience[0]?.company || ''}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {resume.content.skills.slice(0, 4).map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs font-medium">
                    {skill}
                  </span>
                ))}
                {resume.content.skills.length > 4 && (
                  <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
                    +{resume.content.skills.length - 4}개 더
                  </span>
                )}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>성과 {resume.content.achievements.length}개</span>
                <span className="mx-2">•</span>
                <span>경험 {resume.content.experience.length}개</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}