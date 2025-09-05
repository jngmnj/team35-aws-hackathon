'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/types';
import { apiClient } from '@/lib/api';

export function useAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await apiClient.getAnalysis();
      setAnalyses(results);
      if (results.length > 0) {
        setAnalysis(results[0]); // 가장 최근 분석 결과
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiClient.generateAnalysis();
      setAnalysis(result);
      return result;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    loadAnalysis();
  }, []);

  return {
    analysis,
    analyses,
    isLoading,
    error,
    generateAnalysis,
    loadAnalysis,
    clearError
  };
}