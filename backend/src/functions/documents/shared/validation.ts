import { DocumentType } from './types';

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateDocumentType(type: string): boolean {
  const validTypes = ['experience', 'skills', 'values', 'achievements', 'daily_record', 'mood_tracker', 'reflection', 'test_result'];
  return validTypes.includes(type.toLowerCase());
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateDocumentData(type: DocumentType, title: string, content?: string): ValidationResult {
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (title && title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (content && content.length > 10000) {
    errors.push('Content must be less than 10,000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePassword(password: string): boolean {
  return password && password.length >= 6;
}

export function validateRequired(value: any): boolean {
  return value !== null && value !== undefined && value !== '';
}