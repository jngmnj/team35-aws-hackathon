# AI Resume Infrastructure

AWS CDK 기반 인프라 구성

## 구성 요소

### DynamoDB Tables
- `ai-resume-users`: 사용자 정보
- `ai-resume-documents`: 문서 데이터 (Experience, Skills, Values, Achievements)
- `ai-resume-analysis`: AI 분석 결과
- `ai-resume-resumes`: 생성된 이력서

### Lambda Functions
- `AuthLambda`: 인증 처리
- `DocumentsLambda`: 문서 CRUD
- `AnalysisLambda`: AI 분석 (Bedrock 연동)
- `ResumeLambda`: 이력서 생성

### API Gateway
- `/auth` - POST: 로그인/회원가입
- `/documents` - GET/POST/PUT/DELETE: 문서 관리
- `/analysis` - POST/GET: AI 분석
- `/resume` - POST/GET: 이력서 생성/조회

### Cognito
- User Pool: 사용자 인증
- User Pool Client: 프론트엔드 연동

## 배포

```bash
npm run build
npx cdk deploy
```

## 환경 변수 출력
배포 후 다음 값들이 출력됩니다:
- API Gateway URL
- Cognito User Pool ID
- Cognito User Pool Client ID