# AI-Powered Self-Understanding & Resume Generator 개발 계획서

## 팀 구성 및 역할 분담 (4명)
- **Frontend Developer (1명)**: Next.js, UI/UX 구현
- **Backend Developer (1명)**: Lambda, API Gateway, DynamoDB 구현
- **DevOps/Infrastructure (1명)**: AWS CDK, 배포 환경 구축
- **AI Integration Specialist (1명)**: Bedrock 연동, AI 로직 구현

## 개발 단계별 계획

### Phase 1: 기반 인프라 구축 (2-3시간) - **80% 완료**

#### 병렬 작업 가능 (동시 진행)

**Frontend 작업 (Frontend Developer) - ✅ 완료 (90%)**
- [x] Next.js 14 프로젝트 초기 설정
- [x] Tailwind CSS v4 + shadcn/ui 설정
- [x] 기본 레이아웃 및 라우팅 구조 생성
- [x] 로그인/회원가입 UI 컴포넌트
- [x] 문서 에디터 기본 UI (TipTap with SSR)

**Backend 작업 (Backend Developer) - ⏳ 진행중 (80%)**
- [x] Node.js Lambda 함수 기본 구조 설정
- [x] 함수별 패키지 구조 및 shared 모듈 완성
- [x] DynamoDB 테이블 스키마 설계
- [ ] 인증 관련 Lambda 함수 구현 완료

**Infrastructure 작업 (DevOps) - ⏳ 진행중 (70%)**
- [x] AWS CDK 프로젝트 초기화
- [x] 기본 스택 구조 설정
- [ ] DynamoDB 테이블 생성 및 배포
- [ ] API Gateway + Lambda 연동 설정
- [ ] AWS Cognito 사용자 풀 설정

**AI Integration 준비 (AI Specialist) - ⏳ 진행중 (60%)**
- [x] AWS Bedrock 연동 코드 구조 완성
- [ ] 프롬프트 설계 및 테스트
- [ ] 성격 분석 로직 구현
- [ ] 이력서 생성 템플릿 준비

### Phase 2: 핵심 기능 구현 (3-4시간) - **20% 완료**

#### 순차적 의존성 있는 작업

**Step 2.1: 인증 시스템 완성 (Frontend + Backend 협업) - 🔄 시작**
- [ ] Cognito 연동 완료
- [ ] 로그인/회원가입 기능 테스트
- [ ] JWT 토큰 관리 구현

**Step 2.2: 문서 CRUD 구현 (Frontend + Backend 협업) - 🔄 시작**
- [ ] 문서 생성/수정/삭제 API 구현
- [x] TipTap 에디터 완성 (SSR 지원)
- [x] 문서 타입별 UI 구분 (Experience, Skills, Values, Achievements)
- [ ] API 연동 및 실시간 저장 기능

**Step 2.3: AI 분석 기능 구현 (AI Specialist + Backend 협업) - ❌ 대기**
- [ ] Bedrock 연동 Lambda 함수 구현
- [ ] 성격 분석 프롬프트 최적화
- [ ] 분석 결과 저장 로직
- [ ] 에러 핸들링 및 폴백 로직

**Step 2.4: 이력서 생성 기능 (AI Specialist + Frontend 협업) - ❌ 대기**
- [ ] 직무별 이력서 생성 로직
- [ ] 이력서 템플릿 구현
- [ ] 이력서 미리보기 UI
- [ ] PDF 다운로드 기능 (선택사항)

### Phase 3: 통합 및 테스트 (2-3시간) - **0% 완료**

#### 전체 팀 협업 필요

**Step 3.1: Frontend-Backend 통합 - ❌ 대기**
- [ ] API 연동 완료 및 테스트
- [ ] 에러 처리 및 로딩 상태 구현
- [ ] 사용자 플로우 테스트

**Step 3.2: 배포 및 최적화 (DevOps 주도) - ❌ 대기**
- [ ] S3 + CloudFront 배포 설정
- [ ] Lambda 함수 배포
- [ ] 환경 변수 및 보안 설정
- [ ] 도메인 연결 (선택사항)

**Step 3.3: 최종 테스트 및 데모 준비 - ❌ 대기**
- [ ] End-to-end 테스트
- [ ] 성능 최적화
- [ ] 데모 시나리오 준비
- [ ] 발표 자료 작성

## 작업 의존성 분석

### 병렬 작업 가능한 부분
1. **Phase 1 전체**: 각 역할별로 독립적 작업 가능
2. **UI 컴포넌트 개발**: Backend API와 독립적으로 진행 가능
3. **AI 프롬프트 설계**: 다른 개발과 병렬 진행 가능
4. **Infrastructure 설정**: 개발과 병렬로 진행 가능

### 순차적 의존성이 있는 부분
1. **인증 시스템**: Frontend + Backend 협업 필요
2. **문서 CRUD**: API 완성 후 Frontend 연동
3. **AI 분석**: 문서 데이터 축적 후 테스트 가능
4. **이력서 생성**: AI 분석 완료 후 구현
5. **최종 통합**: 모든 컴포넌트 완성 후 진행

