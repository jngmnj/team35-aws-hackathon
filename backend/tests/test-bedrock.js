const { BedrockClient, ListFoundationModelsCommand } = require('@aws-sdk/client-bedrock');
const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime');

async function testBedrock() {
  try {
    const client = new BedrockClient({ region: 'us-east-1' });
    const command = new ListFoundationModelsCommand({});
    const response = await client.send(command);
    
    console.log('✅ Bedrock 연결 성공!');
    
    const claudeModels = response.modelSummaries?.filter(m => 
      m.modelId.includes('claude')
    );
    
    if (claudeModels?.length > 0) {
      console.log('✅ Claude 모델 사용 가능:');
      claudeModels.forEach(m => console.log(`- ${m.modelId}`));
    } else {
      console.log('❌ Claude 모델 액세스 대기 중');
    }
    
  } catch (error) {
    console.error('❌ Bedrock 연결 실패:', error.message);
  }
}

testBedrock();