const BedrockClient = require('./bedrock-client');

class PersonalityAnalyzer {
  constructor() {
    this.bedrock = new BedrockClient();
  }

  createPrompt(documents) {
    const text = documents.map(doc => `${doc.type}: ${doc.content}`).join('\n\n');
    
    return `다음 텍스트를 분석하여 작성자의 성격을 자연스러운 글 형태로 분석해주세요:

${text}

다음 JSON 형식으로 응답해주세요:
{
  "personality_summary": "저는 [MBTI 유형]의 성격을 가진 사람으로, 주요 특징은... (200-300자의 자연스러운 글)",
  "strengths_description": "제 주요 강점은... 왜냐하면... (구체적 이유와 함께 150-200자)",
  "weaknesses_description": "개선이 필요한 부분은... 이는... 때문입니다 (구체적 이유와 함께 150-200자)",
  "communication_analysis": "의사소통 방식을 보면... 이러한 특징을 보입니다 (100-150자)",
  "work_style_analysis": "업무 스타일은... 특히... 하는 경향이 있습니다 (100-150자)",
  "mbti_type": "ENFP",
  "confidence_score": 85
}`;
  }

  async analyze(documents) {
    try {
      const prompt = this.createPrompt(documents);
      const response = await this.bedrock.invokeModel(prompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // 기존 형식 호환성 체크
        if (parsed.personality_type && !parsed.personality_summary) {
          return this.convertOldFormat(parsed);
        }
        return parsed;
      }
      return this.getFallback();
    } catch (error) {
      console.error('분석 오류:', error);
      return this.getFallback();
    }
  }

  convertOldFormat(oldData) {
    return {
      personality_summary: `저는 ${oldData.personality_type} 성격을 가진 사람으로, ${oldData.communication_style}을 특징으로 합니다. ${oldData.work_patterns}을 선호하며, 주요 강점으로는 ${oldData.strengths.join(', ')}을 가지고 있습니다.`,
      strengths_description: `제 주요 강점은 ${oldData.strengths.join(', ')}입니다. 이러한 강점들은 다양한 상황에서 저에게 도움이 되고 있습니다.`,
      weaknesses_description: `개선이 필요한 부분은 ${oldData.weaknesses.join(', ')}입니다. 이러한 점들을 인식하고 지속적으로 개선해 나가고 있습니다.`,
      communication_analysis: oldData.communication_style,
      work_style_analysis: oldData.work_patterns,
      mbti_type: oldData.personality_type,
      confidence_score: oldData.confidence_score
    };
  }

  getFallback() {
    return {
      personality_summary: "성격 분석을 위해서는 더 많은 정보가 필요합니다. 다양한 경험, 기술, 가치관 등에 대한 글을 작성해주시면 더 정확한 분석을 제공할 수 있습니다.",
      strengths_description: "추가 정보가 필요합니다.",
      weaknesses_description: "추가 정보가 필요합니다.",
      communication_analysis: "추가 정보가 필요합니다.",
      work_style_analysis: "추가 정보가 필요합니다.",
      mbti_type: "분석 중",
      confidence_score: 0
    };
  }
}

module.exports = PersonalityAnalyzer;