import * as jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface TokenResult {
  success: boolean;
  token?: string;
  payload?: TokenPayload;
  error?: string;
}

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  return jwt.sign(payload, secret, { 
    expiresIn: '24h',
    issuer: 'resume-generator'
  });
}

export function verifyToken(token: string): TokenResult {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return { success: false, error: 'JWT configuration error' };
  }
  
  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    return { success: true, payload };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { success: false, error: 'Token expired' };
    }
    if (error.name === 'JsonWebTokenError') {
      return { success: false, error: 'Invalid token format' };
    }
    return { success: false, error: 'Token verification failed' };
  }
}

export function refreshToken(oldToken: string): TokenResult {
  const result = verifyToken(oldToken);
  if (!result.success || !result.payload) {
    return result;
  }
  
  const newToken = generateToken(result.payload);
  return { success: true, token: newToken, payload: result.payload };
}