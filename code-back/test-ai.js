const PersonalityAnalyzer = require('./personality-analyzer');
const ResumeGenerator = require('./resume-generator');

const testDocs = [
  { type: 'Experience', content: '팀 프로젝트 리더로 5명과 웹앱 개발' },
  { type: 'Skills', content: 'JavaScript, React 능숙, 새 기술 학습 적극적' },
  { type: 'Values', content: '팀워크 중시, 지속적 개선 추구' }
];

async function test() {
  console.log('🤖 AI 테스트 시작\n');

  const analyzer = new PersonalityAnalyzer();
  const generator = new ResumeGenerator();

  console.log('1. 성격 분석');
  const personality = await analyzer.analyze(testDocs);
  console.log(JSON.stringify(personality, null, 2));

  console.log('\n2. 이력서 생성');
  const resume = await generator.generate(testDocs, personality, 'Frontend Developer');
  console.log(JSON.stringify(resume, null, 2));
}

if (process.env.AWS_ACCESS_KEY_ID) {
  test();
} else {
  console.log('AWS 자격증명 설정 필요');
}