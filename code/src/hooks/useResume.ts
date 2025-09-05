'use client';

import { useState, useEffect } from 'react';
import { ResumeContent, JobCategory } from '@/types';
import { apiClient } from '@/lib/api';

export function useResume() {
  const [resumes, setResumes] = useState<ResumeContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResume = async (jobCategory: JobCategory) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiClient.generateResume(jobCategory);
      setResumes(prev => [result, ...prev]);
      return result;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getResume = async (jobCategory: JobCategory) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiClient.getResume(jobCategory);
      return result;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    resumes,
    isLoading,
    error,
    generateResume,
    getResume,
    clearError
  };
}