## 시간별 마일스톤

### 0-3시간: 기반 구축
- 모든 개발 환경 설정 완료
- 기본 UI 프레임워크 구축
- AWS 인프라 기본 설정

### 3-6시간: 핵심 기능
- 사용자 인증 완료
- 문서 CRUD 기능 완료
- AI 분석 기본 로직 구현

### 6-8시간: 통합 및 완성
- 전체 기능 통합
- 배포 및 테스트 완료
- 데모 준비 완료

## 리스크 관리 전략

### 높은 우선순위 (MVP 필수)
1. 기본 문서 작성 기능
2. 간단한 AI 분석 (성격 유형)
3. 기본 이력서 생성

### 중간 우선순위 (시간 여유시)
1. 고급 AI 분석 (강점/약점)
2. 다양한 이력서 템플릿
3. 실시간 저장

### 낮은 우선순위 (보너스)
1. PDF 다운로드
2. 소셜 로그인
3. 고급 UI/UX 효과

## 현재 상황 및 다음 우선순위

### 🚨 즉시 해야 할 작업 (1-2시간)
1. **Backend API 구현 완료**
   - 인증 Lambda 함수 완성
   - 문서 CRUD API 구현
   - DynamoDB 연동 테스트

2. **Infrastructure 배포**
   - CDK 스택 배포
   - API Gateway 설정
   - Cognito 설정

3. **Frontend-Backend 연동**
   - API 클라이언트 구현
   - 인증 플로우 연결
   - 문서 CRUD 연동

### ⏳ 중기 작업 (2-4시간)
1. **AI 분석 기능**
   - Bedrock 연동 완성
   - 분석 결과 UI 구현

2. **이력서 생성**
   - 템플릿 구현
   - 생성 로직 완성

## ❌ 미완성 작업 목록

### Backend 미완성 작업
- [ ] 인증 Lambda 함수 구현 (register, login, verify)
- [ ] 문서 CRUD Lambda 함수 구현 (create, read, update, delete)
- [ ] JWT 토큰 생성 및 검증 로직
- [ ] DynamoDB 연동 및 데이터 모델 구현
- [ ] API 응답 형식 표준화
- [ ] 에러 핸들링 및 로깅

### Infrastructure 미완성 작업
- [ ] DynamoDB 테이블 실제 배포
- [ ] API Gateway 엔드포인트 설정
- [ ] Lambda 함수 배포 및 연결
- [ ] Cognito User Pool 생성 및 설정
- [ ] CORS 설정
- [ ] 환경 변수 관리

### Frontend 미완성 작업
- [ ] API 클라이언트 구현 (axios 설정)
- [ ] 인증 상태 관리 (Context API)
- [ ] 실제 API 연동 (현재 mock 데이터)
- [ ] 에러 처리 및 로딩 상태
- [ ] 토큰 저장 및 자동 갱신
- [ ] 보호된 라우트 구현

### AI Integration 미완성 작업
- [ ] Bedrock Claude 모델 연동 테스트
- [ ] 성격 분석 프롬프트 작성
- [ ] 문서 내용 분석 로직
- [ ] 분석 결과 구조화
- [ ] 이력서 생성 프롬프트
- [ ] AI 응답 파싱 및 검증

### 전체 통합 미완성 작업
- [ ] End-to-end 사용자 플로우 테스트
- [ ] 실제 데이터로 AI 분석 테스트
- [ ] 이력서 생성 및 미리보기
- [ ] 성능 최적화
- [ ] 보안 검토
- [ ] 배포 환경 설정

## 🔧 기술적 이슈 및 해결 필요사항

### 1. 인증 시스템
- **이슈**: Cognito vs 자체 JWT 구현 결정 필요
- **해결**: Cognito 사용 권장 (AWS 통합성)

### 2. 데이터베이스 스키마
- **이슈**: 문서 타입별 스키마 설계 미완성
- **해결**: 유연한 JSON 구조로 설계 필요

### 3. AI 모델 선택
- **이슈**: Claude vs GPT 모델 성능 비교 필요
- **해결**: Claude 3.5 Sonnet 사용 권장

### 4. 실시간 저장
- **이슈**: 자동 저장 vs 수동 저장 결정
- **해결**: 수동 저장으로 시작, 시간 여유시 자동 저장

### 5. 배포 환경
- **이슈**: 개발/프로덕션 환경 분리 필요
- **해결**: CDK로 환경별 스택 관리

## 성공 기준
- [ ] 사용자가 문서를 작성할 수 있음
- [ ] AI가 기본적인 성격 분석을 제공함
- [ ] 직무별 이력서가 생성됨
- [ ] 전체 플로우가 데모 가능함

**현재 Phase 1의 80% 완료** - Backend API 구현과 Infrastructure 배포가 가장 시급한 작업입니다.