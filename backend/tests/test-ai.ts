import { generatePersonalityAnalysis, generateResume } from '../src/shared/bedrock';

const testDocuments = [
  {
    type: 'Experience',
    title: '팀 프로젝트 리더 경험',
    content: '대학교에서 5명으로 구성된 팀의 리더로 웹 애플리케이션 개발 프로젝트를 진행했습니다. React와 Node.js를 사용하여 3개월간 개발했으며, 팀원들과의 소통을 통해 프로젝트를 성공적으로 완료했습니다. 사용자 피드백을 반영하여 UI/UX를 개선했고, 성능 최적화를 통해 로딩 시간을 30% 단축시켰습니다.'
  },
  {
    type: 'Skills',
    title: '기술 스택 및 학습 능력',
    content: 'JavaScript, React, Node.js, TypeScript에 능숙하며, AWS 서비스 학습 중입니다. 새로운 기술 학습에 적극적이며, 문제 해결을 위해 다양한 접근 방식을 시도합니다. Git을 활용한 협업과 코드 리뷰 경험이 있습니다.'
  },
  {
    type: 'Values',
    title: '가치관 및 업무 스타일',
    content: '팀워크를 중시하며, 지속적인 개선과 학습을 추구합니다. 사용자 경험을 우선시하고, 코드 품질과 유지보수성을 중요하게 생각합니다. 효율적인 커뮤니케이션을 통해 프로젝트 목표 달성에 기여합니다.'
  },
  {
    type: 'Achievements',
    title: '주요 성과',
    content: '팀 프로젝트에서 리더 역할을 수행하며 프로젝트를 기한 내 완료했습니다. 사용자 만족도 95% 달성, 코드 리뷰를 통한 버그 50% 감소, 팀원들의 기술 역량 향상에 기여했습니다.'
  }
];

async function testAIFunctions() {
  console.log('🤖 AI 기능 테스트 시작\n');

  try {
    console.log('1️⃣ 성격 분석 테스트...');
    const personalityResult = await generatePersonalityAnalysis({
      documents: testDocuments
    });
    console.log('✅ 성격 분석 완료:');
    console.log(JSON.stringify(personalityResult, null, 2));

    console.log('\n2️⃣ 이력서 생성 테스트...');
    const resumeResult = await generateResume({
      documents: testDocuments,
      jobCategory: 'Frontend Developer',
      jobTitle: 'Senior React Developer'
    });
    console.log('✅ 이력서 생성 완료:');
    console.log(JSON.stringify(resumeResult, null, 2));

    console.log('\n🎉 모든 AI 기능 테스트 성공!');

  } catch (error) {
    console.error('❌ AI 기능 테스트 실패:', error);
  }
}

testAIFunctions();