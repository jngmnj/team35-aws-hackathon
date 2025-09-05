'use client';

import { useState, useEffect } from 'react';
import { ResumeContent } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';

interface ResumeHistoryProps {
  onSelectResume: (resume: ResumeContent) => void;
}

export function ResumeHistory({ onSelectResume }: ResumeHistoryProps) {
  const [history, setHistory] = useState<ResumeContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API call
    const mockHistory: ResumeContent[] = [
      {
        resumeId: '1',
        userId: 'user1',
        jobCategory: 'developer',
        content: {
          personalInfo: {
            name: '김개발',
            email: 'dev@example.com'
          },
          experience: [
            {
              title: '시니어 개발자',
              company: '테크 컴퍼니',
              duration: '2022.01 - 현재',
              description: 'React 기반 웹 애플리케이션 개발'
            }
          ],
          skills: ['React', 'TypeScript', 'Node.js'],
          achievements: ['프로젝트 성공적 완료', '팀 생산성 향상']
        },
        createdAt: '2024-12-19T10:00:00Z'
      }
    ];
    
    setTimeout(() => {
      setHistory(mockHistory);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleDownload = (resume: ResumeContent) => {
    const content = `
이력서 - ${resume.content.personalInfo.name}

개인정보:
이름: ${resume.content.personalInfo.name}
이메일: ${resume.content.personalInfo.email}

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
    a.download = `resume_${resume.jobCategory}_${new Date(resume.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">아직 생성된 이력서가 없습니다.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">이력서 기록</h3>
      {history.map((resume) => (
        <Card key={resume.resumeId} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                  {resume.jobCategory}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(resume.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <h4 className="font-semibold mb-1">{resume.content.personalInfo.name}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {resume.content.experience[0]?.title} • {resume.content.experience[0]?.company}
              </p>
              <div className="flex flex-wrap gap-1">
                {resume.content.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {resume.content.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    +{resume.content.skills.length - 3}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                onClick={() => onSelectResume(resume)}
                size="sm"
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-1" />
                보기
              </Button>
              <Button
                onClick={() => handleDownload(resume)}
                size="sm"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-1" />
                다운로드
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}