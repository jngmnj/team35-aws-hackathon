# 자기성장 플랫폼 Specification - 기존 코드베이스 활용

## 서비스 개요

"나를 기록하고, 탐구하고, 성장 과정을 시각화하여 자기인식과 커리어를 동시에 키우는 플랫폼"

### 기존 코드베이스 활용률
- **Backend**: 95% 재사용 (새 문서 타입만 추가)
- **Frontend**: 85% 재사용 (UI 확장)
- **인증/인프라**: 100% 재사용
- **AI 분석**: 80% 재사용 (프롬프트 확장)

### 개발 시간: 6-9시간 (기존 12-15시간에서 50% 단축)

## 핵심 기능

### 1. 기록 시스템 (기존 문서 시스템 확장)
- **일상 기록**: 일상/공부/업무 + 기분/에너지 + 메모
- **가치관 아카이브**: 좌우명, 존경 인물, 가치관 저장
- **기존 문서 타입 유지**:
  - Experience Documents (프로젝트, 인턴, 활동)
  - Skills Documents (기술 스킬, 자격증, 언어)
  - Values Documents (목표, 동기, 철학)
  - Achievement Documents (수상, 성취, 리더십)

### 2. 테스트 결과 관리
- **테스트 목록**: MBTI, DISC, 애니어그램, 강점 진단
- **외부 링크 연동**: 테스트 설명 보고 외부에서 수행
- **결과 입력 및 저장**: 테스트 결과를 앱에 입력하여 저장
- **히스토리 관리**: 시간별 테스트 결과 변화 추적

### 3. 통합 AI 분석 (기존 AI 시스템 확장)
- **다차원 데이터 분석**: 기록 + 테스트 결과 통합 분석
- **성장 추적**: 시간의 흐름 속에서 변화 분석
- **개선 방향 제시**: 약점 분석 및 개선 가이드
- **직무별 분석**: 커리어 맞춤 인사이트 제공

### 4. 이력서 생성 (기존 기능 유지)
- **직무별 지원**: 개발자, 제품 관리자, 마케터, 디자이너 등
- **개인화된 컨텐츠**: 사용자의 모든 데이터 기반 맞춤형 이력서
- **다양한 형식**: 업계별 다양한 이력서 템플릿

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14+
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Deployment**: AWS S3 + CloudFront

### Backend Stack
- **Runtime**: Node.js
- **Architecture**: Serverless (AWS Lambda)
- **API**: AWS API Gateway
- **Database**: AWS DynamoDB
- **AI Service**: AWS Bedrock (Claude/GPT models)
- **Authentication**: AWS Cognito

### Development Tools
- **Code Generation**: Amazon Q Developer
- **Infrastructure**: AWS CDK
- **Version Control**: Git

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │   Lambda        │
│   (S3+CF)       │◄──►│   + Lambda       │◄──►│   Functions     │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   AWS Cognito    │    │   DynamoDB      │
                       │   (Auth)         │    │   (Documents)   │
                       └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   AWS Bedrock   │
                                               │   (AI Analysis) │
                                               └─────────────────┘
```

## Data Flow

1. **User Registration/Login** → AWS Cognito
2. **Document Creation** → Store in DynamoDB
3. **AI Analysis Request** → Lambda processes documents via Bedrock
4. **Insight Generation** → AI analyzes all documents collectively
5. **Resume Generation** → AI creates personalized resume based on job category
6. **Result Display** → Frontend shows analysis and generated resume

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Documents
- `GET /documents` - Get user's documents
- `POST /documents` - Create new document
- `PUT /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document

### Analysis
- `POST /analysis/generate` - Generate personality analysis
- `GET /analysis/:userId` - Get user's analysis results

### Resume
- `POST /resume/generate` - Generate resume for specific job category
- `GET /resume/:userId/:jobCategory` - Get generated resume

## 데이터베이스 스키마 (기존 활용 + 확장)

### Users Table (기존 유지)
```json
{
  "userId": "string (PK)",
  "email": "string",
  "name": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Documents Table (타입 확장)
```json
{
  "documentId": "string (PK)",
  "userId": "string (GSI)",
  "type": "experience|skills|values|achievements|daily_record|mood_tracker|reflection|values_archive|test_result",
  "title": "string",
  "content": "string",
  "metadata": {
    "mood": "number (1-5)",
    "energy": "number (1-5)",
    "testName": "string",
    "testResult": "object",
    "activities": "array"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Analysis Table (기존 유지 + 확장)
```json
{
  "analysisId": "string (PK)",
  "userId": "string (GSI)",
  "personalityType": "object",
  "strengths": "array",
  "weaknesses": "array",
  "values": "array",
  "interests": "array",
  "growthPattern": "object",
  "improvementSuggestions": "array",
  "dataTypes": "array (record, test, document)",
  "createdAt": "timestamp"
}
```

### Resumes Table (기존 유지)
```json
{
  "resumeId": "string (PK)",
  "userId": "string (GSI)",
  "jobCategory": "string",
  "content": "string",
  "createdAt": "timestamp"
}
```

## Job Categories

- **Developer**: Frontend, Backend, Full-stack, Mobile, DevOps
- **Product Manager**: Product Strategy, Technical PM, Growth PM
- **Designer**: UX/UI Designer, Graphic Designer, Product Designer
- **Marketer**: Digital Marketing, Content Marketing, Growth Marketing
- **Data**: Data Analyst, Data Scientist, ML Engineer

## 개발 우선순위 (기존 코드 활용)

### Phase 1: 기록 시스템 확장 (1-2시간)
1. 문서 타입 확장 (daily_record, mood_tracker, reflection)
2. 일상 기록 UI 추가 (기분/에너지 입력)
3. 기본 시각화 (간단한 차트)

### Phase 2: 테스트 결과 관리 (2-3시간)
1. 테스트 목록 및 결과 저장 시스템
2. 테스트 관리 페이지 구현
3. 외부 링크 연동 및 결과 입력

### Phase 3: 분석 및 시각화 확장 (3-4시간)
1. 기존 AI 분석 시스템 확장
2. 다차원 데이터 통합 분석
3. 변화 추적 및 성장 시각화
4. 개선 방향 제시 알고리즘

### Phase 4: 통합 및 배포 (1-2시간)
1. 전체 기능 통합 테스트
2. 데모 준비 및 스토리 구성
3. 자기성장 플랫폼 발표 자료

## 성공 지표

- **기능성**: 일상 기록 → 테스트 관리 → 통합 분석 → 성장 추적 완전한 플로우
- **AI 품질**: 의미 있는 성장 인사이트와 개선 방향 제시
- **사용자 경험**: 직관적인 기록 인터페이스와 명확한 성장 시각화
- **기술 구현**: 기존 AWS 서비스 활용으로 빠른 개발 및 확장 가능한 아키텍처

## Risk Mitigation

- **Time Constraint**: Focus on MVP features first
- **AI Integration**: Have fallback templates if Bedrock integration fails
- **Deployment Issues**: Prepare simple deployment scripts
- **Team Coordination**: Clear role division and regular check-ins

## 최종 산출물

1. **자기성장 플랫폼**: AWS에 배포된 완전한 기능의 애플리케이션
2. **데모**: 일상 기록부터 성장 분석까지 완전한 사용자 여정 시연
3. **기존 코드 활용 가이드**: 어떻게 95% 코드를 재사용했는지 설명
4. **소스 코드**: 기존 코드베이스 확장으로 깨끗하고 문서화된 코드