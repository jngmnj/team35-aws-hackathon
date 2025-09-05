import { DocumentType, DocumentValidationResult } from '../types/document';

export function validateDocumentType(type: string): type is DocumentType {
  return ['experience', 'skills', 'values', 'achievements'].includes(type);
}

export function validateDocumentData(type: DocumentType, title: string, content?: string): DocumentValidationResult {
  const errors: string[] = [];

  // Common validation
  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (title && title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (content && content.length > 10000) {
    errors.push('Content must be less than 10,000 characters');
  }

  // Type-specific validation
  switch (type) {
    case 'experience':
      validateExperience(title, content, errors);
      break;
    case 'skills':
      validateSkills(title, content, errors);
      break;
    case 'values':
      validateValues(title, content, errors);
      break;
    case 'achievements':
      validateAchievements(title, content, errors);
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateExperience(title: string, content: string = '', errors: string[]): void {
  if (title && !title.match(/^[a-zA-Z0-9\s\-.,()&]+$/)) {
    errors.push('Experience title contains invalid characters');
  }
}

function validateSkills(title: string, content: string = '', errors: string[]): void {
  if (title && !title.match(/^[a-zA-Z0-9\s\-.,()&/+#]+$/)) {
    errors.push('Skills title contains invalid characters');
  }
}

function validateValues(title: string, content: string = '', errors: string[]): void {
  if (title && !title.match(/^[a-zA-Z0-9\s\-.,()&]+$/)) {
    errors.push('Values title contains invalid characters');
  }
}

function validateAchievements(title: string, content: string = '', errors: string[]): void {
  if (title && !title.match(/^[a-zA-Z0-9\s\-.,()&]+$/)) {
    errors.push('Achievements title contains invalid characters');
  }
}