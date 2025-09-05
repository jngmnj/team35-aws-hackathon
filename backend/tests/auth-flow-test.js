// 인증 플로우 통합 테스트
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-secret-key';

// 모의 사용자 데이터베이스
const mockUsers = new Map();

// 인증 함수들
async function registerUser(email, password, name) {
  // 사용자 존재 확인
  if (mockUsers.has(email)) {
    return { success: false, error: 'User already exists' };
  }

  // 패스워드 해싱
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = 'user-' + Date.now();

  // 사용자 저장
  mockUsers.set(email, {
    userId,
    email,
    name,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  });

  // JWT 토큰 생성
  const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });

  return {
    success: true,
    data: { userId, email, name, token }
  };
}

async function loginUser(email, password) {
  // 사용자 조회
  const user = mockUsers.get(email);
  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  // 패스워드 검증
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { success: false, error: 'Invalid credentials' };
  }

  // JWT 토큰 생성
  const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

  return {
    success: true,
    data: { userId: user.userId, email: user.email, name: user.name, token }
  };
}

function verifyAuthToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Missing authorization header' };
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { success: true, userId: payload.userId, email: payload.email };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

// 테스트 실행
async function runAuthTests() {
  console.log('🔐 인증 시스템 통합 테스트');
  console.log('============================');

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };

  // 1. 회원가입 테스트
  console.log('1. 회원가입 테스트');
  const registerResult = await registerUser(testUser.email, testUser.password, testUser.name);
  if (registerResult.success) {
    console.log('✅ 회원가입 성공');
    console.log('사용자 ID:', registerResult.data.userId);
    console.log('토큰 생성됨:', registerResult.data.token ? '✅' : '❌');
  } else {
    console.log('❌ 회원가입 실패:', registerResult.error);
    return;
  }

  // 2. 중복 회원가입 테스트
  console.log('\n2. 중복 회원가입 테스트');
  const duplicateResult = await registerUser(testUser.email, testUser.password, testUser.name);
  if (!duplicateResult.success) {
    console.log('✅ 중복 회원가입 차단 성공');
  } else {
    console.log('❌ 중복 회원가입이 허용됨');
  }

  // 3. 로그인 테스트
  console.log('\n3. 로그인 테스트');
  const loginResult = await loginUser(testUser.email, testUser.password);
  if (loginResult.success) {
    console.log('✅ 로그인 성공');
    console.log('토큰 생성됨:', loginResult.data.token ? '✅' : '❌');
  } else {
    console.log('❌ 로그인 실패:', loginResult.error);
    return;
  }

  // 4. 잘못된 패스워드 테스트
  console.log('\n4. 잘못된 패스워드 테스트');
  const wrongPasswordResult = await loginUser(testUser.email, 'wrongpassword');
  if (!wrongPasswordResult.success) {
    console.log('✅ 잘못된 패스워드 차단 성공');
  } else {
    console.log('❌ 잘못된 패스워드가 허용됨');
  }

  // 5. 토큰 인증 테스트
  console.log('\n5. 토큰 인증 테스트');
  const authHeader = `Bearer ${loginResult.data.token}`;
  const authResult = verifyAuthToken(authHeader);
  if (authResult.success) {
    console.log('✅ 토큰 인증 성공');
    console.log('인증된 사용자:', authResult.email);
  } else {
    console.log('❌ 토큰 인증 실패:', authResult.error);
  }

  // 6. 잘못된 토큰 테스트
  console.log('\n6. 잘못된 토큰 테스트');
  const invalidAuthResult = verifyAuthToken('Bearer invalid-token');
  if (!invalidAuthResult.success) {
    console.log('✅ 잘못된 토큰 차단 성공');
  } else {
    console.log('❌ 잘못된 토큰이 허용됨');
  }

  console.log('\n🎉 인증 시스템 통합 테스트 완료');
  console.log('총 사용자 수:', mockUsers.size);
}

runAuthTests().catch(console.error);