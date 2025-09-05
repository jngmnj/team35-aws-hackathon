'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnalysisResults } from '@/components/analysis/AnalysisResults';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

interface PersonalityAnalysis {
  personalityType: {
    type: string;
    description: string;
    traits: string[];
  };
  strengths: string[];
  weaknesses: string[];
  values: string[];
  interests: string[];
}

interface Document {
  id: number;
  title: string;
  type: string;
}

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<PersonalityAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    loadDocuments();
    loadExistingAnalysis();
  }, []);

  const loadDocuments = async () => {
    // Mock 데이터
    setDocuments([
      { id: 1, title: '팀 프로젝트 경험', type: 'experience' },
      { id: 2, title: '기술 스택', type: 'skills' },
      { id: 3, title: '가치관', type: 'values' }
    ]);
  };

  const loadExistingAnalysis = async () => {
    // Mock 데이터 - 기존 분석 없음
  };

  const generateAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Mock 데이터로 테스트
    setTimeout(() => {
      const mockAnalysis = {
        personalityType: {
          type: "ENFJ",
          description: "리더십과 협업을 중시하는 성격으로, 팀원들을 이끌고 동기부여하는 능력이 뛰어납니다.",
          traits: ["리더십", "협업 능력", "학습 지향적"]
        },
        strengths: ["팀 리더십", "기술 학습 능력", "문제 해결력", "커뮤니케이션"],
        weaknesses: ["완벽주의 성향", "시간 관리"],
        values: ["팀워크", "지속적 학습", "품질 중시", "사용자 경험"],
        interests: ["웹 개발", "프론트엔드", "사용자 경험", "기술 혁신"]
      };
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">성격 분석</h1>
          <p className="text-gray-600">AI가 분석한 당신의 성격과 특성을 확인해보세요</p>
        </div>
        
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              작성된 문서: {documents.length}개
            </div>
            
            <Button 
              onClick={generateAnalysis}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? '성격 분석 중...' : '성격 분석 시작'}
            </Button>
          </div>
        </Card>

        {analysis ? (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">성격 유형</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-blue-800 mb-2">
                  {analysis.personalityType.type}
                </h3>
                <p className="text-gray-700 mb-3">{analysis.personalityType.description}</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.personalityType.traits.map((trait, index) => (
                    <span key={index} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3 text-green-700">강점</h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3 text-orange-700">개선 영역</h3>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2">●</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-700">핵심 가치관</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.values.map((value, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {value}
                    </span>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3 text-indigo-700">관심 분야</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.interests.map((interest, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <AnalysisResults />
        )}
      </div>
    </ProtectedRoute>
  );
}