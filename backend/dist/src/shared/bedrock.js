"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePersonalityAnalysis = generatePersonalityAnalysis;
exports.generateResume = generateResume;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const client = new client_bedrock_runtime_1.BedrockRuntimeClient({ region: 'us-east-1' });
async function generatePersonalityAnalysis(prompt) {
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
    const command = new client_bedrock_runtime_1.InvokeModelCommand({
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        body,
        contentType: "application/json",
        accept: "application/json",
    });
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return JSON.parse(responseBody.content[0].text);
}
async function generateResume(prompt) {
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
    const command = new client_bedrock_runtime_1.InvokeModelCommand({
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        body,
        contentType: "application/json",
        accept: "application/json",
    });
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return JSON.parse(responseBody.content[0].text);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkcm9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zaGFyZWQvYmVkcm9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXNCQSxrRUFtREM7QUFFRCx3Q0E2REM7QUF4SUQsNEVBQTJGO0FBRTNGLE1BQU0sTUFBTSxHQUFHLElBQUksNkNBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztBQW9CMUQsS0FBSyxVQUFVLDJCQUEyQixDQUFDLE1BQXNCO0lBQ3RFLE1BQU0sWUFBWSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFrQnJCLENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBRztFQUNuQixNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2lCQUNiLEdBQUcsQ0FBQyxJQUFJO1NBQ2hCLEdBQUcsQ0FBQyxLQUFLO1dBQ1AsR0FBRyxDQUFDLE9BQU87Q0FDckIsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO0lBRW5CLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsaUJBQWlCLEVBQUUsb0JBQW9CO1FBQ3ZDLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLE1BQU0sRUFBRSxZQUFZO1FBQ3BCLFFBQVEsRUFBRTtZQUNSO2dCQUNFLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxVQUFVO2FBQ3BCO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxNQUFNLE9BQU8sR0FBRyxJQUFJLDJDQUFrQixDQUFDO1FBQ3JDLE9BQU8sRUFBRSx5Q0FBeUM7UUFDbEQsSUFBSTtRQUNKLFdBQVcsRUFBRSxrQkFBa0I7UUFDL0IsTUFBTSxFQUFFLGtCQUFrQjtLQUMzQixDQUFDLENBQUM7SUFFSCxNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUV6RSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRCxDQUFDO0FBRU0sS0FBSyxVQUFVLGNBQWMsQ0FBQyxNQUFvQjtJQUN2RCxNQUFNLFlBQVksR0FBRzs7Ozs7Ozs7MENBUW1CLE1BQU0sQ0FBQyxXQUFXOzs7Ozs7Ozs7Ozs7Ozs7OztFQWlCMUQsQ0FBQztJQUVELE1BQU0sVUFBVSxHQUFHLHdCQUF3QixNQUFNLENBQUMsV0FBVztFQUM3RCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFOzs7RUFHL0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztpQkFDYixHQUFHLENBQUMsSUFBSTtTQUNoQixHQUFHLENBQUMsS0FBSztXQUNQLEdBQUcsQ0FBQyxPQUFPO0NBQ3JCLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztJQUVuQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLGlCQUFpQixFQUFFLG9CQUFvQjtRQUN2QyxVQUFVLEVBQUUsSUFBSTtRQUNoQixNQUFNLEVBQUUsWUFBWTtRQUNwQixRQUFRLEVBQUU7WUFDUjtnQkFDRSxJQUFJLEVBQUUsTUFBTTtnQkFDWixPQUFPLEVBQUUsVUFBVTthQUNwQjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxPQUFPLEdBQUcsSUFBSSwyQ0FBa0IsQ0FBQztRQUNyQyxPQUFPLEVBQUUseUNBQXlDO1FBQ2xELElBQUk7UUFDSixXQUFXLEVBQUUsa0JBQWtCO1FBQy9CLE1BQU0sRUFBRSxrQkFBa0I7S0FDM0IsQ0FBQyxDQUFDO0lBRUgsTUFBTSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFFekUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJlZHJvY2tSdW50aW1lQ2xpZW50LCBJbnZva2VNb2RlbENvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtYmVkcm9jay1ydW50aW1lJztcblxuY29uc3QgY2xpZW50ID0gbmV3IEJlZHJvY2tSdW50aW1lQ2xpZW50KHsgcmVnaW9uOiAndXMtZWFzdC0xJyB9KTtcblxuZXhwb3J0IGludGVyZmFjZSBBbmFseXNpc1Byb21wdCB7XG4gIGRvY3VtZW50czogQXJyYXk8e1xuICAgIHR5cGU6IHN0cmluZztcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgfT47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzdW1lUHJvbXB0IHtcbiAgZG9jdW1lbnRzOiBBcnJheTx7XG4gICAgdHlwZTogc3RyaW5nO1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgY29udGVudDogc3RyaW5nO1xuICB9PjtcbiAgam9iQ2F0ZWdvcnk6IHN0cmluZztcbiAgam9iVGl0bGU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVBlcnNvbmFsaXR5QW5hbHlzaXMocHJvbXB0OiBBbmFseXNpc1Byb21wdCk6IFByb21pc2U8YW55PiB7XG4gIGNvbnN0IHN5c3RlbVByb21wdCA9IGBZb3UgYXJlIGFuIGV4cGVydCBjYXJlZXIgY291bnNlbG9yIGFuZCBwZXJzb25hbGl0eSBhbmFseXN0LiBBbmFseXplIHRoZSBwcm92aWRlZCBkb2N1bWVudHMgYW5kIGdlbmVyYXRlIGEgY29tcHJlaGVuc2l2ZSBwZXJzb25hbGl0eSBhbmFseXNpcyBpbmNsdWRpbmc6XG4xLiBQZXJzb25hbGl0eSB0eXBlIChzaW1pbGFyIHRvIE1CVEkpXG4yLiBLZXkgc3RyZW5ndGhzICgzLTUgaXRlbXMpXG4zLiBBcmVhcyBmb3IgaW1wcm92ZW1lbnQgKDItMyBpdGVtcylcbjQuIENvcmUgdmFsdWVzICgzLTUgaXRlbXMpXG41LiBQcm9mZXNzaW9uYWwgaW50ZXJlc3RzICgzLTUgaXRlbXMpXG5cblJldHVybiB0aGUgcmVzcG9uc2UgaW4gSlNPTiBmb3JtYXQgd2l0aCB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZTpcbntcbiAgXCJwZXJzb25hbGl0eVR5cGVcIjoge1xuICAgIFwidHlwZVwiOiBcIlhYWFhcIixcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiQnJpZWYgZGVzY3JpcHRpb25cIixcbiAgICBcInRyYWl0c1wiOiBbXCJ0cmFpdDFcIiwgXCJ0cmFpdDJcIiwgXCJ0cmFpdDNcIl1cbiAgfSxcbiAgXCJzdHJlbmd0aHNcIjogW1wic3RyZW5ndGgxXCIsIFwic3RyZW5ndGgyXCIsIFwic3RyZW5ndGgzXCJdLFxuICBcIndlYWtuZXNzZXNcIjogW1wid2Vha25lc3MxXCIsIFwid2Vha25lc3MyXCJdLFxuICBcInZhbHVlc1wiOiBbXCJ2YWx1ZTFcIiwgXCJ2YWx1ZTJcIiwgXCJ2YWx1ZTNcIl0sXG4gIFwiaW50ZXJlc3RzXCI6IFtcImludGVyZXN0MVwiLCBcImludGVyZXN0MlwiLCBcImludGVyZXN0M1wiXVxufWA7XG5cbiAgY29uc3QgdXNlclByb21wdCA9IGBQbGVhc2UgYW5hbHl6ZSB0aGUgZm9sbG93aW5nIGRvY3VtZW50czpcbiR7cHJvbXB0LmRvY3VtZW50cy5tYXAoZG9jID0+IGBcbkRvY3VtZW50IFR5cGU6ICR7ZG9jLnR5cGV9XG5UaXRsZTogJHtkb2MudGl0bGV9XG5Db250ZW50OiAke2RvYy5jb250ZW50fVxuYCkuam9pbignXFxuLS0tXFxuJyl9YDtcblxuICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgIGFudGhyb3BpY192ZXJzaW9uOiBcImJlZHJvY2stMjAyMy0wNS0zMVwiLFxuICAgIG1heF90b2tlbnM6IDIwMDAsXG4gICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgbWVzc2FnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgcm9sZTogXCJ1c2VyXCIsXG4gICAgICAgIGNvbnRlbnQ6IHVzZXJQcm9tcHRcbiAgICAgIH1cbiAgICBdXG4gIH0pO1xuXG4gIGNvbnN0IGNvbW1hbmQgPSBuZXcgSW52b2tlTW9kZWxDb21tYW5kKHtcbiAgICBtb2RlbElkOiBcImFudGhyb3BpYy5jbGF1ZGUtMy1zb25uZXQtMjAyNDAyMjktdjE6MFwiLFxuICAgIGJvZHksXG4gICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgIGFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gIH0pO1xuXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50LnNlbmQoY29tbWFuZCk7XG4gIGNvbnN0IHJlc3BvbnNlQm9keSA9IEpTT04ucGFyc2UobmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHJlc3BvbnNlLmJvZHkpKTtcbiAgXG4gIHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlQm9keS5jb250ZW50WzBdLnRleHQpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVSZXN1bWUocHJvbXB0OiBSZXN1bWVQcm9tcHQpOiBQcm9taXNlPGFueT4ge1xuICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBgWW91IGFyZSBhbiBleHBlcnQgcmVzdW1lIHdyaXRlci4gQ3JlYXRlIGEgcHJvZmVzc2lvbmFsIHJlc3VtZSBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgZG9jdW1lbnRzIGFuZCB0YXJnZXQgam9iIGNhdGVnb3J5LiBcblxuR2VuZXJhdGUgYSByZXN1bWUgd2l0aCB0aGUgZm9sbG93aW5nIHNlY3Rpb25zOlxuMS4gUHJvZmVzc2lvbmFsIFN1bW1hcnkgKDItMyBzZW50ZW5jZXMpXG4yLiBFeHBlcmllbmNlIChleHRyYWN0ZWQgYW5kIGVuaGFuY2VkIGZyb20gZG9jdW1lbnRzKVxuMy4gU2tpbGxzICh0ZWNobmljYWwgYW5kIHNvZnQgc2tpbGxzKVxuNC4gQWNoaWV2ZW1lbnRzIChxdWFudGlmaWVkIHdoZW4gcG9zc2libGUpXG5cblRhaWxvciB0aGUgY29udGVudCBzcGVjaWZpY2FsbHkgZm9yIHRoZSAke3Byb21wdC5qb2JDYXRlZ29yeX0gcm9sZS5cblxuUmV0dXJuIHRoZSByZXNwb25zZSBpbiBKU09OIGZvcm1hdCB3aXRoIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlOlxue1xuICBcInBlcnNvbmFsSW5mb1wiOiB7XG4gICAgXCJzdW1tYXJ5XCI6IFwiUHJvZmVzc2lvbmFsIHN1bW1hcnkgdGFpbG9yZWQgdG8gdGhlIHJvbGVcIlxuICB9LFxuICBcImV4cGVyaWVuY2VcIjogW1xuICAgIHtcbiAgICAgIFwidGl0bGVcIjogXCJKb2IgVGl0bGVcIixcbiAgICAgIFwiY29tcGFueVwiOiBcIkNvbXBhbnkgTmFtZVwiLFxuICAgICAgXCJkdXJhdGlvblwiOiBcIkR1cmF0aW9uXCIsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRW5oYW5jZWQgZGVzY3JpcHRpb24gd2l0aCBhY2hpZXZlbWVudHNcIlxuICAgIH1cbiAgXSxcbiAgXCJza2lsbHNcIjogW1wic2tpbGwxXCIsIFwic2tpbGwyXCIsIFwic2tpbGwzXCJdLFxuICBcImFjaGlldmVtZW50c1wiOiBbXCJhY2hpZXZlbWVudDFcIiwgXCJhY2hpZXZlbWVudDJcIl1cbn1gO1xuXG4gIGNvbnN0IHVzZXJQcm9tcHQgPSBgVGFyZ2V0IEpvYiBDYXRlZ29yeTogJHtwcm9tcHQuam9iQ2F0ZWdvcnl9XG4ke3Byb21wdC5qb2JUaXRsZSA/IGBTcGVjaWZpYyBKb2IgVGl0bGU6ICR7cHJvbXB0LmpvYlRpdGxlfWAgOiAnJ31cblxuRG9jdW1lbnRzIHRvIGFuYWx5emU6XG4ke3Byb21wdC5kb2N1bWVudHMubWFwKGRvYyA9PiBgXG5Eb2N1bWVudCBUeXBlOiAke2RvYy50eXBlfVxuVGl0bGU6ICR7ZG9jLnRpdGxlfVxuQ29udGVudDogJHtkb2MuY29udGVudH1cbmApLmpvaW4oJ1xcbi0tLVxcbicpfWA7XG5cbiAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICBhbnRocm9waWNfdmVyc2lvbjogXCJiZWRyb2NrLTIwMjMtMDUtMzFcIixcbiAgICBtYXhfdG9rZW5zOiAzMDAwLFxuICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgIG1lc3NhZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIHJvbGU6IFwidXNlclwiLFxuICAgICAgICBjb250ZW50OiB1c2VyUHJvbXB0XG4gICAgICB9XG4gICAgXVxuICB9KTtcblxuICBjb25zdCBjb21tYW5kID0gbmV3IEludm9rZU1vZGVsQ29tbWFuZCh7XG4gICAgbW9kZWxJZDogXCJhbnRocm9waWMuY2xhdWRlLTMtc29ubmV0LTIwMjQwMjI5LXYxOjBcIixcbiAgICBib2R5LFxuICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICBhY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICB9KTtcblxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNsaWVudC5zZW5kKGNvbW1hbmQpO1xuICBjb25zdCByZXNwb25zZUJvZHkgPSBKU09OLnBhcnNlKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShyZXNwb25zZS5ib2R5KSk7XG4gIFxuICByZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZUJvZHkuY29udGVudFswXS50ZXh0KTtcbn0iXX0=