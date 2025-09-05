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
  const systemPrompt = `You are an expert career counselor and personality analyst. Analyze the provided documents and generate a comprehensive personality analysis.

Focus on:
1. MBTI-style personality type with clear reasoning
2. 3-5 key strengths based on evidence from documents
3. 2-3 areas for improvement (constructive feedback)
4. 3-5 core values demonstrated in their experiences
5. 3-5 professional interests aligned with their skills

Be specific and evidence-based. Use Korean for descriptions when analyzing Korean content.

Return ONLY valid JSON with this exact structure:
{
  "personalityType": {
    "type": "ENFJ",
    "description": "리더십과 협업을 중시하는 성격으로...",
    "traits": ["리더십", "협업 능력", "학습 지향적"]
  },
  "strengths": ["팀 리더십", "기술 학습 능력", "문제 해결력"],
  "weaknesses": ["완벽주의 성향", "시간 관리"],
  "values": ["팀워크", "지속적 학습", "품질 중시"],
  "interests": ["웹 개발", "프론트엔드", "사용자 경험"]
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