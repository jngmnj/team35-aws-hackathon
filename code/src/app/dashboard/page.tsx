'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { useDocuments } from '@/hooks/useDocuments';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { FileText, Sparkles, FileUser, Plus, Briefcase, Code2, Trophy } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">

        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">{user?.name}님, 다시 만나서 반가워요!</h1>
            <p className="text-muted-foreground">진행 상황을 확인하고 문서에서 인사이트를 얻어보세요.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">전체 문서</p>
                  <p className="text-2xl font-bold text-foreground">{totalDocuments}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">경험</p>
                <p className="text-2xl font-bold text-foreground">{documentCounts.experience}</p>
              </div>
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">기술</p>
                <p className="text-2xl font-bold text-foreground">{documentCounts.skills}</p>
              </div>
              <Code2 className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">성과</p>
                <p className="text-2xl font-bold text-foreground">{documentCounts.achievements}</p>
              </div>
              <Trophy className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col">
            <div className="text-center flex-1 flex flex-col">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">문서 관리</h3>
              <p className="text-muted-foreground mb-4 flex-1">경험, 기술, 가치관, 성과를 작성하고 편집하세요.</p>
              <Link href="/documents" className="cursor-pointer">
                <Button className="w-full cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  문서 관리하기
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="text-center flex-1 flex flex-col">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">AI 성격 분석</h3>
              <p className="text-muted-foreground mb-4 flex-1">당신의 성격과 강점에 대한 인사이트를 얻어보세요.</p>
              <div className="mt-auto">
                <Link href="/analysis" className={canAnalyze ? "cursor-pointer" : "cursor-not-allowed"}>
                  <Button 
                    className={`w-full ${canAnalyze ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    disabled={!canAnalyze}
                    variant={canAnalyze ? "default" : "secondary"}
                  >
                    {canAnalyze ? '분석 시작하기' : '문서가 더 필요합니다'}
                  </Button>
                </Link>
                {!canAnalyze && (
                  <p className="text-xs text-muted-foreground mt-2">분석을 위해 최소 2개의 문서가 필요합니다</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="text-center flex-1 flex flex-col">
              <FileUser className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">이력서 생성</h3>
              <p className="text-muted-foreground mb-4 flex-1">다양한 직무 분야에 맞춤형 이력서를 생성하세요.</p>
              <div className="mt-auto">
                <Link href="/resume" className={canAnalyze ? "cursor-pointer" : "cursor-not-allowed"}>
                  <Button 
                    className={`w-full ${canAnalyze ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    disabled={!canAnalyze}
                    variant={canAnalyze ? "default" : "secondary"}
                  >
                    {canAnalyze ? '이력서 생성하기' : '분석이 먼저 필요합니다'}
                  </Button>
                </Link>
                {!canAnalyze && (
                  <p className="text-xs text-muted-foreground mt-2">이력서 생성을 위해 분석을 완료해주세요</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Start Guide */}
        {totalDocuments === 0 && (
          <Card className="p-6 mt-8 bg-accent border-accent">
            <h3 className="text-lg font-semibold mb-4 text-accent-foreground">시작하기</h3>
            <div className="space-y-2 text-accent-foreground">
              <p>1. 경험, 기술, 가치관, 성과에 대한 문서를 작성하세요</p>
              <p>2. AI 분석을 통해 당신의 성격과 강점을 파악하세요</p>
              <p>3. 다양한 직무 분야에 맞춤형 이력서를 생성하세요</p>
            </div>
            <Link href="/documents" className="cursor-pointer">
              <Button className="mt-4 cursor-pointer">첫 번째 문서 작성하기</Button>
            </Link>
          </Card>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}