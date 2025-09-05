'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Edit } from 'lucide-react';

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

interface ResumePreviewProps {
  resume: ResumeContentDisplay;
  onDownload: () => void;
  onEdit: () => void;
}

export function ResumePreview({ resume, onDownload, onEdit }: ResumePreviewProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">생성된 이력서</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit} size="sm">
            <Edit className="w-4 h-4 mr-2" />
            수정
          </Button>
          <Button onClick={onDownload} size="sm">
            <Download className="w-4 h-4 mr-2" />
            다운로드
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-3 text-blue-700 border-b border-blue-200 pb-1">
            요약
          </h3>
          <p className="text-gray-700 leading-relaxed">{resume.personalInfo.summary}</p>
        </section>
        
        <section>
          <h3 className="text-lg font-semibold mb-3 text-blue-700 border-b border-blue-200 pb-1">
            경험
          </h3>
          <div className="space-y-4">
            {resume.experience.map((exp, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                <p className="text-blue-600 font-medium">{exp.company}</p>
                <p className="text-sm text-gray-500 mb-2">{exp.duration}</p>
                <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h3 className="text-lg font-semibold mb-3 text-blue-700 border-b border-blue-200 pb-1">
            기술 스택
          </h3>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, index) => (
              <span 
                key={index} 
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
        
        <section>
          <h3 className="text-lg font-semibold mb-3 text-blue-700 border-b border-blue-200 pb-1">
            주요 성과
          </h3>
          <ul className="space-y-2">
            {resume.achievements.map((achievement, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                <span className="text-gray-700">{achievement}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Card>
  );
}