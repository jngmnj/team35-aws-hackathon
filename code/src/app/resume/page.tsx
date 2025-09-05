'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

interface Document {
  id: number;
  title: string;
  type: string;
}

export default function ResumePage() {
  const [jobCategory, setJobCategory] = useState('');
  const [resume, setResume] = useState<ResumeContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    // Mock 데이터
    setDocuments([
      { id: 1, title: '팀 프로젝트 경험', type: 'experience' },
      { id: 2, title: '기술 스택', type: 'skills' },
      { id: 3, title: '가치관', type: 'values' }
    ]);
  };

  const generateResume = async () => {
    if (!jobCategory) return;
    
    setIsGenerating(true);
    
    // Mock 데이터로 테스트
    setTimeout(() => {
      const mockResume = {
        personalInfo: {
          summary: `${jobCategory} 분야의 전문성을 갖춘 개발자로, 3년간의 실무 경험과 팀 리더십 능력을 보유하고 있습니다.`
        },
        experience: [
          {
            title: "Senior Frontend Developer",
            company: "팀 프로젝트",
            duration: "2022.03 - 현재",
            description: "React와 TypeScript를 활용한 웹 애플리케이션 개발. 성능 최적화를 통해 로딩 시간 30% 단축 달성."
          },
          {
            title: "Frontend Developer",
            company: "스타트업 프로젝트",
            duration: "2021.01 - 2022.02",
            description: "5명 규모의 개발팀에서 팀 리더 역할 수행. 사용자 만족도 95% 달성."
          }
        ],
        skills: [
          "JavaScript", "TypeScript", "React", "Node.js", 
          "HTML/CSS", "Git", "문제해결력", "팀워크", "커뮤니케이션"
        ],
        achievements: [
          "팀 프로젝트 기한 내 성공적 완료",
          "코드 리뷰를 통한 버그 50% 감소",
          "사용자 만족도 95% 달성",
          "팀원들의 기술 역량 향상에 기여"
        ]
      };
      setResume(mockResume);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">이력서 생성</h1>
      
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">직무 카테고리</label>
            <select 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={jobCategory}
              onChange={(e) => setJobCategory(e.target.value)}
            >
              <option value="">직무를 선택하세요</option>
              <option value="Frontend Developer">프론트엔드 개발자</option>
              <option value="Backend Developer">백엔드 개발자</option>
              <option value="Full Stack Developer">풀스택 개발자</option>
              <option value="Data Scientist">데이터 사이언티스트</option>
              <option value="Product Manager">프로덕트 매니저</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            작성된 문서: {documents.length}개
          </div>
          
          <Button 
            onClick={generateResume}
            disabled={!jobCategory || isGenerating}
            className="w-full"
          >
            {isGenerating ? '이력서 생성 중...' : '이력서 생성'}
          </Button>
        </div>
      </Card>

      {resume && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">생성된 이력서</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">요약</h3>
              <p className="text-gray-700">{resume.personalInfo.summary}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">경험</h3>
              <div className="space-y-3">
                {resume.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-500 pl-4">
                    <h4 className="font-medium">{exp.title} - {exp.company}</h4>
                    <p className="text-sm text-gray-600">{exp.duration}</p>
                    <p className="text-sm mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">기술</h3>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">주요 성과</h3>
              <ul className="list-disc list-inside space-y-1">
                {resume.achievements.map((achievement, index) => (
                  <li key={index} className="text-gray-700">{achievement}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}