'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/types';
import { apiClient } from '@/lib/api';

export function useAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiClient.getAnalysis();
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
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
    isLoading,
    error,
    generateAnalysis,
    loadAnalysis,
    clearError
  };
}