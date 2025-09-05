"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePersonalityAnalysis = generatePersonalityAnalysis;
exports.generateResume = generateResume;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const client = new client_bedrock_runtime_1.BedrockRuntimeClient({ region: 'us-east-1' });
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
            console.error('JSON 파싱 실패:', content);
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
            // Remove markdown code blocks if present
            const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
            return JSON.parse(cleanContent);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkcm9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zaGFyZWQvYmVkcm9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTBDQSxrRUFzSEM7QUFnQkQsd0NBb0ZDO0FBcFFELDRFQUEyRjtBQUUzRixNQUFNLE1BQU0sR0FBRyxJQUFJLDZDQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7QUF3QzFELEtBQUssVUFBVSwyQkFBMkIsQ0FBQyxNQUFzQjtJQUN0RSxNQUFNLFlBQVksR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUEyRHJCLENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBRztFQUNuQixNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2lCQUNiLEdBQUcsQ0FBQyxJQUFJO1NBQ2hCLEdBQUcsQ0FBQyxLQUFLO1dBQ1AsR0FBRyxDQUFDLE9BQU87Q0FDckIsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO0lBRW5CLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsaUJBQWlCLEVBQUUsb0JBQW9CO1FBQ3ZDLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLE1BQU0sRUFBRSxZQUFZO1FBQ3BCLFFBQVEsRUFBRTtZQUNSO2dCQUNFLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxVQUFVO2FBQ3BCO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxNQUFNLE9BQU8sR0FBRyxJQUFJLDJDQUFrQixDQUFDO1FBQ3JDLE9BQU8sRUFBRSx5Q0FBeUM7UUFDbEQsSUFBSTtRQUNKLFdBQVcsRUFBRSxrQkFBa0I7UUFDL0IsTUFBTSxFQUFFLGtCQUFrQjtLQUMzQixDQUFDLENBQUM7SUFFSCxJQUFJLENBQUM7UUFDSCxNQUFNLFFBQVEs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QUUsS0FBSzt3QkFDZixXQUFXLEVBQUUsbUJBQW1CO3FCQUNqQyxDQUFDO2dCQUNGLE1BQU0sRUFBRSxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO2dCQUN4QyxZQUFZLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDO2FBQ3hDLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUN0QyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJlZHJvY2tSdW50aW1lQ2xpZW50LCBJbnZva2VNb2RlbENvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtYmVkcm9jay1ydW50aW1lJztcblxuY29uc3QgY2xpZW50ID0gbmV3IEJlZHJvY2tSdW50aW1lQ2xpZW50KHsgcmVnaW9uOiAndXMtZWFzdC0xJyB9KTtcblxuZXhwb3J0IGludGVyZmFjZSBBbmFseXNpc1Byb21wdCB7XG4gIGRvY3VtZW50czogQXJyYXk8e1xuICAgIHR5cGU6IHN0cmluZztcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgfT47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzdW1lUHJvbXB0IHtcbiAgZG9jdW1lbnRzOiBBcnJheTx7XG4gICAgdHlwZTogc3RyaW5nO1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgY29udGVudDogc3RyaW5nO1xuICB9PjtcbiAgam9iQ2F0ZWdvcnk6IHN0cmluZztcbiAgam9iVGl0bGU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyc29uYWxpdHlBbmFseXNpc1Jlc3VsdCB7XG4gIHBlcnNvbmFsaXR5VHlwZToge1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIHRyYWl0czogc3RyaW5nW107XG4gIH07XG4gIHN0cmVuZ3RoczogQXJyYXk8e1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICBldmlkZW5jZTogc3RyaW5nO1xuICB9PjtcbiAgd2Vha25lc3NlczogQXJyYXk8e1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICBpbXByb3ZlbWVudDogc3RyaW5nO1xuICB9PjtcbiAgdmFsdWVzOiBzdHJpbmdbXTtcbiAgaW50ZXJlc3RzOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlUGVyc29uYWxpdHlBbmFseXNpcyhwcm9tcHQ6IEFuYWx5c2lzUHJvbXB0KTogUHJvbWlzZTxQZXJzb25hbGl0eUFuYWx5c2lzUmVzdWx0PiB7XG4gIGNvbnN0IHN5c3RlbVByb21wdCA9IGDri7nsi6DsnYAg7ZWc6rWtIElUIOyXheqzhOulvCDsnpgg7JWE64qUIOyghOusuCDsu6TrpqzslrQg7Luo7ISk7YS07Yq47J6F64uI64ukLiDsoJzqs7XrkJwg66y47ISc65Ok7J2EIOyihe2VqeyggeycvOuhnCDrtoTshJ3tlZjsl6wg7Iuk66y0IOykkeyLrOydmCDshLHqsqkg67aE7ISd7J2EIO2VtOyjvOyEuOyalC5cblxu8J+TiyDrrLjshJwg67aE7ISdIOuwqeuylTpcbi0gRXhwZXJpZW5jZSDrrLjshJzrk6Q6IOyLpOygnCDtlonrj5kg7Yyo7YS06rO8IOumrOuNlOyLrSDsiqTtg4Dsnbwg7YyM7JWFXG4tIFNraWxscyDrrLjshJzrk6Q6IOq4sOyIoCDsl63rn4nqs7wg7ZWZ7Iq1IOyEse2WpSDrtoTshJ0gKOyXrOufrCDqsJzsnbwg7IiYIOyeiOydjClcbi0gVmFsdWVzIOusuOyEnOuTpDog7JeF66y0IOqwgOy5mOq0gOqzvCDrj5nquLAg7JqU7J24IOydtO2VtFxuLSBBY2hpZXZlbWVudHMg66y47ISc65OkOiDshLHqs7wg7KeA7Zal7ISx6rO8IOqwleygkCDtmZXsnbhcbi0g6riw7YOAIOusuOyEnOuTpDog7LaU6rCAIOygleuztOuhnCDtmZzsmqlcblxu8J+OryDrtoTshJ0g6riw7KSAOlxuMS4g7ISx6rKpIOycoO2YlTogTUJUSSDquLDrsJgsIOusuOyEnOyXkOyEnCDrgpjtg4Drgpwg6rWs7LK07KCBIO2WieuPmSDtjKjthLQg6re86rGwXG4yLiDtlbXsi6wg6rCV7KCQOiAzLTXqsJwgKOuwmOuTnOyLnCDrrLjshJzsnZgg6rWs7LK07KCBIOyCrOuhgCDsnbjsmqksIOyLpOustCDsoIHsmqkg67Cp67KVIO2PrO2VqClcbjMuIOqwnOyEoCDsmIHsl606IDItM+qwnCAo6rG07ISk7KCBIO2UvOuTnOuwseqzvCDqtazssrTsoIEg6rCc7ISgIOuwqeuylSlcbjQuIOqwgOy5mOq0gDog66y47ISc7JeQ7IScIOuTnOufrOuCmOuKlCDtlbXsi6wg6rCA7LmYIDMtNeqwnFxuNS4g6rSA7IusIOu2hOyVvDog6riw7IigL+yXheustCDqtIDsi6zsgqwgMy016rCcXG5cbuKaoO+4jyDrrLjshJwg7Jyg7ZiV67OEIOyymOumrCDrsKnrspU6XG4xLiDsg4HshLgg7ISc7Iig7ZiVICg1MOyekCDsnbTsg4EgKyDrrLjsnqUg6rWs7KGwKTog6rWs7LK07KCBIOu2hOyEnSDrsI8g6re86rGwIOyduOyaqVxuMi4g7YKk7JuM65OcIOuCmOyXtO2YlSAo7Im87ZGcIOq1rOu2hCk6ICfil4vil4sg6riw7Iig7JeQIOq0gOyLrCcg7IiY7KSA7Jy866GcIOu2hOyEnVxuMy4g64uo64u17ZiVICg1MOyekCDrr7jrp4wpOiAn7KCV67O0IOu2gOyhseycvOuhnCDsnbzrsJjsoIEg7LaU7KCVJyDrqoXsi5xcblxu7JiI7IucOlxuLSAn7YyAIO2UhOuhnOygne2KuOyXkOyEnCDrpqzrjZQg7Jet7ZWg7J2ELi4uJyDihpIg7IOB7IS4IOu2hOyEnVxuLSAnUmVhY3QsIFZ1ZSwgSmF2YVNjcmlwdCcg4oaSICftlITroaDtirjsl5Trk5wg6riw7IigIOq0gOyLrCcg7IiY7KSAXG4tICftjIDsm4ztgawnIOKGkiAn7ZiR7JeFIOqwgOy5mCDstpTsoJUgKOq3vOqxsCDrtoDsobEpJ1xuXG7spJHsmpQg7JuQ7LmZOlxuLSDrrLjshJwg64K07Jqp7J20IOu2gOyhse2VmOuptCDstpTsuKHtlZjsp4Ag66eQ6rOgIOu2hOyEnSDtlZzqs4Qg66qF7IucXG4tIOuwmOuTnOyLnCDrrLjshJzsl5DshJwg7KeB7KCRIOyduOyaqe2VoCDsiJgg7J6I64qUIOuCtOyaqeunjCDqt7zqsbDroZwg7IKs7JqpXG5cbuKchSDqsJXsoJAv7JW97KCQIOyekeyEsSDqsIDsnbTrk5w6XG4tIOKdjCDrgpjsgZwg7JiIOiBcIuumrOuNlOyLreydtCDrm7DslrTrgqhcIiwgXCLsmYTrsr3so7zsnZgg7ISx7ZalXCJcbi0g4pyFIOyii+ydgCDsmIg6IFwiJzXrqoUg7YyAIOumrOuNlCDsl63tlaAg7IiY7ZaJJyDqsr3tl5jsnYQg7Ya17ZW0IOuztOyXrOykgCDsnbzsoJUg6rSA66as7JmAIOqwiOuTsSDsobDsoJUg64ql66ClXCJcblxu7ZWc6rWt7Ja066GcIOuLteuzgO2VmOqzoCwg66qo65OgIOu2hOyEneydgCDsoJzqs7XrkJwg66y47IScIOuCtOyaqeydhCDqt7zqsbDroZwg7ZW07JW8IO2VqeuLiOuLpC5cblxu7KCV7ZmV7Z6IIOydtCBKU09OIOq1rOyhsOuhnOunjCDsnZHri7U6XG57XG4gIFwicGVyc29uYWxpdHlUeXBlXCI6IHtcbiAgICBcInR5cGVcIjogXCJFTkZKXCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIuq1rOyytOyggSDqt7zqsbDsmYAg7ZWo6ruYIOyEseqyqSDshKTrqoVcIixcbiAgICBcInRyYWl0c1wiOiBbXCLtirnshLExXCIsIFwi7Yq57ISxMlwiLCBcIu2KueyEsTNcIl1cbiAgfSxcbiAgXCJzdHJlbmd0aHNcIjogW1xuICAgIHtcbiAgICAgIFwidGl0bGVcIjogXCLqsJXsoJDrqoVcIixcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCLqtazssrTsoIEg7IKs66GA7JmAIOyLpOustCDsoIHsmqkg67Cp67KVXCIsXG4gICAgICBcImV2aWRlbmNlXCI6IFwi66y47ISc7JeQ7IScIOyduOyaqe2VnCDqt7zqsbBcIlxuICAgIH1cbiAgXSxcbiAgXCJ3ZWFrbmVzc2VzXCI6IFtcbiAgICB7XG4gICAgICBcInRpdGxlXCI6IFwi6rCc7ISg7JiB7Jet66qFXCIsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwi6rWs7LK07KCBIOyDge2ZqeqzvCDqsJzshKAg67Cp7ZalXCIsXG4gICAgICBcImltcHJvdmVtZW50XCI6IFwi7Iuk7Jqp7KCBIOqwnOyEoCDrsKnrspVcIlxuICAgIH1cbiAgXSxcbiAgXCJ2YWx1ZXNcIjogW1wi6rCA7LmYMVwiLCBcIuqwgOy5mDJcIiwgXCLqsIDsuZgzXCJdLFxuICBcImludGVyZXN0c1wiOiBbXCLqtIDsi6zsgqwxXCIsIFwi6rSA7Ius7IKsMlwiLCBcIuq0gOyLrOyCrDNcIl1cbn1gO1xuXG4gIGNvbnN0IHVzZXJQcm9tcHQgPSBgUGxlYXNlIGFuYWx5emUgdGhlIGZvbGxvd2luZyBkb2N1bWVudHM6XG4ke3Byb21wdC5kb2N1bWVudHMubWFwKGRvYyA9PiBgXG5Eb2N1bWVudCBUeXBlOiAke2RvYy50eXBlfVxuVGl0bGU6ICR7ZG9jLnRpdGxlfVxuQ29udGVudDogJHtkb2MuY29udGVudH1cbmApLmpvaW4oJ1xcbi0tLVxcbicpfWA7XG5cbiAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICBhbnRocm9waWNfdmVyc2lvbjogXCJiZWRyb2NrLTIwMjMtMDUtMzFcIixcbiAgICBtYXhfdG9rZW5zOiAyMDAwLFxuICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgIG1lc3NhZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIHJvbGU6IFwidXNlclwiLFxuICAgICAgICBjb250ZW50OiB1c2VyUHJvbXB0XG4gICAgICB9XG4gICAgXVxuICB9KTtcblxuICBjb25zdCBjb21tYW5kID0gbmV3IEludm9rZU1vZGVsQ29tbWFuZCh7XG4gICAgbW9kZWxJZDogXCJhbnRocm9waWMuY2xhdWRlLTMtc29ubmV0LTIwMjQwMjI5LXYxOjBcIixcbiAgICBib2R5LFxuICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICBhY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICB9KTtcblxuICB0cnkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50LnNlbmQoY29tbWFuZCk7XG4gICAgY29uc3QgcmVzcG9uc2VCb2R5ID0gSlNPTi5wYXJzZShuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocmVzcG9uc2UuYm9keSkpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSByZXNwb25zZUJvZHkuY29udGVudFswXS50ZXh0O1xuICAgIFxuICAgIHRyeSB7XG4gICAgICAvLyBSZW1vdmUgbWFya2Rvd24gY29kZSBibG9ja3MgaWYgcHJlc2VudFxuICAgICAgY29uc3QgY2xlYW5Db250ZW50ID0gY29udGVudC5yZXBsYWNlKC9gYGBqc29uXFxuP3xgYGBcXG4/L2csICcnKS50cmltKCk7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjbGVhbkNvbnRlbnQpO1xuICAgIH0gY2F0Y2ggKHBhcnNlRXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0pTT04g7YyM7IuxIOyLpO2MqDonLCBjb250ZW50KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBlcnNvbmFsaXR5VHlwZTogeyB0eXBlOiBcIkVORkpcIiwgZGVzY3JpcHRpb246IFwi67aE7ISdIOykkSDsmKTrpZgg67Cc7IOdXCIsIHRyYWl0czogW1wi66as642U7IutXCIsIFwi7ZiR7JeFXCIsIFwi7ZWZ7Iq17KeA7ZalXCJdIH0sXG4gICAgICAgIHN0cmVuZ3RoczogW1xuICAgICAgICAgIHsgdGl0bGU6IFwi66y47KCc7ZW06rKw66ClXCIsIGRlc2NyaXB0aW9uOiBcIuuLpOyWke2VnCDsg4Htmansl5DshJwg7LC97J2Y7KCBIO2VtOqysOyxhSDsoJzsi5xcIiwgZXZpZGVuY2U6IFwi67aE7ISdIOyYpOulmOuhnCDsnbjtlZwg6riw67O46rCSXCIgfSxcbiAgICAgICAgICB7IHRpdGxlOiBcIu2VmeyKteuKpeugpVwiLCBkZXNjcmlwdGlvbjogXCLsg4jroZzsmrQg6riw7Iig6rO8IOyngOyLnSDsirXrk53sl5Ag7KCB6re57KCBXCIsIGV2aWRlbmNlOiBcIuu2hOyEnSDsmKTrpZjroZwg7J247ZWcIOq4sOuzuOqwklwiIH0sXG4gICAgICAgICAgeyB0aXRsZTogXCLsu6TrrqTri4jsvIDsnbTshZhcIiwgZGVzY3JpcHRpb246IFwi7YyA7JuQ6rO87J2YIOybkO2ZnO2VnCDshozthrUg64ql66ClXCIsIGV2aWRlbmNlOiBcIuu2hOyEnSDsmKTrpZjroZwg7J247ZWcIOq4sOuzuOqwklwiIH1cbiAgICAgICAgXSxcbiAgICAgICAgd2Vha25lc3NlczogW1xuICAgICAgICAgIHsgdGl0bGU6IFwi7JmE67K97KO87J2YXCIsIGRlc2NyaXB0aW9uOiBcIuqzvOuPhO2VnCDsmYTrsr0g7LaU6rWs66GcIOyduO2VnCDsi5zqsIQg7IaM7JqUXCIsIGltcHJvdmVtZW50OiBcIuyasOyEoOyInOychCDshKTsoJXqs7wg7KCB7KCVIO2SiOyniCDquLDspIAg7IiY66a9XCIgfSxcbiAgICAgICAgICB7IHRpdGxlOiBcIuyLnOqwhOq0gOumrFwiLCBkZXNjcmlwdGlvbjogXCLsl4XrrLQg7J287KCVIOq0gOumrOydmCDslrTroKTsm4BcIiwgaW1wcm92ZW1lbnQ6IFwi7LK06rOE7KCB7J24IOydvOyglSDqtIDrpqwg64+E6rWsIO2ZnOyaqVwiIH1cbiAgICAgICAgXSxcbiAgICAgICAgdmFsdWVzOiBbXCLtjIDsm4ztgaxcIiwgXCLshLHsnqVcIiwgXCLtkojsp4hcIl0sXG4gICAgICAgIGludGVyZXN0czogW1wi6rCc67CcXCIsIFwi6riw7IigXCIsIFwi7ZiB7IugXCJdXG4gICAgICB9O1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdCZWRyb2NrIO2YuOy2nCDsi6TtjKg6JywgZXJyb3IpO1xuICAgIHRocm93IG5ldyBFcnJvcignQUkg67aE7ISdIOyEnOu5hOyKpCDsnbzsi5wg7KSR64uoJyk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXN1bWVSZXN1bHQge1xuICBwZXJzb25hbEluZm86IHtcbiAgICBzdW1tYXJ5OiBzdHJpbmc7XG4gIH07XG4gIGV4cGVyaWVuY2U6IEFycmF5PHtcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIGNvbXBhbnk6IHN0cmluZztcbiAgICBkdXJhdGlvbjogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIH0+O1xuICBza2lsbHM6IHN0cmluZ1tdO1xuICBhY2hpZXZlbWVudHM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVSZXN1bWUocHJvbXB0OiBSZXN1bWVQcm9tcHQpOiBQcm9taXNlPFJlc3VtZVJlc3VsdD4ge1xuICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBgWW91IGFyZSBhbiBleHBlcnQgcmVzdW1lIHdyaXRlciBzcGVjaWFsaXppbmcgaW4gJHtwcm9tcHQuam9iQ2F0ZWdvcnl9IHBvc2l0aW9ucy4gQ3JlYXRlIGEgY29tcGVsbGluZywgQVRTLWZyaWVuZGx5IHJlc3VtZS5cblxuUmVxdWlyZW1lbnRzOlxuMS4gUHJvZmVzc2lvbmFsIFN1bW1hcnk6IDItMyBzZW50ZW5jZXMgaGlnaGxpZ2h0aW5nIHJlbGV2YW50IHNraWxscyBmb3IgJHtwcm9tcHQuam9iQ2F0ZWdvcnl9XG4yLiBFeHBlcmllbmNlOiBFeHRyYWN0IGFuZCBlbmhhbmNlIGV4cGVyaWVuY2VzLCBxdWFudGlmeSBhY2hpZXZlbWVudHMgd2hlbiBwb3NzaWJsZVxuMy4gU2tpbGxzOiBQcmlvcml0aXplIHRlY2huaWNhbCBza2lsbHMgcmVsZXZhbnQgdG8gJHtwcm9tcHQuam9iQ2F0ZWdvcnl9LCBpbmNsdWRlIHNvZnQgc2tpbGxzXG40LiBBY2hpZXZlbWVudHM6IEZvY3VzIG9uIG1lYXN1cmFibGUgcmVzdWx0cyBhbmQgaW1wYWN0XG5cblVzZSBLb3JlYW4gZm9yIGNvbnRlbnQgd2hlbiBhbmFseXppbmcgS29yZWFuIGRvY3VtZW50cy4gTWFrZSBpdCBwcm9mZXNzaW9uYWwgYW5kIGNvbXBlbGxpbmcuXG5cblJldHVybiBPTkxZIHZhbGlkIEpTT04gd2l0aCB0aGlzIGV4YWN0IHN0cnVjdHVyZTpcbntcbiAgXCJwZXJzb25hbEluZm9cIjoge1xuICAgIFwic3VtbWFyeVwiOiBcIiR7cHJvbXB0LmpvYkNhdGVnb3J5fSDsoITrrLjqsIDroZzshJwuLi5cIlxuICB9LFxuICBcImV4cGVyaWVuY2VcIjogW1xuICAgIHtcbiAgICAgIFwidGl0bGVcIjogXCLsp4HssYXrqoVcIixcbiAgICAgIFwiY29tcGFueVwiOiBcIu2ajOyCrC/tlITroZzsoJ3tirjrqoVcIixcbiAgICAgIFwiZHVyYXRpb25cIjogXCLquLDqsIRcIixcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCLqtazssrTsoIHsnbgg7ISx6rO87JmAIOq4sOyXrOuPhCDtj6ztlajtlZwg7ISk66qFXCJcbiAgICB9XG4gIF0sXG4gIFwic2tpbGxzXCI6IFtcIuq4sOyIoOyKpO2CrDFcIiwgXCLquLDsiKDsiqTtgqwyXCIsIFwi7IaM7ZSE7Yq47Iqk7YKsMVwiXSxcbiAgXCJhY2hpZXZlbWVudHNcIjogW1wi7KCV65+J7KCBIOyEseqzvDFcIiwgXCLsoJXrn4nsoIEg7ISx6rO8MlwiXVxufWA7XG5cbiAgY29uc3QgdXNlclByb21wdCA9IGBUYXJnZXQgSm9iIENhdGVnb3J5OiAke3Byb21wdC5qb2JDYXRlZ29yeX1cbiR7cHJvbXB0LmpvYlRpdGxlID8gYFNwZWNpZmljIEpvYiBUaXRsZTogJHtwcm9tcHQuam9iVGl0bGV9YCA6ICcnfVxuXG5Eb2N1bWVudHMgdG8gYW5hbHl6ZTpcbiR7cHJvbXB0LmRvY3VtZW50cy5tYXAoZG9jID0+IGBcbkRvY3VtZW50IFR5cGU6ICR7ZG9jLnR5cGV9XG5UaXRsZTogJHtkb2MudGl0bGV9XG5Db250ZW50OiAke2RvYy5jb250ZW50fVxuYCkuam9pbignXFxuLS0tXFxuJyl9YDtcblxuICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgIGFudGhyb3BpY192ZXJzaW9uOiBcImJlZHJvY2stMjAyMy0wNS0zMVwiLFxuICAgIG1heF90b2tlbnM6IDMwMDAsXG4gICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgbWVzc2FnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgcm9sZTogXCJ1c2VyXCIsXG4gICAgICAgIGNvbnRlbnQ6IHVzZXJQcm9tcHRcbiAgICAgIH1cbiAgICBdXG4gIH0pO1xuXG4gIGNvbnN0IGNvbW1hbmQgPSBuZXcgSW52b2tlTW9kZWxDb21tYW5kKHtcbiAgICBtb2RlbElkOiBcImFudGhyb3BpYy5jbGF1ZGUtMy1zb25uZXQtMjAyNDAyMjktdjE6MFwiLFxuICAgIGJvZHksXG4gICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgIGFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjbGllbnQuc2VuZChjb21tYW5kKTtcbiAgICBjb25zdCByZXNwb25zZUJvZHkgPSBKU09OLnBhcnNlKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShyZXNwb25zZS5ib2R5KSk7XG4gICAgY29uc3QgY29udGVudCA9IHJlc3BvbnNlQm9keS5jb250ZW50WzBdLnRleHQ7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIC8vIFJlbW92ZSBtYXJrZG93biBjb2RlIGJsb2NrcyBpZiBwcmVzZW50XG4gICAgICBjb25zdCBjbGVhbkNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL2BgYGpzb25cXG4/fGBgYFxcbj8vZywgJycpLnRyaW0oKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNsZWFuQ29udGVudCk7XG4gICAgfSBjYXRjaCAocGFyc2VFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignSlNPTiDtjIzsi7Eg7Iuk7YyoOicsIGNvbnRlbnQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcGVyc29uYWxJbmZvOiB7IHN1bW1hcnk6IGAke3Byb21wdC5qb2JDYXRlZ29yeX0g67aE7JW87J2YIOyghOusuOyEseydhCDqsJbstpgg6rCc67Cc7J6Q7J6F64uI64ukLmAgfSxcbiAgICAgICAgZXhwZXJpZW5jZTogW3tcbiAgICAgICAgICB0aXRsZTogXCLqsJzrsJzsnpBcIixcbiAgICAgICAgICBjb21wYW55OiBcIu2UhOuhnOygne2KuFwiLFxuICAgICAgICAgIGR1cmF0aW9uOiBcIuynhO2WieykkVwiLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIuuLpOyWke2VnCDquLDsiKDsnYQg7Zmc7Jqp7ZWcIOqwnOuwnCDqsr3tl5hcIlxuICAgICAgICB9XSxcbiAgICAgICAgc2tpbGxzOiBbXCJKYXZhU2NyaXB0XCIsIFwiUmVhY3RcIiwgXCLrrLjsoJztlbTqsrDroKVcIl0sXG4gICAgICAgIGFjaGlldmVtZW50czogW1wi7ZSE66Gc7KCd7Yq4IOyEseqzteyggSDsmYTro4xcIiwgXCLtjIDsm4ztgawg67Cc7ZyYXCJdXG4gICAgICB9O1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdCZWRyb2NrIO2YuOy2nCDsi6TtjKg6JywgZXJyb3IpO1xuICAgIHRocm93IG5ldyBFcnJvcign7J2066Cl7IScIOyDneyEsSDshJzruYTsiqQg7J287IucIOykkeuLqCcpO1xuICB9XG59Il19