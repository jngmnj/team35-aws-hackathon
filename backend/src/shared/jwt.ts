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
  return jwt.sign(payload, process.env.JWT_SECRET!, { 
    expiresIn: '24h',
    issuer: 'resume-generator'
  });
}

export function verifyToken(token: string): TokenResult {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    return { success: true, payload };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
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