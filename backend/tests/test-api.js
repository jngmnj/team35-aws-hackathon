// Phase 2 Backend API 테스트 스크립트
const testAuth = {
  register: {
    method: 'POST',
    url: '/auth/register',
    body: {
      email: 'test@example.com',
      password: 'test123',
      name: 'Test User'
    }
  },
  login: {
    method: 'POST', 
    url: '/auth/login',
    body: {
      email: 'test@example.com',
      password: 'test123'
    }
  }
};

const testDocuments = {
  create: {
    method: 'POST',
    url: '/documents',
    headers: { Authorization: 'Bearer TOKEN' },
    body: {
      type: 'Experience',
      title: '프로젝트 리더 경험',
      content: '5명 팀을 이끌고 웹앱 개발 프로젝트 완성'
    }
  },
  list: {
    method: 'GET',
    url: '/documents',
    headers: { Authorization: 'Bearer TOKEN' }
  }
};

console.log('Phase 2 API 테스트 준비 완료');
console.log('인증 테스트:', testAuth);
console.log('문서 테스트:', testDocuments);