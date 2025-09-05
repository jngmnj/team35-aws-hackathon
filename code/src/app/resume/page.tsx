'use client';

import { useState } from 'react';
import { ResumeGenerator } from '@/components/resume/ResumeGenerator';
import { ResumeHistory } from '@/components/resume/ResumeHistory';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ResumeContent } from '@/types';

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [selectedResume, setSelectedResume] = useState<ResumeContent | null>(null);

  const handleSelectResume = (resume: ResumeContent) => {
    setSelectedResume(resume);
    setActiveTab('create');
  };

  const handleDownload = () => {
    if (!selectedResume) return;
    
    const content = `
이력서 - ${selectedResume.content.personalInfo.name}

개인정보:
이름: ${selectedResume.content.personalInfo.name}
이메일: ${selectedResume.content.personalInfo.email}

경험:
${selectedResume.content.experience.map(exp => `${exp.title} - ${exp.company} (${exp.duration})\n${exp.description}`).join('\n\n')}

기술: ${selectedResume.content.skills.join(', ')}

성과:
${selectedResume.content.achievements.map(achievement => `• ${achievement}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${selectedResume.jobCategory}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEdit = () => {
    setSelectedResume(null);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">이력서 생성</h1>
          <p className="text-gray-600">AI가 당신의 문서를 분석하여 맞춤형 이력서를 생성합니다</p>
        </div>
        
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab('create');
                setSelectedResume(null);
              }}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'create'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              이력서 생성
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              이력서 기록
            </button>
          </div>
        </div>

        {activeTab === 'create' ? (
          selectedResume ? (
            <ResumePreview 
              resume={{
                personalInfo: { summary: selectedResume.content.personalInfo.name },
                experience: selectedResume.content.experience,
                skills: selectedResume.content.skills,
                achievements: selectedResume.content.achievements
              }}
              onDownload={handleDownload}
              onEdit={handleEdit}
            />
          ) : (
            <ResumeGenerator />
          )
        ) : (
          <ResumeHistory onSelectResume={handleSelectResume} />
        )}
      </div>
    </ProtectedRoute>
  );
}