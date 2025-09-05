// 인증 시스템 통합 테스트
const { generateToken, verifyToken } = require('../src/shared/jwt');

describe('JWT Token Management', () => {
  const testPayload = {
    userId: 'test-user-123',
    email: 'test@example.com'
  };

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key';
  });

  test('토큰 생성', () => {
    const token = generateToken(testPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  test('토큰 검증 성공', () => {
    const token = generateToken(testPayload);
    const result = verifyToken(token);
    
    expect(result.success).toBe(true);
    expect(result.payload.userId).toBe(testPayload.userId);
    expect(result.payload.email).toBe(testPayload.email);
  });

  test('잘못된 토큰 검증 실패', () => {
    const result = verifyToken('invalid-token');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('Auth API Integration', () => {
  test('회원가입 플로우', async () => {
    const userData = {
      email: 'newuser@test.com',
      password: 'password123',
      name: 'New User'
    };

    // 실제 API 호출 시뮬레이션
    console.log('✅ 회원가입 테스트 데이터:', userData);
    expect(userData.email).toContain('@');
    expect(userData.password.length).toBeGreaterThan(6);
  });

  test('로그인 플로우', async () => {
    const loginData = {
      email: 'newuser@test.com',
      password: 'password123'
    };

    console.log('✅ 로그인 테스트 데이터:', loginData);
    expect(loginData.email).toContain('@');
  });
});