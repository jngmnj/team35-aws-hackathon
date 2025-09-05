// 로컬 인증 함수 테스트
const { handler } = require('./index');

async function testAuth() {
  console.log('🧪 인증 함수 로컬 테스트');
  
  // 회원가입 테스트
  const registerEvent = {
    httpMethod: 'POST',
    path: '/auth/register',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'test123',
      name: 'Test User'
    }),
    headers: {}
  };

  try {
    const result = await handler(registerEvent);
    console.log('회원가입 결과:', result.statusCode, JSON.parse(result.body));
  } catch (error) {
    console.error('회원가입 에러:', error.message);
  }

  // 로그인 테스트  
  const loginEvent = {
    httpMethod: 'POST',
    path: '/auth/login',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'test123'
    }),
    headers: {}
  };

  try {
    const result = await handler(loginEvent);
    console.log('로그인 결과:', result.statusCode, JSON.parse(result.body));
  } catch (error) {
    console.error('로그인 에러:', error.message);
  }
}

// 환경변수 설정
process.env.USERS_TABLE_NAME = 'users';
process.env.JWT_SECRET = 'test-secret';

testAuth();