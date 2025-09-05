"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePersonalityAnalysis = generatePersonalityAnalysis;
exports.generateResume = generateResume;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const client = new client_bedrock_runtime_1.BedrockRuntimeClient({ region: 'us-east-1' });
async function generatePersonalityAnalysis(prompt) {
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
            return JSON.parse(content);
        }
        catch (parseError) {
            console.error('JSON 파싱 실패:', content);
            return {
                personalityType: { type: "ENFJ", description: "분석 중 오류 발생", traits: ["리더십", "협업", "학습지향"] },
                strengths: ["문제해결력", "학습능력", "커뮤니케이션"],
                weaknesses: ["완벽주의", "시간관리"],
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
            return JSON.parse(content);
        }
        catch (parseError) {
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
    }
    catch (error) {
        console.error('Bedrock 호출 실패:', error);
        throw new Error('이력서 생성 서비스 일시 중단');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkcm9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zaGFyZWQvYmVkcm9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXNCQSxrRUF3RUM7QUFFRCx3Q0FrRkM7QUFsTEQsNEVBQTJGO0FBRTNGLE1BQU0sTUFBTSxHQUFHLElBQUksNkNBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztBQW9CMUQsS0FBSyxVQUFVLDJCQUEyQixDQUFDLE1BQXNCO0lBQ3RFLE1BQU0sWUFBWSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBc0JyQixDQUFDO0lBRUQsTUFBTSxVQUFVLEdBQUc7RUFDbkIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztpQkFDYixHQUFHLENBQUMsSUFBSTtTQUNoQixHQUFHLENBQUMsS0FBSztXQUNQLEdBQUcsQ0FBQyxPQUFPO0NBQ3JCLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztJQUVuQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLGlCQUFpQixFQUFFLG9CQUFvQjtRQUN2QyxVQUFVLEVBQUUsSUFBSTtRQUNoQixNQUFNLEVBQUUsWUFBWTtRQUNwQixRQUFRLEVBQUU7WUFDUjtnQkFDRSxJQUFJLEVBQUUsTUFBTTtnQkFDWixPQUFPLEVBQUUsVUFBVTthQUNwQjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxPQUFPLEdBQUcsSUFBSSwyQ0FBa0IsQ0FBQztRQUNyQyxPQUFPLEVBQUUseUNBQXlDO1FBQ2xELElBQUk7UUFDSixXQUFXLEVBQUUsa0JBQWtCO1FBQy9CLE1BQU0sRUFBRSxrQkFBa0I7S0FDM0IsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDO1FBQ0gsTUFBTSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FB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QUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFN0MsSUFBSSxDQUFDO1lBQ0gsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFBQyxPQUFPLFVBQVUsRUFBRSxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLE9BQU87Z0JBQ0wsWUFBWSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDLFdBQVcsc0JBQXNCLEVBQUU7Z0JBQ3RFLFVBQVUsRUFBRSxDQUFDO3dCQUNYLEtBQUssRUFBRSxLQUFLO3dCQUNaLE9BQU8sRUFBRSxNQUFNO3dCQUNmLFFBQVEsRUFBRSxLQUFLO3dCQUNmLFdBQVcsRUFBRSxtQkFBbUI7cUJBQ2pDLENBQUM7Z0JBQ0YsTUFBTSxFQUFFLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUM7Z0JBQ3hDLFlBQVksRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7YUFDeEMsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmVkcm9ja1J1bnRpbWVDbGllbnQsIEludm9rZU1vZGVsQ29tbWFuZCB9IGZyb20gJ0Bhd3Mtc2RrL2NsaWVudC1iZWRyb2NrLXJ1bnRpbWUnO1xuXG5jb25zdCBjbGllbnQgPSBuZXcgQmVkcm9ja1J1bnRpbWVDbGllbnQoeyByZWdpb246ICd1cy1lYXN0LTEnIH0pO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFuYWx5c2lzUHJvbXB0IHtcbiAgZG9jdW1lbnRzOiBBcnJheTx7XG4gICAgdHlwZTogc3RyaW5nO1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgY29udGVudDogc3RyaW5nO1xuICB9Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXN1bWVQcm9tcHQge1xuICBkb2N1bWVudHM6IEFycmF5PHtcbiAgICB0eXBlOiBzdHJpbmc7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICBjb250ZW50OiBzdHJpbmc7XG4gIH0+O1xuICBqb2JDYXRlZ29yeTogc3RyaW5nO1xuICBqb2JUaXRsZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlUGVyc29uYWxpdHlBbmFseXNpcyhwcm9tcHQ6IEFuYWx5c2lzUHJvbXB0KTogUHJvbWlzZTxhbnk+IHtcbiAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gYFlvdSBhcmUgYW4gZXhwZXJ0IGNhcmVlciBjb3Vuc2Vsb3IgYW5kIHBlcnNvbmFsaXR5IGFuYWx5c3QuIEFuYWx5emUgdGhlIHByb3ZpZGVkIGRvY3VtZW50cyBhbmQgZ2VuZXJhdGUgYSBjb21wcmVoZW5zaXZlIHBlcnNvbmFsaXR5IGFuYWx5c2lzLlxuXG5Gb2N1cyBvbjpcbjEuIE1CVEktc3R5bGUgcGVyc29uYWxpdHkgdHlwZSB3aXRoIGNsZWFyIHJlYXNvbmluZ1xuMi4gMy01IGtleSBzdHJlbmd0aHMgYmFzZWQgb24gZXZpZGVuY2UgZnJvbSBkb2N1bWVudHNcbjMuIDItMyBhcmVhcyBmb3IgaW1wcm92ZW1lbnQgKGNvbnN0cnVjdGl2ZSBmZWVkYmFjaylcbjQuIDMtNSBjb3JlIHZhbHVlcyBkZW1vbnN0cmF0ZWQgaW4gdGhlaXIgZXhwZXJpZW5jZXNcbjUuIDMtNSBwcm9mZXNzaW9uYWwgaW50ZXJlc3RzIGFsaWduZWQgd2l0aCB0aGVpciBza2lsbHNcblxuQmUgc3BlY2lmaWMgYW5kIGV2aWRlbmNlLWJhc2VkLiBVc2UgS29yZWFuIGZvciBkZXNjcmlwdGlvbnMgd2hlbiBhbmFseXppbmcgS29yZWFuIGNvbnRlbnQuXG5cblJldHVybiBPTkxZIHZhbGlkIEpTT04gd2l0aCB0aGlzIGV4YWN0IHN0cnVjdHVyZTpcbntcbiAgXCJwZXJzb25hbGl0eVR5cGVcIjoge1xuICAgIFwidHlwZVwiOiBcIkVORkpcIixcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwi66as642U7Iut6rO8IO2YkeyXheydhCDspJHsi5ztlZjripQg7ISx6rKp7Jy866GcLi4uXCIsXG4gICAgXCJ0cmFpdHNcIjogW1wi66as642U7IutXCIsIFwi7ZiR7JeFIOuKpeugpVwiLCBcIu2VmeyKtSDsp4DtlqXsoIFcIl1cbiAgfSxcbiAgXCJzdHJlbmd0aHNcIjogW1wi7YyAIOumrOuNlOyLrVwiLCBcIuq4sOyIoCDtlZnsirUg64ql66ClXCIsIFwi66y47KCcIO2VtOqysOugpVwiXSxcbiAgXCJ3ZWFrbmVzc2VzXCI6IFtcIuyZhOuyveyjvOydmCDshLHtlqVcIiwgXCLsi5zqsIQg6rSA66asXCJdLFxuICBcInZhbHVlc1wiOiBbXCLtjIDsm4ztgaxcIiwgXCLsp4Dsho3soIEg7ZWZ7Iq1XCIsIFwi7ZKI7KeIIOykkeyLnFwiXSxcbiAgXCJpbnRlcmVzdHNcIjogW1wi7Ju5IOqwnOuwnFwiLCBcIu2UhOuhoO2KuOyXlOuTnFwiLCBcIuyCrOyaqeyekCDqsr3tl5hcIl1cbn1gO1xuXG4gIGNvbnN0IHVzZXJQcm9tcHQgPSBgUGxlYXNlIGFuYWx5emUgdGhlIGZvbGxvd2luZyBkb2N1bWVudHM6XG4ke3Byb21wdC5kb2N1bWVudHMubWFwKGRvYyA9PiBgXG5Eb2N1bWVudCBUeXBlOiAke2RvYy50eXBlfVxuVGl0bGU6ICR7ZG9jLnRpdGxlfVxuQ29udGVudDogJHtkb2MuY29udGVudH1cbmApLmpvaW4oJ1xcbi0tLVxcbicpfWA7XG5cbiAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICBhbnRocm9waWNfdmVyc2lvbjogXCJiZWRyb2NrLTIwMjMtMDUtMzFcIixcbiAgICBtYXhfdG9rZW5zOiAyMDAwLFxuICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgIG1lc3NhZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIHJvbGU6IFwidXNlclwiLFxuICAgICAgICBjb250ZW50OiB1c2VyUHJvbXB0XG4gICAgICB9XG4gICAgXVxuICB9KTtcblxuICBjb25zdCBjb21tYW5kID0gbmV3IEludm9rZU1vZGVsQ29tbWFuZCh7XG4gICAgbW9kZWxJZDogXCJhbnRocm9waWMuY2xhdWRlLTMtc29ubmV0LTIwMjQwMjI5LXYxOjBcIixcbiAgICBib2R5LFxuICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICBhY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICB9KTtcblxuICB0cnkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50LnNlbmQoY29tbWFuZCk7XG4gICAgY29uc3QgcmVzcG9uc2VCb2R5ID0gSlNPTi5wYXJzZShuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocmVzcG9uc2UuYm9keSkpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSByZXNwb25zZUJvZHkuY29udGVudFswXS50ZXh0O1xuICAgIFxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgICB9IGNhdGNoIChwYXJzZUVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdKU09OIO2MjOyLsSDsi6TtjKg6JywgY29udGVudCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwZXJzb25hbGl0eVR5cGU6IHsgdHlwZTogXCJFTkZKXCIsIGRlc2NyaXB0aW9uOiBcIuu2hOyEnSDspJEg7Jik66WYIOuwnOyDnVwiLCB0cmFpdHM6IFtcIuumrOuNlOyLrVwiLCBcIu2YkeyXhVwiLCBcIu2VmeyKteyngO2WpVwiXSB9LFxuICAgICAgICBzdHJlbmd0aHM6IFtcIuusuOygnO2VtOqysOugpVwiLCBcIu2VmeyKteuKpeugpVwiLCBcIuy7pOuupOuLiOy8gOydtOyFmFwiXSxcbiAgICAgICAgd2Vha25lc3NlczogW1wi7JmE67K97KO87J2YXCIsIFwi7Iuc6rCE6rSA66asXCJdLFxuICAgICAgICB2YWx1ZXM6IFtcIu2MgOybjO2BrFwiLCBcIuyEseyepVwiLCBcIu2SiOyniFwiXSxcbiAgICAgICAgaW50ZXJlc3RzOiBbXCLqsJzrsJxcIiwgXCLquLDsiKBcIiwgXCLtmIHsi6BcIl1cbiAgICAgIH07XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0JlZHJvY2sg7Zi47LacIOyLpO2MqDonLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBSSDrtoTshJ0g7ISc67mE7IqkIOydvOyLnCDspJHri6gnKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVSZXN1bWUocHJvbXB0OiBSZXN1bWVQcm9tcHQpOiBQcm9taXNlPGFueT4ge1xuICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBgWW91IGFyZSBhbiBleHBlcnQgcmVzdW1lIHdyaXRlciBzcGVjaWFsaXppbmcgaW4gJHtwcm9tcHQuam9iQ2F0ZWdvcnl9IHBvc2l0aW9ucy4gQ3JlYXRlIGEgY29tcGVsbGluZywgQVRTLWZyaWVuZGx5IHJlc3VtZS5cblxuUmVxdWlyZW1lbnRzOlxuMS4gUHJvZmVzc2lvbmFsIFN1bW1hcnk6IDItMyBzZW50ZW5jZXMgaGlnaGxpZ2h0aW5nIHJlbGV2YW50IHNraWxscyBmb3IgJHtwcm9tcHQuam9iQ2F0ZWdvcnl9XG4yLiBFeHBlcmllbmNlOiBFeHRyYWN0IGFuZCBlbmhhbmNlIGV4cGVyaWVuY2VzLCBxdWFudGlmeSBhY2hpZXZlbWVudHMgd2hlbiBwb3NzaWJsZVxuMy4gU2tpbGxzOiBQcmlvcml0aXplIHRlY2huaWNhbCBza2lsbHMgcmVsZXZhbnQgdG8gJHtwcm9tcHQuam9iQ2F0ZWdvcnl9LCBpbmNsdWRlIHNvZnQgc2tpbGxzXG40LiBBY2hpZXZlbWVudHM6IEZvY3VzIG9uIG1lYXN1cmFibGUgcmVzdWx0cyBhbmQgaW1wYWN0XG5cblVzZSBLb3JlYW4gZm9yIGNvbnRlbnQgd2hlbiBhbmFseXppbmcgS29yZWFuIGRvY3VtZW50cy4gTWFrZSBpdCBwcm9mZXNzaW9uYWwgYW5kIGNvbXBlbGxpbmcuXG5cblJldHVybiBPTkxZIHZhbGlkIEpTT04gd2l0aCB0aGlzIGV4YWN0IHN0cnVjdHVyZTpcbntcbiAgXCJwZXJzb25hbEluZm9cIjoge1xuICAgIFwic3VtbWFyeVwiOiBcIiR7cHJvbXB0LmpvYkNhdGVnb3J5fSDsoITrrLjqsIDroZzshJwuLi5cIlxuICB9LFxuICBcImV4cGVyaWVuY2VcIjogW1xuICAgIHtcbiAgICAgIFwidGl0bGVcIjogXCLsp4HssYXrqoVcIixcbiAgICAgIFwiY29tcGFueVwiOiBcIu2ajOyCrC/tlITroZzsoJ3tirjrqoVcIixcbiAgICAgIFwiZHVyYXRpb25cIjogXCLquLDqsIRcIixcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCLqtazssrTsoIHsnbgg7ISx6rO87JmAIOq4sOyXrOuPhCDtj6ztlajtlZwg7ISk66qFXCJcbiAgICB9XG4gIF0sXG4gIFwic2tpbGxzXCI6IFtcIuq4sOyIoOyKpO2CrDFcIiwgXCLquLDsiKDsiqTtgqwyXCIsIFwi7IaM7ZSE7Yq47Iqk7YKsMVwiXSxcbiAgXCJhY2hpZXZlbWVudHNcIjogW1wi7KCV65+J7KCBIOyEseqzvDFcIiwgXCLsoJXrn4nsoIEg7ISx6rO8MlwiXVxufWA7XG5cbiAgY29uc3QgdXNlclByb21wdCA9IGBUYXJnZXQgSm9iIENhdGVnb3J5OiAke3Byb21wdC5qb2JDYXRlZ29yeX1cbiR7cHJvbXB0LmpvYlRpdGxlID8gYFNwZWNpZmljIEpvYiBUaXRsZTogJHtwcm9tcHQuam9iVGl0bGV9YCA6ICcnfVxuXG5Eb2N1bWVudHMgdG8gYW5hbHl6ZTpcbiR7cHJvbXB0LmRvY3VtZW50cy5tYXAoZG9jID0+IGBcbkRvY3VtZW50IFR5cGU6ICR7ZG9jLnR5cGV9XG5UaXRsZTogJHtkb2MudGl0bGV9XG5Db250ZW50OiAke2RvYy5jb250ZW50fVxuYCkuam9pbignXFxuLS0tXFxuJyl9YDtcblxuICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgIGFudGhyb3BpY192ZXJzaW9uOiBcImJlZHJvY2stMjAyMy0wNS0zMVwiLFxuICAgIG1heF90b2tlbnM6IDMwMDAsXG4gICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgbWVzc2FnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgcm9sZTogXCJ1c2VyXCIsXG4gICAgICAgIGNvbnRlbnQ6IHVzZXJQcm9tcHRcbiAgICAgIH1cbiAgICBdXG4gIH0pO1xuXG4gIGNvbnN0IGNvbW1hbmQgPSBuZXcgSW52b2tlTW9kZWxDb21tYW5kKHtcbiAgICBtb2RlbElkOiBcImFudGhyb3BpYy5jbGF1ZGUtMy1zb25uZXQtMjAyNDAyMjktdjE6MFwiLFxuICAgIGJvZHksXG4gICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgIGFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjbGllbnQuc2VuZChjb21tYW5kKTtcbiAgICBjb25zdCByZXNwb25zZUJvZHkgPSBKU09OLnBhcnNlKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShyZXNwb25zZS5ib2R5KSk7XG4gICAgY29uc3QgY29udGVudCA9IHJlc3BvbnNlQm9keS5jb250ZW50WzBdLnRleHQ7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgIH0gY2F0Y2ggKHBhcnNlRXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0pTT04g7YyM7IuxIOyLpO2MqDonLCBjb250ZW50KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBlcnNvbmFsSW5mbzogeyBzdW1tYXJ5OiBgJHtwcm9tcHQuam9iQ2F0ZWdvcnl9IOu2hOyVvOydmCDsoITrrLjshLHsnYQg6rCW7LaYIOqwnOuwnOyekOyeheuLiOuLpC5gIH0sXG4gICAgICAgIGV4cGVyaWVuY2U6IFt7XG4gICAgICAgICAgdGl0bGU6IFwi6rCc67Cc7J6QXCIsXG4gICAgICAgICAgY29tcGFueTogXCLtlITroZzsoJ3tirhcIixcbiAgICAgICAgICBkdXJhdGlvbjogXCLsp4TtlonspJFcIixcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCLri6TslpHtlZwg6riw7Iig7J2EIO2ZnOyaqe2VnCDqsJzrsJwg6rK97ZeYXCJcbiAgICAgICAgfV0sXG4gICAgICAgIHNraWxsczogW1wiSmF2YVNjcmlwdFwiLCBcIlJlYWN0XCIsIFwi66y47KCc7ZW06rKw66ClXCJdLFxuICAgICAgICBhY2hpZXZlbWVudHM6IFtcIu2UhOuhnOygne2KuCDshLHqs7XsoIEg7JmE66OMXCIsIFwi7YyA7JuM7YGsIOuwnO2cmFwiXVxuICAgICAgfTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignQmVkcm9jayDtmLjstpwg7Iuk7YyoOicsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ+ydtOugpeyEnCDsg53shLEg7ISc67mE7IqkIOydvOyLnCDspJHri6gnKTtcbiAgfVxufSJdfQ==