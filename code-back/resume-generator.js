const BedrockClient = require('./bedrock-client');

class ResumeGenerator {
  constructor() {
    this.bedrock = new BedrockClient();
  }

  createPrompt(documents, personality, targetJob) {
    const text = documents.map(doc => `${doc.type}: ${doc.content}`).join('\n\n');
    
    return `${targetJob} 직무에 최적화된 이력서를 생성해주세요:

문서: ${text}
성격: ${personality.personality_type}, 강점: ${personality.strengths.join(', ')}

JSON 형식:
{
  "summary": "직무 맞춤 요약문",
  "key_skills": ["스킬1", "스킬2", "스킬3"],
  "experiences": [{"title": "경험", "description": "설명"}],
  "strengths_for_role": ["직무 관련 강점1", "강점2"]
}`;
  }

  async generate(documents, personality, targetJob = "일반") {
    try {
      const prompt = this.createPrompt(documents, personality, targetJob);
      const response = await this.bedrock.invokeModel(prompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : this.getFallback(targetJob);
    } catch (error) {
      console.error('이력서 생성 오류:', error);
      return this.getFallback(targetJob);
    }
  }

  getFallback(targetJob) {
    return {
      summary: `${targetJob} 분야 지원자`,
      key_skills: ["문제해결", "팀워크", "의사소통"],
      experiences: [{"title": "정보 부족", "description": "더 많은 문서 필요"}],
      strengths_for_role: ["학습능력", "성장잠재력"]
    };
  }
}

module.exports = ResumeGenerator;