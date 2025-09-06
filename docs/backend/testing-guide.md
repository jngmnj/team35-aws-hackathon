# Backend Testing Guide

## 🧪 Test Suite Overview

### Unit Tests Coverage
- **Authentication**: 회원가입/로그인, JWT 토큰 검증
- **Documents**: CRUD 작업, 권한 검사, 입력 검증
- **Security**: 암호화, 토큰 보안, 에러 처리

### Test Results
```
✅ 14/14 tests passing
✅ Authentication endpoints working
✅ Document management working  
✅ JWT security working
✅ Error handling working
```

## 🚀 Running Tests

```bash
# 모든 테스트 실행
npm test

# 단위 테스트만
npm run test:unit

# 통합 테스트만
npm run test:integration

# 커버리지 리포트
npm run test:coverage

# 개발 모드 (watch)
npm run test:watch
```

## 📁 Test Files

- `tests/server.test.js` - 메인 단위 테스트
- `tests/integration.test.js` - 통합 테스트
- `tests/setup.js` - 테스트 설정
- `jest.config.js` - Jest 설정

## 🔧 Test Configuration

- **Framework**: Jest + Supertest
- **Environment**: Node.js test environment
- **Isolation**: 각 테스트마다 독립적인 메모리 DB
- **Security**: 실제 bcrypt + JWT 사용

## 📊 API Test Coverage

### Auth Endpoints
- `POST /auth/register` - 회원가입 검증
- `POST /auth/login` - 로그인 검증

### Document Endpoints  
- `GET /documents` - 문서 목록 조회
- `POST /documents` - 문서 생성
- `PUT /documents/:id` - 문서 수정
- `DELETE /documents/:id` - 문서 삭제

모든 엔드포인트에서 JWT 인증, 권한 검사, 에러 처리가 정상 작동함을 확인했습니다.