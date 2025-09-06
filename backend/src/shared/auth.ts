import { verifyToken as verifyJWT } from './jwt';

export interface AuthResult {
  success: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

export function verifyToken(authHeader?: string): AuthResult {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);
  const result = verifyJWT(token);
  
  if (!result.success || !result.payload) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    userId: result.payload.userId,
    email: result.payload.email,
  };
}