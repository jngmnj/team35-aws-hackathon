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
  const systemPrompt = `You are an expert career counselor and personality analyst. Analyze the provided documents and generate a comprehensive personality analysis including:
1. Personality type (similar to MBTI)
2. Key strengths (3-5 items)
3. Areas for improvement (2-3 items)
4. Core values (3-5 items)
5. Professional interests (3-5 items)

Return the response in JSON format with the following structure:
{
  "personalityType": {
    "type": "XXXX",
    "description": "Brief description",
    "traits": ["trait1", "trait2", "trait3"]
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "values": ["value1", "value2", "value3"],
  "interests": ["interest1", "interest2", "interest3"]
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

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  
  return JSON.parse(responseBody.content[0].text);
}

export async function generateResume(prompt: ResumePrompt): Promise<any> {
  const systemPrompt = `You are an expert resume writer. Create a professional resume based on the provided documents and target job category. 

Generate a resume with the following sections:
1. Professional Summary (2-3 sentences)
2. Experience (extracted and enhanced from documents)
3. Skills (technical and soft skills)
4. Achievements (quantified when possible)

Tailor the content specifically for the ${prompt.jobCategory} role.

Return the response in JSON format with the following structure:
{
  "personalInfo": {
    "summary": "Professional summary tailored to the role"
  },
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Duration",
      "description": "Enhanced description with achievements"
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

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    body,
    contentType: "application/json",
    accept: "application/json",
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  
  return JSON.parse(responseBody.content[0].text);
}