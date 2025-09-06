"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePersonalityAnalysis = generatePersonalityAnalysis;
exports.generateResume = generateResume;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const client = new client_bedrock_runtime_1.BedrockRuntimeClient({
    region: process.env.BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1'
});
async function generatePersonalityAnalysis(prompt) {
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
- 팀 프로젝트에서 리더 역할을 한 경우 → 상세 분석
- React, Vue, JavaScript 나열 → 프론트엔드 기술 관심 수준
- 팀워크 단답 → 협업 가치 추정 (근거 부족)

중요 원칙:
- 문서 내용이 부족하면 추측하지 말고 분석 한계 명시
- 반드시 문서에서 직접 인용할 수 있는 내용만 근거로 사용

✅ 강점/약점 작성 가이드:
- ❌ 나쁜 예: 리더십이 뛰어남, 완벽주의 성향
- ✅ 좋은 예: 5명 팀 리더 역할 수행 경험을 통해 보여준 일정 관리와 갈등 조정 능력

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
    const command = new client_bedrock_runtime_1.InvokeModelCommand({
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
        }
        catch (parseError) {
            console.error('JSON 파싱 실패:', parseError instanceof Error ? parseError.message : String(parseError));
            console.error('원본 응답:', content);
            return {
                personalityType: { type: "ENFJ", description: "분석 중 오류 발생", traits: ["리더십", "협업", "학습지향"] },
                strengths: [
                    { title: "문제해결력", description: "다양한 상황에서 창의적 해결책 제시", evidence: "분석 오류로 인한 기본값" },
                    { title: "학습능력", description: "새로운 기술과 지식 습득에 적극적", evidence: "분석 오류로 인한 기본값" },
                    { title: "커뮤니케이션", description: "팀원과의 원활한 소통 능력", evidence: "분석 오류로 인한 기본값" }
                ],
                weaknesses: [
                    { title: "완벽주의", description: "과도한 완벽 추구로 인한 시간 소요", improvement: "우선순위 설정과 적정 품질 기준 수립" },
                    { title: "시간관리", description: "업무 일정 관리의 어려움", improvement: "체계적인 일정 관리 도구 활용" }
                ],
                values: ["팀워크", "성장", "품질"],
                interests: ["개발", "기술", "혁신"]
            };
        }
    }
    catch (error) {
        console.error('Bedrock 호출 실패:', error);
        throw new Error('AI 분석 서비스 일시 중단');
    }
}
async function generateResume(prompt) {
    const systemPrompt = `You are a resume writer. Create a resume for ${prompt.jobCategory} position.

Analyze the provided documents and create a professional resume.

IMPORTANT: Return ONLY a valid JSON object. No markdown, no code blocks, no explanations. Just pure JSON.

JSON structure:
{
  "personalInfo": {
    "summary": "Professional summary in Korean"
  },
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "Duration",
      "description": "Job description"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "achievements": ["achievement1", "achievement2"]
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
    const command = new client_bedrock_runtime_1.InvokeModelCommand({
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
    }
    catch (parseError) {
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
        }
        catch (e) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkcm9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zaGFyZWQvYmVkcm9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTRDQSxrRUF1SEM7QUFnQkQsd0NBa0hDO0FBclNELDRFQUEyRjtBQUUzRixNQUFNLE1BQU0sR0FBRyxJQUFJLDZDQUFvQixDQUFDO0lBQ3RDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxXQUFXO0NBQzVFLENBQUMsQ0FBQztBQXdDSSxLQUFLLFVBQVUsMkJBQTJCLENBQUMsTUFBc0I7SUFDdEUsTUFBTSxZQUFZLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBMkRyQixDQUFDO0lBRUQsTUFBTSxVQUFVLEdBQUc7RUFDbkIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztpQkFDYixHQUFHLENBQUMsSUFBSTtTQUNoQixHQUFHLENBQUMsS0FBSztXQUNQLEdBQUcsQ0FBQyxPQUFPO0NBQ3JCLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztJQUVuQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLGlCQUFpQixFQUFFLG9CQUFvQjtRQUN2QyxVQUFVLEVBQUUsSUFBSTtRQUNoQixNQUFNLEVBQUUsWUFBWTtRQUNwQixRQUFRLEVBQUU7WUFDUjtnQkFDRSxJQUFJLEVBQUUsTUFBTTtnQkFDWixPQUFPLEVBQUUsVUFBVTthQUNwQjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxPQUFPLEdBQUcsSUFBSSwyQ0FBa0IsQ0FBQztRQUNyQyxPQUFPLEVBQUUseUNBQXlDO1FBQ2xELElBQUk7UUFDSixXQUFXLEVBQUUsa0JBQWtCO1FBQy9CLE1B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Q0FBQztZQUN4QyxZQUFZLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDO1NBQ3hDLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJlZHJvY2tSdW50aW1lQ2xpZW50LCBJbnZva2VNb2RlbENvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtYmVkcm9jay1ydW50aW1lJztcblxuY29uc3QgY2xpZW50ID0gbmV3IEJlZHJvY2tSdW50aW1lQ2xpZW50KHsgXG4gIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQkVEUk9DS19SRUdJT04gfHwgcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB8fCAndXMtZWFzdC0xJ1xufSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5hbHlzaXNQcm9tcHQge1xuICBkb2N1bWVudHM6IEFycmF5PHtcbiAgICB0eXBlOiBzdHJpbmc7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICBjb250ZW50OiBzdHJpbmc7XG4gIH0+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlc3VtZVByb21wdCB7XG4gIGRvY3VtZW50czogQXJyYXk8e1xuICAgIHR5cGU6IHN0cmluZztcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgfT47XG4gIGpvYkNhdGVnb3J5OiBzdHJpbmc7XG4gIGpvYlRpdGxlPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBlcnNvbmFsaXR5QW5hbHlzaXNSZXN1bHQge1xuICBwZXJzb25hbGl0eVR5cGU6IHtcbiAgICB0eXBlOiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICB0cmFpdHM6IHN0cmluZ1tdO1xuICB9O1xuICBzdHJlbmd0aHM6IEFycmF5PHtcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgZXZpZGVuY2U6IHN0cmluZztcbiAgfT47XG4gIHdlYWtuZXNzZXM6IEFycmF5PHtcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgaW1wcm92ZW1lbnQ6IHN0cmluZztcbiAgfT47XG4gIHZhbHVlczogc3RyaW5nW107XG4gIGludGVyZXN0czogc3RyaW5nW107XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVBlcnNvbmFsaXR5QW5hbHlzaXMocHJvbXB0OiBBbmFseXNpc1Byb21wdCk6IFByb21pc2U8UGVyc29uYWxpdHlBbmFseXNpc1Jlc3VsdD4ge1xuICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBg64u57Iug7J2AIO2VnOq1rSBJVCDsl4Xqs4Trpbwg7J6YIOyVhOuKlCDsoITrrLgg7Luk66as7Ja0IOy7qOyEpO2EtO2KuOyeheuLiOuLpC4g7KCc6rO165CcIOusuOyEnOuTpOydhCDsooXtlansoIHsnLzroZwg67aE7ISd7ZWY7JesIOyLpOustCDspJHsi6zsnZgg7ISx6rKpIOu2hOyEneydhCDtlbTso7zshLjsmpQuXG5cbvCfk4sg66y47IScIOu2hOyEnSDrsKnrspU6XG4tIEV4cGVyaWVuY2Ug66y47ISc65OkOiDsi6TsoJwg7ZaJ64+ZIO2MqO2EtOqzvCDrpqzrjZTsi60g7Iqk7YOA7J28IO2MjOyVhVxuLSBTa2lsbHMg66y47ISc65OkOiDquLDsiKAg7Jet65+J6rO8IO2VmeyKtSDshLHtlqUg67aE7ISdICjsl6zrn6wg6rCc7J28IOyImCDsnojsnYwpXG4tIFZhbHVlcyDrrLjshJzrk6Q6IOyXheustCDqsIDsuZjqtIDqs7wg64+Z6riwIOyalOyduCDsnbTtlbRcbi0gQWNoaWV2ZW1lbnRzIOusuOyEnOuTpDog7ISx6rO8IOyngO2WpeyEseqzvCDqsJXsoJAg7ZmV7J24XG4tIOq4sO2DgCDrrLjshJzrk6Q6IOy2lOqwgCDsoJXrs7TroZwg7Zmc7JqpXG5cbvCfjq8g67aE7ISdIOq4sOykgDpcbjEuIOyEseqyqSDsnKDtmJU6IE1CVEkg6riw67CYLCDrrLjshJzsl5DshJwg64KY7YOA64KcIOq1rOyytOyggSDtlonrj5kg7Yyo7YS0IOq3vOqxsFxuMi4g7ZW17IusIOqwleygkDogMy016rCcICjrsJjrk5zsi5wg66y47ISc7J2YIOq1rOyytOyggSDsgqzroYAg7J247JqpLCDsi6TrrLQg7KCB7JqpIOuwqeuylSDtj6ztlagpXG4zLiDqsJzshKAg7JiB7JetOiAyLTPqsJwgKOqxtOyEpOyggSDtlLzrk5zrsLHqs7wg6rWs7LK07KCBIOqwnOyEoCDrsKnrspUpXG40LiDqsIDsuZjqtIA6IOusuOyEnOyXkOyEnCDrk5zrn6zrgpjripQg7ZW17IusIOqwgOy5mCAzLTXqsJxcbjUuIOq0gOyLrCDrtoTslbw6IOq4sOyIoC/sl4XrrLQg6rSA7Ius7IKsIDMtNeqwnFxuXG7imqDvuI8g66y47IScIOycoO2YleuzhCDsspjrpqwg67Cp67KVOlxuMS4g7IOB7IS4IOyEnOyIoO2YlSAoNTDsnpAg7J207IOBICsg66y47J6lIOq1rOyhsCk6IOq1rOyytOyggSDrtoTshJ0g67CPIOq3vOqxsCDsnbjsmqlcbjIuIO2CpOybjOuTnCDrgpjsl7TtmJUgKOyJvO2RnCDqtazrtoQpOiAn4peL4peLIOq4sOyIoOyXkCDqtIDsi6wnIOyImOykgOycvOuhnCDrtoTshJ1cbjMuIOuLqOuLte2YlSAoNTDsnpAg66+466eMKTogJ+ygleuztCDrtoDsobHsnLzroZwg7J2867CY7KCBIOy2lOyglScg66qF7IucXG5cbuyYiOyLnDpcbi0g7YyAIO2UhOuhnOygne2KuOyXkOyEnCDrpqzrjZQg7Jet7ZWg7J2EIO2VnCDqsr3smrAg4oaSIOyDgeyEuCDrtoTshJ1cbi0gUmVhY3QsIFZ1ZSwgSmF2YVNjcmlwdCDrgpjsl7Qg4oaSIO2UhOuhoO2KuOyXlOuTnCDquLDsiKAg6rSA7IusIOyImOykgFxuLSDtjIDsm4ztgawg64uo64u1IOKGkiDtmJHsl4Ug6rCA7LmYIOy2lOyglSAo6re86rGwIOu2gOyhsSlcblxu7KSR7JqUIOybkOy5mTpcbi0g66y47IScIOuCtOyaqeydtCDrtoDsobHtlZjrqbQg7LaU7Lih7ZWY7KeAIOunkOqzoCDrtoTshJ0g7ZWc6rOEIOuqheyLnFxuLSDrsJjrk5zsi5wg66y47ISc7JeQ7IScIOyngeygkSDsnbjsmqntlaAg7IiYIOyeiOuKlCDrgrTsmqnrp4wg6re86rGw66GcIOyCrOyaqVxuXG7inIUg6rCV7KCQL+yVveygkCDsnpHshLEg6rCA7J2065OcOlxuLSDinYwg64KY7IGcIOyYiDog66as642U7Iut7J20IOubsOyWtOuCqCwg7JmE67K97KO87J2YIOyEse2WpVxuLSDinIUg7KKL7J2AIOyYiDogNeuqhSDtjIAg66as642UIOyXre2VoCDsiJjtlokg6rK97ZeY7J2EIO2Gte2VtCDrs7Tsl6zspIAg7J287KCVIOq0gOumrOyZgCDqsIjrk7Eg7KGw7KCVIOuKpeugpVxuXG7tlZzqta3slrTroZwg64u167OA7ZWY6rOgLCDrqqjrk6Ag67aE7ISd7J2AIOygnOqzteuQnCDrrLjshJwg64K07Jqp7J2EIOq3vOqxsOuhnCDtlbTslbwg7ZWp64uI64ukLlxuXG7soJXtmZXtnogg7J20IEpTT04g6rWs7KGw66Gc66eMIOydkeuLtTpcbntcbiAgXCJwZXJzb25hbGl0eVR5cGVcIjoge1xuICAgIFwidHlwZVwiOiBcIkVORkpcIixcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwi6rWs7LK07KCBIOq3vOqxsOyZgCDtlajqu5gg7ISx6rKpIOyEpOuqhVwiLFxuICAgIFwidHJhaXRzXCI6IFtcIu2KueyEsTFcIiwgXCLtirnshLEyXCIsIFwi7Yq57ISxM1wiXVxuICB9LFxuICBcInN0cmVuZ3Roc1wiOiBbXG4gICAge1xuICAgICAgXCJ0aXRsZVwiOiBcIuqwleygkOuqhVwiLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIuq1rOyytOyggSDsgqzroYDsmYAg7Iuk66y0IOyggeyaqSDrsKnrspVcIixcbiAgICAgIFwiZXZpZGVuY2VcIjogXCLrrLjshJzsl5DshJwg7J247Jqp7ZWcIOq3vOqxsFwiXG4gICAgfVxuICBdLFxuICBcIndlYWtuZXNzZXNcIjogW1xuICAgIHtcbiAgICAgIFwidGl0bGVcIjogXCLqsJzshKDsmIHsl63rqoVcIixcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCLqtazssrTsoIEg7IOB7Zmp6rO8IOqwnOyEoCDrsKntlqVcIixcbiAgICAgIFwiaW1wcm92ZW1lbnRcIjogXCLsi6TsmqnsoIEg6rCc7ISgIOuwqeuylVwiXG4gICAgfVxuICBdLFxuICBcInZhbHVlc1wiOiBbXCLqsIDsuZgxXCIsIFwi6rCA7LmYMlwiLCBcIuqwgOy5mDNcIl0sXG4gIFwiaW50ZXJlc3RzXCI6IFtcIuq0gOyLrOyCrDFcIiwgXCLqtIDsi6zsgqwyXCIsIFwi6rSA7Ius7IKsM1wiXVxufWA7XG5cbiAgY29uc3QgdXNlclByb21wdCA9IGBQbGVhc2UgYW5hbHl6ZSB0aGUgZm9sbG93aW5nIGRvY3VtZW50czpcbiR7cHJvbXB0LmRvY3VtZW50cy5tYXAoZG9jID0+IGBcbkRvY3VtZW50IFR5cGU6ICR7ZG9jLnR5cGV9XG5UaXRsZTogJHtkb2MudGl0bGV9XG5Db250ZW50OiAke2RvYy5jb250ZW50fVxuYCkuam9pbignXFxuLS0tXFxuJyl9YDtcblxuICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgIGFudGhyb3BpY192ZXJzaW9uOiBcImJlZHJvY2stMjAyMy0wNS0zMVwiLFxuICAgIG1heF90b2tlbnM6IDIwMDAsXG4gICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgbWVzc2FnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgcm9sZTogXCJ1c2VyXCIsXG4gICAgICAgIGNvbnRlbnQ6IHVzZXJQcm9tcHRcbiAgICAgIH1cbiAgICBdXG4gIH0pO1xuXG4gIGNvbnN0IGNvbW1hbmQgPSBuZXcgSW52b2tlTW9kZWxDb21tYW5kKHtcbiAgICBtb2RlbElkOiBcImFudGhyb3BpYy5jbGF1ZGUtMy1zb25uZXQtMjAyNDAyMjktdjE6MFwiLFxuICAgIGJvZHksXG4gICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgIGFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjbGllbnQuc2VuZChjb21tYW5kKTtcbiAgICBjb25zdCByZXNwb25zZUJvZHkgPSBKU09OLnBhcnNlKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShyZXNwb25zZS5ib2R5KSk7XG4gICAgY29uc3QgY29udGVudCA9IHJlc3BvbnNlQm9keS5jb250ZW50WzBdLnRleHQ7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIC8vIFJlbW92ZSBtYXJrZG93biBjb2RlIGJsb2NrcyBpZiBwcmVzZW50XG4gICAgICBjb25zdCBjbGVhbkNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL2BgYGpzb25cXG4/fGBgYFxcbj8vZywgJycpLnRyaW0oKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNsZWFuQ29udGVudCk7XG4gICAgfSBjYXRjaCAocGFyc2VFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignSlNPTiDtjIzsi7Eg7Iuk7YyoOicsIHBhcnNlRXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IHBhcnNlRXJyb3IubWVzc2FnZSA6IFN0cmluZyhwYXJzZUVycm9yKSk7XG4gICAgICBjb25zb2xlLmVycm9yKCfsm5Drs7gg7J2R64u1OicsIGNvbnRlbnQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcGVyc29uYWxpdHlUeXBlOiB7IHR5cGU6IFwiRU5GSlwiLCBkZXNjcmlwdGlvbjogXCLrtoTshJ0g7KSRIOyYpOulmCDrsJzsg51cIiwgdHJhaXRzOiBbXCLrpqzrjZTsi61cIiwgXCLtmJHsl4VcIiwgXCLtlZnsirXsp4DtlqVcIl0gfSxcbiAgICAgICAgc3RyZW5ndGhzOiBbXG4gICAgICAgICAgeyB0aXRsZTogXCLrrLjsoJztlbTqsrDroKVcIiwgZGVzY3JpcHRpb246IFwi64uk7JaR7ZWcIOyDge2ZqeyXkOyEnCDssL3snZjsoIEg7ZW06rKw7LGFIOygnOyLnFwiLCBldmlkZW5jZTogXCLrtoTshJ0g7Jik66WY66GcIOyduO2VnCDquLDrs7jqsJJcIiB9LFxuICAgICAgICAgIHsgdGl0bGU6IFwi7ZWZ7Iq164ql66ClXCIsIGRlc2NyaXB0aW9uOiBcIuyDiOuhnOyatCDquLDsiKDqs7wg7KeA7IudIOyKteuTneyXkCDsoIHqt7nsoIFcIiwgZXZpZGVuY2U6IFwi67aE7ISdIOyYpOulmOuhnCDsnbjtlZwg6riw67O46rCSXCIgfSxcbiAgICAgICAgICB7IHRpdGxlOiBcIuy7pOuupOuLiOy8gOydtOyFmFwiLCBkZXNjcmlwdGlvbjogXCLtjIDsm5Dqs7zsnZgg7JuQ7Zmc7ZWcIOyGjO2GtSDriqXroKVcIiwgZXZpZGVuY2U6IFwi67aE7ISdIOyYpOulmOuhnCDsnbjtlZwg6riw67O46rCSXCIgfVxuICAgICAgICBdLFxuICAgICAgICB3ZWFrbmVzc2VzOiBbXG4gICAgICAgICAgeyB0aXRsZTogXCLsmYTrsr3so7zsnZhcIiwgZGVzY3JpcHRpb246IFwi6rO864+E7ZWcIOyZhOuyvSDstpTqtazroZwg7J247ZWcIOyLnOqwhCDshozsmpRcIiwgaW1wcm92ZW1lbnQ6IFwi7Jqw7ISg7Iic7JyEIOyEpOygleqzvCDsoIHsoJUg7ZKI7KeIIOq4sOykgCDsiJjrpr1cIiB9LFxuICAgICAgICAgIHsgdGl0bGU6IFwi7Iuc6rCE6rSA66asXCIsIGRlc2NyaXB0aW9uOiBcIuyXheustCDsnbzsoJUg6rSA66as7J2YIOyWtOugpOybgFwiLCBpbXByb3ZlbWVudDogXCLssrTqs4TsoIHsnbgg7J287KCVIOq0gOumrCDrj4Tqtawg7Zmc7JqpXCIgfVxuICAgICAgICBdLFxuICAgICAgICB2YWx1ZXM6IFtcIu2MgOybjO2BrFwiLCBcIuyEseyepVwiLCBcIu2SiOyniFwiXSxcbiAgICAgICAgaW50ZXJlc3RzOiBbXCLqsJzrsJxcIiwgXCLquLDsiKBcIiwgXCLtmIHsi6BcIl1cbiAgICAgIH07XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0JlZHJvY2sg7Zi47LacIOyLpO2MqDonLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBSSDrtoTshJ0g7ISc67mE7IqkIOydvOyLnCDspJHri6gnKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlc3VtZVJlc3VsdCB7XG4gIHBlcnNvbmFsSW5mbzoge1xuICAgIHN1bW1hcnk6IHN0cmluZztcbiAgfTtcbiAgZXhwZXJpZW5jZTogQXJyYXk8e1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgY29tcGFueTogc3RyaW5nO1xuICAgIGR1cmF0aW9uOiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgfT47XG4gIHNraWxsczogc3RyaW5nW107XG4gIGFjaGlldmVtZW50czogc3RyaW5nW107XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVJlc3VtZShwcm9tcHQ6IFJlc3VtZVByb21wdCk6IFByb21pc2U8UmVzdW1lUmVzdWx0PiB7XG4gIGNvbnN0IHN5c3RlbVByb21wdCA9IGBZb3UgYXJlIGEgcmVzdW1lIHdyaXRlci4gQ3JlYXRlIGEgcmVzdW1lIGZvciAke3Byb21wdC5qb2JDYXRlZ29yeX0gcG9zaXRpb24uXG5cbkFuYWx5emUgdGhlIHByb3ZpZGVkIGRvY3VtZW50cyBhbmQgY3JlYXRlIGEgcHJvZmVzc2lvbmFsIHJlc3VtZS5cblxuSU1QT1JUQU5UOiBSZXR1cm4gT05MWSBhIHZhbGlkIEpTT04gb2JqZWN0LiBObyBtYXJrZG93biwgbm8gY29kZSBibG9ja3MsIG5vIGV4cGxhbmF0aW9ucy4gSnVzdCBwdXJlIEpTT04uXG5cbkpTT04gc3RydWN0dXJlOlxue1xuICBcInBlcnNvbmFsSW5mb1wiOiB7XG4gICAgXCJzdW1tYXJ5XCI6IFwiUHJvZmVzc2lvbmFsIHN1bW1hcnkgaW4gS29yZWFuXCJcbiAgfSxcbiAgXCJleHBlcmllbmNlXCI6IFtcbiAgICB7XG4gICAgICBcInRpdGxlXCI6IFwiSm9iIHRpdGxlXCIsXG4gICAgICBcImNvbXBhbnlcIjogXCJDb21wYW55IG5hbWVcIixcbiAgICAgIFwiZHVyYXRpb25cIjogXCJEdXJhdGlvblwiLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkpvYiBkZXNjcmlwdGlvblwiXG4gICAgfVxuICBdLFxuICBcInNraWxsc1wiOiBbXCJza2lsbDFcIiwgXCJza2lsbDJcIiwgXCJza2lsbDNcIl0sXG4gIFwiYWNoaWV2ZW1lbnRzXCI6IFtcImFjaGlldmVtZW50MVwiLCBcImFjaGlldmVtZW50MlwiXVxufWA7XG5cbiAgY29uc3QgdXNlclByb21wdCA9IGBUYXJnZXQgSm9iIENhdGVnb3J5OiAke3Byb21wdC5qb2JDYXRlZ29yeX1cbiR7cHJvbXB0LmpvYlRpdGxlID8gYFNwZWNpZmljIEpvYiBUaXRsZTogJHtwcm9tcHQuam9iVGl0bGV9YCA6ICcnfVxuXG5Eb2N1bWVudHMgdG8gYW5hbHl6ZTpcbiR7cHJvbXB0LmRvY3VtZW50cy5tYXAoZG9jID0+IGBcbkRvY3VtZW50IFR5cGU6ICR7ZG9jLnR5cGV9XG5UaXRsZTogJHtkb2MudGl0bGV9XG5Db250ZW50OiAke2RvYy5jb250ZW50fVxuYCkuam9pbignXFxuLS0tXFxuJyl9YDtcblxuICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgIGFudGhyb3BpY192ZXJzaW9uOiBcImJlZHJvY2stMjAyMy0wNS0zMVwiLFxuICAgIG1heF90b2tlbnM6IDMwMDAsXG4gICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgbWVzc2FnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgcm9sZTogXCJ1c2VyXCIsXG4gICAgICAgIGNvbnRlbnQ6IHVzZXJQcm9tcHRcbiAgICAgIH1cbiAgICBdXG4gIH0pO1xuXG4gIGNvbnN0IGNvbW1hbmQgPSBuZXcgSW52b2tlTW9kZWxDb21tYW5kKHtcbiAgICBtb2RlbElkOiBcImFudGhyb3BpYy5jbGF1ZGUtMy1zb25uZXQtMjAyNDAyMjktdjE6MFwiLFxuICAgIGJvZHksXG4gICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgIGFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gIH0pO1xuXG4gIGxldCBjb250ZW50ID0gJyc7XG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2coJ0JlZHJvY2sg7Zi47LacIOyLnOyekScpO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50LnNlbmQoY29tbWFuZCk7XG4gICAgY29uc3QgcmVzcG9uc2VCb2R5ID0gSlNPTi5wYXJzZShuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocmVzcG9uc2UuYm9keSkpO1xuICAgIFxuICAgIGlmICghcmVzcG9uc2VCb2R5LmNvbnRlbnQgfHwgIXJlc3BvbnNlQm9keS5jb250ZW50WzBdIHx8ICFyZXNwb25zZUJvZHkuY29udGVudFswXS50ZXh0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcmVzcG9uc2UgZm9ybWF0IGZyb20gQmVkcm9jaycpO1xuICAgIH1cbiAgICBcbiAgICBjb250ZW50ID0gcmVzcG9uc2VCb2R5LmNvbnRlbnRbMF0udGV4dDtcbiAgICBjb25zb2xlLmxvZygnUmF3IHJlc3BvbnNlIGZpcnN0IDIwMCBjaGFyczonLCBjb250ZW50LnN1YnN0cmluZygwLCAyMDApKTtcbiAgICBjb25zb2xlLmxvZygnQ29udGVudCBpbmNsdWRlcyBiYWNrdGlja3M6JywgY29udGVudC5pbmNsdWRlcygnYCcpKTtcbiAgICBjb25zb2xlLmxvZygnQ29udGVudCBpbmNsdWRlcyBqc29uIG1hcmtlcjonLCBjb250ZW50LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2pzb24nKSk7XG4gICAgXG4gICAgLy8gU3RlcCAxOiBGaW5kIEpTT04gYm91bmRhcmllcyBmaXJzdFxuICAgIGNvbnN0IGpzb25TdGFydCA9IGNvbnRlbnQuaW5kZXhPZigneycpO1xuICAgIGNvbnN0IGpzb25FbmQgPSBjb250ZW50Lmxhc3RJbmRleE9mKCd9Jyk7XG4gICAgXG4gICAgaWYgKGpzb25TdGFydCA9PT0gLTEgfHwganNvbkVuZCA9PT0gLTEpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIEpTT04gYnJhY2tldHMgZm91bmQgaW4gY29udGVudCcpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBKU09OIGZvdW5kJyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFN0ZXAgMjogRXh0cmFjdCBvbmx5IHRoZSBKU09OIHBhcnRcbiAgICBjb25zdCBqc29uU3RyID0gY29udGVudC5zdWJzdHJpbmcoanNvblN0YXJ0LCBqc29uRW5kICsgMSk7XG4gICAgY29uc29sZS5sb2coJ0V4dHJhY3RlZCBKU09OIGZpcnN0IDEwMCBjaGFyczonLCBqc29uU3RyLnN1YnN0cmluZygwLCAxMDApKTtcbiAgICBcbiAgICBjb25zdCByZXN1bHQgPSBKU09OLnBhcnNlKGpzb25TdHIpO1xuICAgIGNvbnNvbGUubG9nKCfsnbTroKXshJwg7IOd7ISxIOyEseqztScpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gY2F0Y2ggKHBhcnNlRXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdKU09OIO2MjOyLsSDsi6TtjKg6JywgcGFyc2VFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gcGFyc2VFcnJvci5tZXNzYWdlIDogU3RyaW5nKHBhcnNlRXJyb3IpKTtcbiAgICBjb25zb2xlLmVycm9yKCfsm5Drs7gg7J2R64u1IOyghOyytDonLCBjb250ZW50KTtcbiAgICBcbiAgICAvLyBUcnkgYWx0ZXJuYXRpdmUgcGFyc2luZyBtZXRob2RzXG4gICAgdHJ5IHtcbiAgICAgIC8vIE1ldGhvZCAxOiBSZW1vdmUgZXZlcnl0aGluZyBiZWZvcmUgZmlyc3QgeyBhbmQgYWZ0ZXIgbGFzdCB9XG4gICAgICBjb25zdCBzdGFydCA9IGNvbnRlbnQuaW5kZXhPZigneycpO1xuICAgICAgY29uc3QgZW5kID0gY29udGVudC5sYXN0SW5kZXhPZignfScpICsgMTtcbiAgICAgIGlmIChzdGFydCAhPT0gLTEgJiYgZW5kID4gc3RhcnQpIHtcbiAgICAgICAgY29uc3QgZXh0cmFjdGVkID0gY29udGVudC5zbGljZShzdGFydCwgZW5kKTtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZXh0cmFjdGVkKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdBbHRlcm5hdGl2ZSBwYXJzaW5nIGZhaWxlZDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xuICAgIH1cbiAgICBcbiAgICAvLyBSZXR1cm4gc2FmZSBmYWxsYmFja1xuICAgIHJldHVybiB7XG4gICAgICBwZXJzb25hbEluZm86IHsgc3VtbWFyeTogYCR7cHJvbXB0LmpvYkNhdGVnb3J5fSDrtoTslbzsnZgg7KCE66y47ISx7J2EIOqwluy2mCDqsJzrsJzsnpDsnoXri4jri6QuYCB9LFxuICAgICAgZXhwZXJpZW5jZTogW3tcbiAgICAgICAgdGl0bGU6IFwi6rCc67Cc7J6QXCIsXG4gICAgICAgIGNvbXBhbnk6IFwi7ZSE66Gc7KCd7Yq4XCIsXG4gICAgICAgIGR1cmF0aW9uOiBcIuynhO2WieykkVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCLri6TslpHtlZwg6riw7Iig7J2EIO2ZnOyaqe2VnCDqsJzrsJwg6rK97ZeYXCJcbiAgICAgIH1dLFxuICAgICAgc2tpbGxzOiBbXCJKYXZhU2NyaXB0XCIsIFwiUmVhY3RcIiwgXCLrrLjsoJztlbTqsrDroKVcIl0sXG4gICAgICBhY2hpZXZlbWVudHM6IFtcIu2UhOuhnOygne2KuCDshLHqs7XsoIEg7JmE66OMXCIsIFwi7YyA7JuM7YGsIOuwnO2cmFwiXVxuICAgIH07XG4gIH1cbn0gIl19