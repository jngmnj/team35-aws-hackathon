import { verifyToken as jwtVerify } from './jwt';

export interface AuthResult {
  success: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

export function verifyToken(authHeader?: string): AuthResult {
  if (!authHeader) {
    return { success: false, error: 'No authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return { success: false, error: 'No token provided' };
  }

  const result = jwtVerify(token);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    userId: result.payload?.userId,
    email: result.payload?.email
  };
}