import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: 'us-east-1' });

export interface AnalysisPrompt {
  documents: Array<{
    type: string;
    title: string;
    content: string;
  }>;
}

export interface ResumePrompt {
  documents: Array<{
    type: string;
    title: string;
    content: string;
  }>;
  jobCategory: string;
  jobTitle?: string;
}

export async function generatePersonalityAnalysis(prompt: AnalysisPrompt): Promise<any> {
  const systemPrompt = `당신은 한국 IT 업계를 잘 아는 전문 커리어 컨설턴트입니다. 제공된 문서들을 종합적으로 분석하여 실무 중심의 성격 분석을 해주세요.

📋 문서 분석 방법:
- Experience 문서들: 실제 행동 패턴과 리더십 스타일 파악
- Skills 문서들: 기술 역량과 학습 성향 분석 (여러 개일 수 있음)
- Values 문서들: 업무 가치관과 동기 요인 이해
- Achievements 문서들: 성과 지향성과 강점 확인
- 기타 문서들: 추가 정보로 활용

🎯 분석 기준:
1. 성격 유형: MBTI 기반, 문서에서 나타난 구체적 행동 패턴 근거
2. 핵심 강점: 3-5개 (반드시 문서의 구체적 사례 인용, 실무 적용 방법 포함)
3. 개선 영역: 2-3개 (건설적 피드백과 구체적 개선 방법)
4. 가치관: 문서에서 드러나는 핵심 가치 3-5개
5. 관심 분야: 기술/업무 관심사 3-5개

⚠️ 문서 유형별 처리 방법:
1. 상세 서술형 (50자 이상 + 문장 구조): 구체적 분석 및 근거 인용
2. 키워드 나열형 (쉼표 구분): '○○ 기술에 관심' 수준으로 분석
3. 단답형 (50자 미만): '정보 부족으로 일반적 추정' 명시

예시:
- '팀 프로젝트에서 리더 역할을...' → 상세 분석
- 'React, Vue, JavaScript' → '프론트엔드 기술 관심' 수준
- '팀워크' → '협업 가치 추정 (근거 부족)'

중요 원칙:
- 문서 내용이 부족하면 추측하지 말고 분석 한계 명시
- 반드시 문서에서 직접 인용할 수 있는 내용만 근거로 사용

✅ 강점/약점 작성 가이드:
- ❌ 나쁜 예: "리더십이 뛰어남", "완벽주의 성향"
- ✅ 좋은 예: "'5명 팀 리더 역할 수행' 경험을 통해 보여준 일정 관리와 갈등 조정 능력"

한국어로 답변하고, 모든 분석은 제공된 문서 내용을 근거로 해야 합니다.

정확히 이 JSON 구조로만 응답:
{
  "personalityType": {
    "type": "ENFJ",
    "description": "구체적 근거와 함께 성격 설명",
    "traits": ["특성1", "특성2", "특성3"]
  },
  "strengths": [
    {
      "title": "강점명",
      "description": "구체적 사례와 실무 적용 방법",
      "evidence": "문서에서 인용한 근거"
    }
  ],
  "weaknesses": [
    {
      "title": "개선영역명",
      "description": "구체적 상황과 개선 방향",
      "improvement": "실용적 개선 방법"
    }
  ],
  "values": ["가치1", "가치2", "가치3"],
  "interests": ["관심사1", "관심사2", "관심사3"]
}`;

  const userPrompt = `Please analyze the following documents:
${prompt.documents.map(doc => `
Document Type: ${doc.type}
Title: ${doc.title}
Content: ${doc.content}
`).join('\n---\n')}`;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userPrompt
      }
    ]
  });

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    body,
    contentType: "application/json",
    accept: "application/json",
  });

  try {
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const content = responseBody.content[0].text;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('JSON 파싱 실패:', content);
      return {
        personalityType: { type: "ENFJ", description: "분석 중 오류 발생", traits: ["리더십", "협업", "학습지향"] },
        strengths: ["문제해결력", "학습능력", "커뮤니케이션"],
        weaknesses: ["완벽주의", "시간관리"],
        values: ["팀워크", "성장", "품질"],
        interests: ["개발", "기술", "혁신"]
      };
    }
  } catch (error) {
    console.error('Bedrock 호출 실패:', error);
    throw new Error('AI 분석 서비스 일시 중단');
  }
}

export async function generateResume(prompt: ResumePrompt): Promise<any> {
  const systemPrompt = `You are an expert resume writer specializing in ${prompt.jobCategory} positions. Create a compelling, ATS-friendly resume.

Requirements:
1. Professional Summary: 2-3 sentences highlighting relevant skills for ${prompt.jobCategory}
2. Experience: Extract and enhance experiences, quantify achievements when possible
3. Skills: Prioritize technical skills relevant to ${prompt.jobCategory}, include soft skills
4. Achievements: Focus on measurable results and impact

Use Korean for content when analyzing Korean documents. Make it professional and compelling.

Return ONLY valid JSON with this exact structure:
{
  "personalInfo": {
    "summary": "${prompt.jobCategory} 전문가로서..."
  },
  "experience": [
    {
      "title": "직책명",
      "company": "회사/프로젝트명",
      "duration": "기간",
      "description": "구체적인 성과와 기여도 포함한 설명"
    }
  ],
  "skills": ["기술스킬1", "기술스킬2", "소프트스킬1"],
  "achievements": ["정량적 성과1", "정량적 성과2"]
}`;

  const userPrompt = `Target Job Category: ${prompt.jobCategory}
${prompt.jobTitle ? `Specific Job Title: ${prompt.jobTitle}` : ''}

Documents to analyze:
${prompt.documents.map(doc => `
Document Type: ${doc.type}
Title: ${doc.title}
Content: ${doc.content}
`).join('\n---\n')}`;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 3000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userPrompt
      }
    ]
  });

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    body,
    contentType: "application/json",
    accept: "application/json",
  });

  try {
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const content = responseBody.content[0].text;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('JSON 파싱 실패:', content);
      return {
        personalInfo: { summary: `${prompt.jobCategory} 분야의 전문성을 갖춘 개발자입니다.` },
        experience: [{
          title: "개발자",
          company: "프로젝트",
          duration: "진행중",
          description: "다양한 기술을 활용한 개발 경험"
        }],
        skills: ["JavaScript", "React", "문제해결력"],
        achievements: ["프로젝트 성공적 완료", "팀워크 발휘"]
      };
    }
  } catch (error) {
    console.error('Bedrock 호출 실패:', error);
    throw new Error('이력서 생성 서비스 일시 중단');
  }
}