'use client';

import { AnalysisResult } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Target, Brain } from 'lucide-react';

interface EnhancedInsightsDisplayProps {
  analysis: AnalysisResult;
  documentTypes: string[];
  isLoading?: boolean;
}

export function EnhancedInsightsDisplay({ analysis, documentTypes, isLoading }: EnhancedInsightsDisplayProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const hasNewDataTypes = documentTypes.some(type => 
    ['daily_record', 'mood_tracker', 'reflection', 'test_result'].includes(type)
  );

  return (
    <div className="space-y-6">
      {/* 데이터 소스 표시 */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-900 flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          통합 분석 데이터 소스
        </h3>
        <div className="flex flex-wrap gap-2">
          {documentTypes.map((type) => (
            <Badge 
              key={type} 
              variant={['daily_record', 'mood_tracker', 'reflection', 'test_result'].includes(type) ? 'default' : 'secondary'}
              className="text-xs"
            >
              {type === 'daily_record' && '일상 기록'}
              {type === 'mood_tracker' && '기분 추적'}
              {type === 'reflection' && '성찰 기록'}
              {type === 'test_result' && '테스트 결과'}
              {type === 'experience' && '경험'}
              {type === 'skills' && '기술'}
              {type === 'values' && '가치관'}
              {type === 'achievements' && '성과'}
            </Badge>
          ))}
        </div>
        {hasNewDataTypes && (
          <p className="text-sm text-blue-700 mt-3">
            ✨ 일상 기록과 테스트 결과가 포함된 다차원 분석이 적용되었습니다.
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 핵심 가치관 */}
        <Card className="p-6 bg-accent border-accent hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold mb-4 text-primary flex items-center">
            <Target className="w-5 h-5 mr-3" />
            핵심 가치관
          </h3>
          <ul className="space-y-3">
            {analysis.result.values.map((value, index) => (
              <li key={index} className="flex items-start group">
                <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span className="text-foreground leading-relaxed">{value}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* 관심 분야 */}
        <Card className="p-6 bg-accent border-accent hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold mb-4 text-primary flex items-center">
            <TrendingUp className="w-5 h-5 mr-3" />
            관심 분야
          </h3>
          <ul className="space-y-3">
            {analysis.result.interests.map((interest, index) => (
              <li key={index} className="flex items-start group">
                <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span className="text-foreground leading-relaxed">{interest}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* 성장 패턴 (새로운 기능) */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold mb-4 text-green-800 flex items-center">
            <Calendar className="w-5 h-5 mr-3" />
            성장 패턴
          </h3>
          {hasNewDataTypes ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">자기 성찰 빈도</span>
                <Badge variant="outline" className="text-green-800 border-green-300">
                  {documentTypes.includes('reflection') ? '높음' : '보통'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">일상 기록 활용</span>
                <Badge variant="outline" className="text-green-800 border-green-300">
                  {documentTypes.includes('daily_record') ? '활발함' : '기본'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">객관적 평가</span>
                <Badge variant="outline" className="text-green-800 border-green-300">
                  {documentTypes.includes('test_result') ? '체계적' : '주관적'}
                </Badge>
              </div>
              <p className="text-xs text-green-600 mt-3 p-2 bg-green-100 rounded">
                💡 다양한 데이터를 활용한 체계적 자기관리 패턴을 보여줍니다.
              </p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>일상 기록과 성찰 데이터가 추가되면</p>
              <p>더 정확한 성장 패턴을 분석할 수 있습니다.</p>
            </div>
          )}
        </Card>
      </div>

      {/* 통합 인사이트 */}
      {hasNewDataTypes && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <h3 className="text-lg font-semibold mb-4 text-purple-900 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            통합 분석 인사이트
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-purple-800">데이터 기반 강점</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                {documentTypes.includes('daily_record') && (
                  <li>• 일상 패턴을 통한 자기 인식 능력</li>
                )}
                {documentTypes.includes('reflection') && (
                  <li>• 체계적인 자기 성찰 습관</li>
                )}
                {documentTypes.includes('test_result') && (
                  <li>• 객관적 지표 활용 능력</li>
                )}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-800">발전 방향</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• 데이터와 직관의 균형 유지</li>
                <li>• 분석 결과의 실행력 강화</li>
                <li>• 지속적인 피드백 루프 구축</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}