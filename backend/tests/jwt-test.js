// JWT 토큰 검증 테스트 (JavaScript)
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-secret-key';

// JWT 유틸리티 함수들
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '24h',
    issuer: 'resume-generator'
  });
}

function verifyToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { success: true, payload };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 테스트 실행
console.log('🔑 JWT 토큰 관리 시스템 검증');
console.log('================================');

const testPayload = { 
  userId: 'test-user-123', 
  email: 'test@example.com' 
};

// 1. 토큰 생성 테스트
console.log('1. 토큰 생성 테스트');
const token = generateToken(testPayload);
console.log('✅ 토큰 생성 성공');
console.log('토큰 길이:', token.length);

// 2. 토큰 검증 테스트
console.log('\n2. 토큰 검증 테스트');
const result = verifyToken(token);
if (result.success) {
  console.log('✅ 토큰 검증 성공');
  console.log('사용자 ID:', result.payload.userId);
  console.log('이메일:', result.payload.email);
} else {
  console.log('❌ 토큰 검증 실패:', result.error);
}

// 3. 잘못된 토큰 테스트
console.log('\n3. 잘못된 토큰 테스트');
const invalidResult = verifyToken('invalid-token');
if (!invalidResult.success) {
  console.log('✅ 잘못된 토큰 거부 성공');
} else {
  console.log('❌ 잘못된 토큰이 통과됨');
}

console.log('\n🎉 JWT 토큰 관리 시스템 검증 완료');