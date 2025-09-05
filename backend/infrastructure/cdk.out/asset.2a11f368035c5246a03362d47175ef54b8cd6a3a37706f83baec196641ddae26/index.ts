import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { docClient, TABLE_NAMES } from '../../shared/database';
import { verifyToken } from '../../shared/auth';
import { generateResume } from '../../shared/bedrock';
import { createErrorResponse, createSuccessResponse } from '../../shared/utils';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: {}, body: '' };
    }

    const authResult = verifyToken(event.headers.Authorization || event.headers.authorization);
    if (!authResult.success) {
      return createErrorResponse(401, 'Unauthorized');
    }

    const userId = authResult.userId!;
    const method = event.httpMethod;

    switch (method) {
      case 'GET':
        return await getResumes(userId, event.queryStringParameters);
      case 'POST':
        return await createResume(userId, JSON.parse(event.body || '{}'));
      default:
        return createErrorResponse(405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Error:', error);
    return createErrorResponse(500, 'Internal server error');
  }
};

async function getResumes(userId: string, queryParams: any) {
  const jobCategory = queryParams?.jobCategory;

  let queryCommand;
  if (jobCategory) {
    queryCommand = new QueryCommand({
      TableName: TABLE_NAMES.RESUMES,
      IndexName: 'userId-jobCategory-index',
      KeyConditionExpression: 'userId = :userId AND jobCategory = :jobCategory',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':jobCategory': jobCategory,
      },
    });
  } else {
    queryCommand = new QueryCommand({
      TableName: TABLE_NAMES.RESUMES,
      IndexName: 'userId-jobCategory-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });
  }

  const result = await docClient.send(queryCommand);

  return createSuccessResponse({
    resumes: result.Items || [],
    total: result.Count || 0,
  });
}

async function createResume(userId: string, body: any) {
  const { documents, jobCategory, jobTitle } = body;

  if (!documents || !Array.isArray(documents)) {
    return createErrorResponse(400, 'Documents array is required');
  }

  if (!jobCategory) {
    return createErrorResponse(400, 'Job category is required');
  }

  const resumeResult = await generateResume({ documents, jobCategory, jobTitle });
  const resumeId = uuidv4();

  const resume = {
    resumeId,
    userId,
    jobCategory,
    jobTitle,
    content: resumeResult,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAMES.RESUMES,
    Item: resume,
  }));

  return createSuccessResponse(resume, 201);
}