'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { JobCategorySelector, JobCategory } from './JobCategorySelector';
import { ResumePreview } from './ResumePreview';
import { Loader2 } from 'lucide-react';

interface ResumeContent {
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
  documentsCount: number;
  onGenerate?: (category: JobCategory) => Promise<ResumeContent>;
}

export function ResumeGenerator({ documentsCount, onGenerate }: ResumeGeneratorProps) {
  const [selectedCategory, setSelectedCategory] = useState<JobCategory>();
  const [resume, setResume] = useState<ResumeContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedCategory) return;
    
    setIsGenerating(true);
    
    try {
      if (onGenerate) {
        const generatedResume = await onGenerate(selectedCategory);
        setResume(generatedResume);
      } else {
        // Mock data fallback
        const mockResume = generateMockResume(selectedCategory);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setResume(mockResume);
      }
    } catch (error) {
      console.error('Resume generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockResume = (category: JobCategory): ResumeContent => {
    const categoryMap = {
      developer: '개발자',
      pm: '프로덕트 매니저',
      designer: '디자이너',
      marketer: '마케터',
      data: '데이터 사이언티스트'
    };

    return {
      personalInfo: {
        summary: `${categoryMap[category]} 분야의 전문성을 갖춘 전문가로, 3년간의 실무 경험과 팀 리더십 능력을 보유하고 있습니다.`
      },
      experience: [
        {
          title: `Senior ${categoryMap[category]}`,
          company: "테크 스타트업",
          duration: "2022.03 - 현재",
          description: "팀을 이끌며 프로젝트를 성공적으로 완료하고 성과를 달성했습니다."
        },
        {
          title: categoryMap[category],
          company: "IT 기업",
          duration: "2021.01 - 2022.02",
          description: "다양한 프로젝트 경험을 통해 전문성을 키웠습니다."
        }
      ],
      skills: category === 'developer' 
        ? ["JavaScript", "TypeScript", "React", "Node.js", "Git"]
        : category === 'designer'
        ? ["Figma", "Adobe Creative Suite", "UI/UX", "프로토타이핑"]
        : ["문제해결력", "팀워크", "커뮤니케이션", "프로젝트 관리"],
      achievements: [
        "프로젝트 기한 내 성공적 완료",
        "팀 성과 향상에 기여",
        "사용자 만족도 95% 달성",
        "효율적인 업무 프로세스 구축"
      ]
    };
  };

  const handleDownload = () => {
    if (!resume) return;
    
    const content = `
이력서

요약: ${resume.personalInfo.summary}

경험:
${resume.experience.map(exp => `${exp.title} - ${exp.company} (${exp.duration})\n${exp.description}`).join('\n\n')}

기술: ${resume.skills.join(', ')}

성과:
${resume.achievements.map(achievement => `• ${achievement}`).join('\n')}
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
    return (
      <ResumePreview 
        resume={resume} 
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
          작성된 문서: {documentsCount}개
        </div>
        
        <Button 
          onClick={handleGenerate}
          disabled={!selectedCategory || isGenerating}
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
    </Card>
  );
}