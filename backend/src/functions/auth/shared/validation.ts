export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateDocumentType(type: string): boolean {
  const validTypes = [
    'experience', 'skills', 'values', 'achievements',
    'daily_record', 'mood_tracker', 'reflection', 'test_result'
  ];
  return validTypes.includes(type.toLowerCase());
}

export function validatePassword(password: string): boolean {
  return password && password.length >= 6;
}

export function validateRequired(value: any): boolean {
  return value !== null && value !== undefined && value !== '';
}