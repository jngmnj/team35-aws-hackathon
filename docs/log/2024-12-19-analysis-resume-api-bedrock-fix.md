# Analysis & Resume API Bedrock 권한 및 설정 수정

## 작업 일시
2024-12-19

## 문제 해결 과정

### 1. 초기 문제 - Lambda 모듈 로드 실패
- **오류**: `Runtime.ImportModuleError: Error: Cannot find module 'index'`
- **원인**: Lambda 함수 코드 패키징 문제
- **해결**: CDK 재배포로 해결

### 2. Bedrock 권한 부족
- **오류**: `AccessDeniedException: User is not authorized to perform: bedrock:InvokeModel`
- **원인**: Analysis, Resume Lambda 함수에 Bedrock 권한 없음
- **해결**: IAM 정책 추가
```typescript
analysisFunction.addToRolePolicy(new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ['bedrock:InvokeModel'],
  resources: ['arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0']
}));
```

### 3. Lambda 타임아웃 문제
- **오류**: Lambda 함수 3초 타임아웃으로 Bedrock 호출 실패
- **원인**: AI 모델 호출은 시간이 오래 걸림
- **해결**: 타임아웃 5분, 메모리 512MB로 증가

## 수정된 설정

### Lambda 함수 설정
```typescript
const analysisFunction = new lambda.Function(this, 'AnalysisFunction', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('../src/functions/analysis'),
  timeout: cdk.Duration.minutes(5),
  memorySize: 512,
  environment: {
    ANALYSIS_TABLE_NAME: props.analysisTable.tableName,
    DOCUMENTS_TABLE_NAME: props.documentsTable.tableName,
    JWT_SECRET: 'your-jwt-secret',
  },
});
```

### Bedrock 권한 추가
```typescript
analysisFunction.addToRolePolicy(new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ['bedrock:InvokeModel'],
  resources: ['arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0']
}));
```

## 테스트 결과

### ✅ Analysis API 성공
```bash
curl -X POST https://oxunoozv13.execute-api.us-east-1.amazonaws.com/prod/analysis \
  -H "Authorization: Bearer [token]" \
  -d '{}'
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "analysisId": "5e4ec761-d534-49ba-9d8e-1d828764ba48",
    "userId": "test2@test.com",
    "result": {
      "personalityType": {
        "type": "ISTP",
        "description": "Quiet, reserved, and focused on practical solutions",
        "traits": ["Analytical", "Logical", "Hands-on", "Adaptable"]
      },
      "strengths": [
        "Technical proficiency with React and Node.js",
        "Problem-solving skills",
        "Ability to work independently",
        "Adaptability to new technologies"
      ],
      "weaknesses": [
        "Tendency to overlook details",
        "Difficulty with abstract concepts"
      ],
      "values": ["Practicality", "Efficiency", "Continuous learning", "Flexibility"],
      "interests": ["Web development", "Front-end technologies", "Back-end technologies", "Programming"]
    },
    "createdAt": "2025-09-05T17:44:01.757Z"
  }
}
```

### ⚠️ Resume API 부분 성공
- Bedrock 호출은 성공하지만 JSON 파싱 오류 발생
- **오류**: `SyntaxError: Unexpected token ` in JSON at position 0`
- **원인**: Bedrock 응답에 마크다운 코드 블록이나 특수 문자 포함
- **해결 필요**: JSON 파싱 로직 개선

## 수정된 파일
- `/backend/infrastructure/lib/api-stack.ts` - Bedrock 권한, 타임아웃, 메모리 설정
- `/backend/src/functions/analysis/index.ts` - 디버깅 로그 추가
- `/backend/src/functions/resume/index.ts` - 디버깅 로그 추가

## 현재 상태
- ✅ **Analysis API**: 완전 작동
- ⚠️ **Resume API**: Bedrock 호출 성공, JSON 파싱 개선 필요
- ✅ **인프라**: 모든 권한 및 설정 완료
- ✅ **배포**: AWS에 성공적으로 배포됨

## 다음 단계
1. Resume API의 JSON 파싱 로직 개선
2. 프론트엔드에서 실제 테스트
3. 에러 핸들링 개선

## 기술적 세부사항
- **Bedrock 모델**: Claude 3 Sonnet (`anthropic.claude-3-sonnet-20240229-v1:0`)
- **Lambda 타임아웃**: 5분
- **Lambda 메모리**: 512MB
- **API 응답 시간**: Analysis 약 7초, Resume 약 20초