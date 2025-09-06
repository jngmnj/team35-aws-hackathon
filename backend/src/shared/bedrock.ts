import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ 
  region: process.env.BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1'
});

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

export interface PersonalityAnalysisResult {
  personalityType: {
    type: string;
    description: string;
    traits: string[];
  };
  strengths: Array<{
    title: string;
    description: string;
    evidence: string;
  }>;
  weaknesses: Array<{
    title: string;
    description: string;
    improvement: string;
  }>;
  values: string[];
  interests: string[];
}

export async function generatePersonalityAnalysis(prompt: AnalysisPrompt): Promise<PersonalityAnalysisResult> {
  const systemPrompt = `당신은 한국 IT 업계를 잘 아는 전문 커리어 컨설턴트입니다. 제공된 문서들을 종합적으로 분석하여 실무 중심의 성격 분석을 해주세요.

📋 문서 분석 방법 (확장된 타입 포함):
- Experience 문서듡: 실제 행동 패턴과 리더십 스타일 파악
- Skills 문서듡: 기술 역량과 학습 성향 분석 (여러 개일 수 있음)
- Values 문서듡: 업무 가치관과 동기 요인 이해
- Achievements 문서듡: 성과 지향성과 강점 확인
- Daily_record 문서듡: 일상 패턴, 기분/에너지 변화, 활동 선호도 분석
- Mood_tracker 문서듡: 감정 관리 능력, 스트레스 대응 방식 파악
- Reflection 문서듡: 자기 성찰 능력, 학습 태도, 성장 마인드셋 확인
- Test_result 문서듡: MBTI, DISC 등 기존 테스트 결과와 문서 분석 결과 비교 검증
- 기타 문서듡: 추가 정보로 활용

🎯 통합 분석 기준:
1. 성격 유형: MBTI 기반, 문서에서 나타난 구체적 행동 패턴 + 테스트 결과 교차 검증
2. 핵심 강점: 3-5개 (일상 기록과 성과 데이터 연계 분석)
3. 개선 영역: 2-3개 (기분/에너지 패턴과 연관된 개선점)
4. 가치관: 문서와 일상 기록에서 드러나는 핵심 가치 3-5개
5. 관심 분야: 기술/업무 관심사 + 일상 활동 패턴 3-5개
6. 성장 패턴: 시간에 따른 변화 추이 (가능한 경우)

⚠️ 새로운 문서 유형별 처리 방법:
1. Daily_record: 기분/에너지 수치, 활동 패턴으로 업무 스타일 추론
2. Mood_tracker: 감정 변화 패턴으로 스트레스 관리 능력 분석
3. Reflection: 자기 성찰 깊이로 학습 능력과 성장 잠재력 평가
4. Test_result: 기존 테스트와 문서 분석 결과 일치도 확인 및 보완

🔄 통합 분석 프로세스:
1. 기존 문서 (experience, skills, values, achievements) 기본 분석
2. 새로운 문서 (daily_record, mood_tracker, reflection, test_result) 보완 분석
3. 교차 검증: 테스트 결과와 실제 행동 패턴 일치도 확인
4. 시간적 변화: 일상 기록을 통한 성장/변화 패턴 파악
5. 종합 결론: 다차원 데이터 기반 통합 인사이트 제공

중요 원칙:
- 문서 내용이 부족하면 추측하지 말고 분석 한계 명시
- 반드시 문서에서 직접 인용할 수 있는 내용만 근거로 사용
- 테스트 결과와 실제 행동이 다를 경우 그 차이점 분석
- 일상 기록의 패턴을 업무 성향과 연결하여 해석

✅ 강점/약점 작성 가이드:
- ❌ 나쁜 예: 리더십이 뛰어남, 완벽주의 성향
- ✅ 좋은 예: 5명 팀 리더 역할 수행 경험을 통해 보여준 일정 관리와 갈등 조정 능력
- ✅ 새로운 예: 일상 기록에서 나타난 높은 에너지 수준(평균 4.2/5)과 다양한 활동 참여로 보여지는 적극적 업무 추진력

한국어로 답변하고, 모든 분석은 제공된 문서 내용을 근거로 해야 합니다.

**중요: strengths와 weaknesses는 반드시 객체 배열로 작성해야 합니다. 문자열 배열이 아닙니다.**

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

  const userPrompt = `다음 문서들을 분석해주세요:

<<<<<<< HEAD
${prompt.documents.map(doc => `
📄 ${doc.type}: ${doc.title}
${doc.content}
`).join('\n---\n')}`;
=======
  const userPrompt = `다음 문서들을 분석해주세요:

${prompt.documents.map(doc => `${doc.type}: ${doc.title}
${doc.content}`).join('\n\n')}`;
>>>>>>> f799ce5 (optimize: simplify user prompt for faster processing)

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1500,
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
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError instanceof Error ? parseError.message : String(parseError));
      console.error('원본 응답:', content);
      
      // Try to extract and fix the response
      try {
        // Look for the actual response structure and convert it
        const result = JSON.parse(content);
        
        // Convert string arrays to object arrays if needed
        if (result.strengths && Array.isArray(result.strengths) && typeof result.strengths[0] === 'string') {
          result.strengths = result.strengths.map((strength: string) => ({
            title: strength,
            description: `${strength}에 대한 통합 분석 결과`,
            evidence: "다차원 문서 분석 기반"
          }));
        }
        
        if (result.weaknesses && Array.isArray(result.weaknesses) && typeof result.weaknesses[0] === 'string') {
          result.weaknesses = result.weaknesses.map((weakness: string) => ({
            title: weakness,
            description: `${weakness}에 대한 통합 분석 결과`,
            improvement: "일상 패턴 개선을 통한 발전 방안"
          }));
        }
        
        return result;
      } catch {
        // Final fallback with enhanced analysis
        return {
          personalityType: { 
            type: "ENFJ", 
            description: "통합 분석 중 오류 발생 - 기본 분석 결과 제공", 
            traits: ["리더십", "협업", "학습지향", "성장마인드"] 
          },
          strengths: [
            { title: "다차원적 자기관리", description: "일상 기록과 성찰을 통한 체계적 자기 발전", evidence: "통합 분석 시스템 활용" },
            { title: "데이터 기반 성장", description: "객관적 지표를 통한 지속적 개선 노력", evidence: "다양한 문서 타입 활용" },
            { title: "통합적 사고", description: "업무와 일상을 연결한 전체적 관점", evidence: "종합적 기록 관리" }
          ],
          weaknesses: [
            { title: "분석 의존성", description: "과도한 데이터 분석으로 인한 실행 지연 가능성", improvement: "분석과 실행의 균형 유지" },
            { title: "완벽주의 경향", description: "모든 것을 기록하려는 부담감", improvement: "핵심 지표 중심의 선택적 기록" }
          ],
          values: ["성장", "자기계발", "데이터 기반 의사결정", "지속적 개선"],
          interests: ["자기분석", "성장 패턴", "효율적 관리", "통합적 사고"]
        };
      }
    }
  } catch (error) {
    console.error('Bedrock 호출 실패:', error);
    throw new Error('통합 AI 분석 서비스 일시 중단 - 다차원 데이터 처리 오류');
  }
}

export interface ResumeResult {
  personalInfo: {
    summary: string;
  };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  skills: string[];
  achievements: string[];
}

export async function generateResume(prompt: ResumePrompt): Promise<ResumeResult> {
  const systemPrompt = `You are a resume writer. Create a resume for ${prompt.jobCategory} position.

Analyze the provided documents and create a professional resume.

**IMPORTANT: All content must be written in Korean language. Write all text fields in Korean.**

IMPORTANT: Return ONLY a valid JSON object. No markdown, no code blocks, no explanations. Just pure JSON.

JSON structure:
{
  "personalInfo": {
    "summary": "한국어로 작성된 직무에 맞춤 전문 요약"
  },
  "experience": [
    {
      "title": "직책명",
      "company": "회사명",
      "duration": "기간",
      "description": "성과를 포함한 한국어 업무 설명"
    }
  ],
  "skills": ["기술1", "기술2", "기술3"],
  "achievements": ["성과1", "성과2"]
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

  let content = '';
  try {
    console.log('Bedrock 호출 시작');
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    if (!responseBody.content || !responseBody.content[0] || !responseBody.content[0].text) {
      throw new Error('Invalid response format from Bedrock');
    }
    
    content = responseBody.content[0].text;
    console.log('Raw response first 200 chars:', content.substring(0, 200));
    console.log('Content includes backticks:', content.includes('`'));
    console.log('Content includes json marker:', content.toLowerCase().includes('json'));
    
    // Step 1: Find JSON boundaries first
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('No JSON brackets found in content');
      throw new Error('No JSON found');
    }
    
    // Step 2: Extract only the JSON part
    const jsonStr = content.substring(jsonStart, jsonEnd + 1);
    console.log('Extracted JSON first 100 chars:', jsonStr.substring(0, 100));
    
    const result = JSON.parse(jsonStr);
    console.log('이력서 생성 성공');
    return result;
  } catch (parseError) {
    console.error('JSON 파싱 실패:', parseError instanceof Error ? parseError.message : String(parseError));
    console.error('원본 응답 전체:', content);
    
    // Try alternative parsing methods
    try {
      // Method 1: Remove everything before first { and after last }
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}') + 1;
      if (start !== -1 && end > start) {
        const extracted = content.slice(start, end);
        return JSON.parse(extracted);
      }
    } catch (e) {
      console.error('Alternative parsing failed:', e instanceof Error ? e.message : String(e));
    }
    
    // Return safe fallback
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
} 