'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { useDocuments } from '@/hooks/useDocuments';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { FileText, Brain, FileUser, Plus } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { documents, isLoading } = useDocuments();

  const documentCounts = {
    experience: documents.filter(d => d.type === 'experience').length,
    skills: documents.filter(d => d.type === 'skills').length,
    values: documents.filter(d => d.type === 'values').length,
    achievements: documents.filter(d => d.type === 'achievements').length,
  };

  const totalDocuments = Object.values(documentCounts).reduce((sum, count) => sum + count, 0);
  const canAnalyze = totalDocuments >= 2; // Need at least 2 documents for analysis

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{user?.name}님, 다시 만나서 반가워요!</h1>
            <p className="text-gray-600">진행 상황을 확인하고 문서에서 인사이트를 얻어보세요.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">전체 문서</p>
                  <p className="text-2xl font-bold">{totalDocuments}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">경험</p>
                <p className="text-2xl font-bold">{documentCounts.experience}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">E</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">기술</p>
                <p className="text-2xl font-bold">{documentCounts.skills}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">S</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">성과</p>
                <p className="text-2xl font-bold">{documentCounts.achievements}</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold">A</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col">
            <div className="text-center flex-1 flex flex-col">
              <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">문서 관리</h3>
              <p className="text-gray-600 mb-4 flex-1">경험, 기술, 가치관, 성과를 작성하고 편집하세요.</p>
              <Link href="/documents">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  문서 관리하기
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="text-center flex-1 flex flex-col">
              <Brain className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI 성격 분석</h3>
              <p className="text-gray-600 mb-4 flex-1">당신의 성격과 강점에 대한 인사이트를 얻어보세요.</p>
              <div className="mt-auto">
                <Link href="/analysis">
                  <Button 
                    className="w-full" 
                    disabled={!canAnalyze}
                    variant={canAnalyze ? "default" : "secondary"}
                  >
                    {canAnalyze ? '분석 시작하기' : '문서가 더 필요합니다'}
                  </Button>
                </Link>
                {!canAnalyze && (
                  <p className="text-xs text-gray-500 mt-2">분석을 위해 최소 2개의 문서가 필요합니다</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="text-center flex-1 flex flex-col">
              <FileUser className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">이력서 생성</h3>
              <p className="text-gray-600 mb-4 flex-1">다양한 직무 분야에 맞춤형 이력서를 생성하세요.</p>
              <div className="mt-auto">
                <Link href="/resume">
                  <Button 
                    className="w-full"
                    disabled={!canAnalyze}
                    variant={canAnalyze ? "default" : "secondary"}
                  >
                    {canAnalyze ? '이력서 생성하기' : '분석이 먼저 필요합니다'}
                  </Button>
                </Link>
                {!canAnalyze && (
                  <p className="text-xs text-gray-500 mt-2">이력서 생성을 위해 분석을 완료해주세요</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Start Guide */}
        {totalDocuments === 0 && (
          <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">시작하기</h3>
            <div className="space-y-2 text-blue-700">
              <p>1. 경험, 기술, 가치관, 성과에 대한 문서를 작성하세요</p>
              <p>2. AI 분석을 통해 당신의 성격과 강점을 파악하세요</p>
              <p>3. 다양한 직무 분야에 맞춤형 이력서를 생성하세요</p>
            </div>
            <Link href="/documents">
              <Button className="mt-4">첫 번째 문서 작성하기</Button>
            </Link>
          </Card>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}