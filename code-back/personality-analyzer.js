const BedrockClient = require('./bedrock-client');

class PersonalityAnalyzer {
  constructor() {
    this.bedrock = new BedrockClient();
  }

  createPrompt(documents) {
    const text = documents.map(doc => `${doc.type}: ${doc.content}`).join('\n\n');
    
    return `다음 텍스트를 분석하여 작성자의 성격을 JSON으로 분석해주세요:

${text}

JSON 형식:
{
  "personality_type": "MBTI 유형",
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["약점1", "약점2"],
  "communication_style": "의사소통 스타일",
  "work_patterns": "업무 패턴",
  "confidence_score": 85
}`;
  }

  async analyze(documents) {
    try {
      const prompt = this.createPrompt(documents);
      const response = await this.bedrock.invokeModel(prompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : this.getFallback();
    } catch (error) {
      console.error('분석 오류:', error);
      return this.getFallback();
    }
  }

  getFallback() {
    return {
      personality_type: "분석 중",
      strengths: ["더 많은 정보 필요"],
      weaknesses: ["분석 불가"],
      communication_style: "추가 정보 필요",
      work_patterns: "추가 정보 필요",
      confidence_score: 0
    };
  }
}

module.exports = PersonalityAnalyzer;