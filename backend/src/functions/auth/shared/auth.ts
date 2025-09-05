import * as jwt from 'jsonwebtoken';

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

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return {
      success: true,
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}