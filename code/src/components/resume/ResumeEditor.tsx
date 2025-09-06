'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ResumeContent } from '@/types';
import { Save, Plus, Trash2 } from 'lucide-react';

interface ResumeEditorProps {
  resume: ResumeContent;
  onSave: (updatedResume: ResumeContent) => void;
  onCancel: () => void;
}

export function ResumeEditor({ resume, onSave, onCancel }: ResumeEditorProps) {
  const [editedResume, setEditedResume] = useState<ResumeContent>(resume);

  const updatePersonalInfo = (field: string, value: string) => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content,
        personalInfo: {
          ...prev.content.personalInfo,
          [field]: value
        }
      }
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content,
        experience: prev.content.experience.map((exp, i) => 
          i === index ? { ...exp, [field]: value } : exp
        )
      }
    }));
  };

  const addExperience = () => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content,
        experience: [
          ...prev.content.experience,
          { title: '', company: '', duration: '', description: '' }
        ]
      }
    }));
  };

  const removeExperience = (index: number) => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content,
        experience: prev.content.experience.filter((_, i) => i !== index)
      }
    }));
  };

  const updateSkills = (skills: string) => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content,
        skills: skills.split(',').map(s => s.trim()).filter(s => s)
      }
    }));
  };

  const updateAchievements = (achievements: string) => {
    setEditedResume(prev => ({
      ...prev,
      content: {
        ...prev.content,
        achievements: achievements.split('\n').filter(a => a.trim())
      }
    }));
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">이력서 편집</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button onClick={() => onSave(editedResume)}>
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Personal Info */}
        <section>
          <h3 className="text-lg font-semibold mb-4">개인 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">이름</label>
              <Input
                value={editedResume.content.personalInfo.name}
                onChange={(e) => updatePersonalInfo('name', e.target.value)}
                placeholder="이름을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">이메일</label>
              <Input
                value={editedResume.content.personalInfo.email}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                placeholder="이메일을 입력하세요"
              />
            </div>
          </div>
        </section>

        {/* Experience */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">경험</h3>
            <Button onClick={addExperience} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              경험 추가
            </Button>
          </div>
          <div className="space-y-4">
            {editedResume.content.experience.map((exp, index) => (
              <Card key={index} className="p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium">경험 {index + 1}</h4>
                  <Button
                    onClick={() => removeExperience(index)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">직책</label>
                    <Input
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      placeholder="직책을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">회사</label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      placeholder="회사명을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">기간</label>
                    <Input
                      value={exp.duration}
                      onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                      placeholder="2020.01 - 2022.12"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">설명</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      placeholder="담당 업무와 성과를 입력하세요"
                      className="w-full p-2 border border-gray-300 rounded-md resize-none h-20"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h3 className="text-lg font-semibold mb-4">기술 스택</h3>
          <div>
            <label className="block text-sm font-medium mb-2">기술 (쉼표로 구분)</label>
            <Input
              value={editedResume.content.skills.join(', ')}
              onChange={(e) => updateSkills(e.target.value)}
              placeholder="React, TypeScript, Node.js"
            />
          </div>
        </section>

        {/* Achievements */}
        <section>
          <h3 className="text-lg font-semibold mb-4">주요 성과</h3>
          <div>
            <label className="block text-sm font-medium mb-2">성과 (줄바꿈으로 구분)</label>
            <textarea
              value={editedResume.content.achievements.join('\n')}
              onChange={(e) => updateAchievements(e.target.value)}
              placeholder="프로젝트 성공적 완료&#10;팀 생산성 30% 향상"
              className="w-full p-3 border border-gray-300 rounded-md resize-none h-32"
            />
          </div>
        </section>
      </div>
    </Card>
  );
}