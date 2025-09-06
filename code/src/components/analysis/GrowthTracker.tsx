'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { TrendingUp, Calendar, BarChart3, Target, ArrowRight, Trash2 } from 'lucide-react';

interface GrowthTrackerProps {
  currentAnalysis?: AnalysisResult | null;
}

export function GrowthTracker({ currentAnalysis }: GrowthTrackerProps) {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    setIsLoading(true);
    try {
      const history = await apiClient.getAnalyses();
      setAnalyses(Array.isArray(history) ? history : []);
    } catch (error) {
      console.error('분석 히스토리 로드 실패:', error);
      setAnalyses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredAnalyses = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return analyses.filter(analysis => 
      new Date(analysis.createdAt) >= cutoffDate
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getGrowthInsights = () => {
    const filtered = getFilteredAnalyses();
    if (filtered.length < 2) return null;

    const latest = filtered[0];
    const previous = filtered[filtered.length - 1];

    return {
      strengthsGrowth: latest.result.strengths.length - previous.result.strengths.length,
      valuesEvolution: latest.result.values.filter(v => 
        !previous.result.values.includes(v)
      ),
      interestsExpansion: latest.result.interests.filter(i => 
        !previous.result.interests.includes(i)
      ),
      personalityStability: latest.result.personalityType.type === previous.result.personalityType.type
    };
  };

  const filteredAnalyses = getFilteredAnalyses();
  const growthInsights = getGrowthInsights();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold flex items-center mb-4">
            <TrendingUp className="w-6 h-6 mr-3 text-primary" />
            성장 추적
          </h2>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period === 'week' && '1주일'}
                {period === 'month' && '1개월'}
                {period === 'year' && '1년'}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-accent rounded-lg">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{filteredAnalyses.length}</div>
            <div className="text-sm text-muted-foreground">분석 횟수</div>
          </div>
          
          <div className="text-center p-4 bg-accent rounded-lg">
            <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">
              {growthInsights?.strengthsGrowth || 0 > 0 ? '+' : ''}{growthInsights?.strengthsGrowth || 0}
            </div>
            <div className="text-sm text-muted-foreground">강점 변화</div>
          </div>
          
          <div className="text-center p-4 bg-accent rounded-lg">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">
              {growthInsights?.personalityStability ? '안정' : '변화'}
            </div>
            <div className="text-sm text-muted-foreground">성격 유형</div>
          </div>
        </div>
      </Card>

      {/* 성장 인사이트 */}
      {growthInsights && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            성장 패턴 분석
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">새로운 가치관</h4>
              {growthInsights.valuesEvolution.length > 0 ? (
                <div className="space-y-2">
                  {growthInsights.valuesEvolution.map((value, index) => (
                    <Badge key={index} variant="outline" className="mr-2">
                      {value}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">기존 가치관이 안정적으로 유지되고 있습니다.</p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-3">확장된 관심사</h4>
              {growthInsights.interestsExpansion.length > 0 ? (
                <div className="space-y-2">
                  {growthInsights.interestsExpansion.map((interest, index) => (
                    <Badge key={index} variant="outline" className="mr-2">
                      {interest}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">기존 관심사에 집중하고 있습니다.</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 분석 히스토리 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          분석 히스토리
        </h3>
        
        {filteredAnalyses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>선택한 기간에 분석 기록이 없습니다.</p>
            <p className="text-sm mt-2">정기적인 분석을 통해 성장 패턴을 추적해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(showAll ? filteredAnalyses : filteredAnalyses.slice(0, 5)).map((analysis, index) => (
              <div key={analysis.analysisId} className="flex items-center justify-between p-4 bg-accent rounded-lg cursor-pointer hover:bg-accent/80 transition-colors" onClick={() => setSelectedAnalysis(analysis)}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{analysis.result.personalityType.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(analysis.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    강점 {analysis.result.strengths.length}개
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
            
            {filteredAnalyses.length > 5 && (
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? '접기' : `더 보기 (${filteredAnalyses.length - 5}개 더)`}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 개선 방향 제시 */}
      {currentAnalysis && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            개선 방향 제시
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">단기 목표 (1개월)</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 일상 기록을 통한 패턴 파악</li>
                <li>• 주요 강점 활용 기회 확대</li>
                <li>• 개선 영역 중 1개 집중 개발</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-3">장기 목표 (6개월)</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 성격 유형 특성 최대 활용</li>
                <li>• 새로운 관심 분야 탐색</li>
                <li>• 지속적인 자기 성찰 습관 구축</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>분석 결과 상세</DialogTitle>
          </DialogHeader>
          {selectedAnalysis && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{selectedAnalysis.result?.personalityType?.type || 'Unknown'}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedAnalysis.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {selectedAnalysis.result?.personalityType?.description || 'No description'}
              </p>

              {selectedAnalysis.result?.personalityType?.traits && (
                <div>
                  <h4 className="font-semibold mb-3">성격 특성</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.result.personalityType.traits.map((trait, index) => (
                      <Badge key={index} variant="outline">{trait}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedAnalysis.result?.strengths && selectedAnalysis.result.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">강점 ({selectedAnalysis.result.strengths.length}개)</h4>
                  <div className="grid gap-2">
                    {selectedAnalysis.result.strengths.map((strength, index) => (
                      <div key={index} className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="font-medium text-green-800 dark:text-green-200">{strength.title}</div>
                        <div className="text-sm text-green-600 dark:text-green-300 mt-1">{strength.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAnalysis.result?.weaknesses && selectedAnalysis.result.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">개선점 ({selectedAnalysis.result.weaknesses.length}개)</h4>
                  <div className="grid gap-2">
                    {selectedAnalysis.result.weaknesses.map((weakness, index) => (
                      <div key={index} className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <div className="font-medium text-orange-800 dark:text-orange-200">{weakness.title}</div>
                        <div className="text-sm text-orange-600 dark:text-orange-300 mt-1">{weakness.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}