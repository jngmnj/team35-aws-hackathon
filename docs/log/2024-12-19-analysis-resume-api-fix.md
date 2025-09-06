# Analysis & Resume API 연동 문제 해결

## 작업 일시
2024-12-19

## 문제 상황
- 회원가입, 로그인, 문서 CRUD는 정상 작동
- Analysis와 Resume API 연동에서 문제 발생
- 프론트엔드와 백엔드 API 엔드포인트 불일치

## 발견된 문제점

### 1. API 엔드포인트 불일치
- **프론트엔드**: `/analysis/generate`, `/resume/generate` 호출
- **백엔드**: `/analysis`, `/resume` POST 엔드포인트만 존재

### 2. API 응답 구조 불일치
- **getAnalysis**: 단일 객체 vs 배열 반환
- **getResumes**: 단일 객체 vs 배열 반환

### 3. Lambda 함수 환경변수 누락
- Analysis, Resume 함수에서 DOCUMENTS_TABLE_NAME 누락
- Documents 테이블 읽기 권한 누락

### 4. CORS 헤더 설정 불완전
- OPTIONS 요청에 대한 CORS 헤더 누락

## 해결 작업

### 1. 프론트엔드 API 클라이언트 수정
```typescript
// 수정 전
async generateAnalysis(): Promise<AnalysisResult> {
  const { data } = await this.client.post('/analysis/generate');
  return data.data;
}

// 수정 후  
async generateAnalysis(): Promise<AnalysisResult> {
  const { data } = await this.client.post('/analysis');
  return data.data;
}
```

### 2. useAnalysis 훅 수정
- 배열 응답 처리를 위한 analyses 상태 추가
- 가장 최근 분석 결과를 기본값으로 설정

### 3. useResume 훅 수정
- getResume → loadResumes로 메서드명 변경
- 배열 응답 처리 로직 추가

### 4. 백엔드 인프라 수정
- Analysis, Resume Lambda에 DOCUMENTS_TABLE_NAME 환경변수 추가
- Documents 테이블 읽기 권한 부여
- CORS 헤더 완전 설정

## 수정된 파일
- `/code/src/lib/api.ts` - API 클라이언트 엔드포인트 수정
- `/code/src/hooks/useAnalysis.ts` - 배열 응답 처리
- `/code/src/hooks/useResume.ts` - 배열 응답 처리  
- `/backend/infrastructure/lib/api-stack.ts` - 환경변수 및 권한 추가
- `/backend/src/functions/analysis/index.ts` - CORS 헤더 수정
- `/backend/src/functions/resume/index.ts` - CORS 헤더 수정

## 배포 완료
1. ✅ CDK 스택 재배포 완료
   - DatabaseStack: 테이블 생성 완료
   - ApiStack: Lambda 함수 및 API Gateway 배포 완료
   - API URL: https://oxunoozv13.execute-api.us-east-1.amazonaws.com/prod/
2. ✅ CORS 설정 확인 완료
3. ⏳ 프론트엔드-백엔드 통합 테스트 필요
4. ⏳ Analysis, Resume 기능 실제 동작 확인 필요

## 기술적 세부사항
- Analysis API: 사용자 문서를 기반으로 AI 성격 분석 수행
- Resume API: 직무 카테고리별 맞춤형 이력서 생성
- 두 API 모두 사용자의 Documents 테이블 데이터 필요
- Bedrock Claude 3 Sonnet 모델 사용

## 예상 결과
- Analysis 페이지에서 AI 분석 정상 작동
- Resume 페이지에서 이력서 생성 정상 작동
- 에러 없는 API 통신 및 데이터 표시