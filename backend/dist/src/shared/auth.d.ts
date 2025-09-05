export interface AuthResult {
    success: boolean;
    userId?: string;
    email?: string;
    error?: string;
}
export declare function verifyToken(authHeader?: string): AuthResult;
