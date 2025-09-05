import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { docClient, TABLE_NAMES } from './shared/database';
import { verifyToken } from './shared/auth';
import { generateResume } from './shared/bedrock';
import { createErrorResponse, createSuccessResponse } from './shared/utils';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        body: ''
      };
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
        let requestBody = {};
        if (event.body) {
          try {
            requestBody = JSON.parse(event.body);
          } catch (error) {
            return createErrorResponse(400, 'Invalid JSON in request body');
          }
        }
        return await createResume(userId, requestBody as any);
      default:
        return createErrorResponse(405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Error:', error);
    return createErrorResponse(500, 'Internal server error');
  }
};

interface QueryParams {
  jobCategory?: string;
}

async function getResumes(userId: string, queryParams: QueryParams | null) {
  // Validate userId to prevent injection
  if (!userId || typeof userId !== 'string' || userId.length === 0) {
    return createErrorResponse(400, 'Invalid user ID');
  }

  const jobCategory = queryParams?.jobCategory;

  // Validate jobCategory if provided
  if (jobCategory && (typeof jobCategory !== 'string' || jobCategory.length === 0)) {
    return createErrorResponse(400, 'Invalid job category');
  }

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

  try {
    const result = await docClient.send(queryCommand);
    return createSuccessResponse({
      resumes: (result as any).Items || [],
      total: (result as any).Count || 0,
    });
  } catch (error) {
    console.error('DynamoDB query error:', error);
    return createErrorResponse(500, 'Failed to retrieve resumes');
  }

}

interface CreateResumeRequest {
  documents: Array<{
    type: string;
    title: string;
    content: string;
  }>;
  jobCategory: string;
  jobTitle?: string;
}

async function createResume(userId: string, body: any) {
  // Validate userId to prevent injection
  if (!userId || typeof userId !== 'string' || userId.length === 0) {
    return createErrorResponse(400, 'Invalid user ID');
  }

  const { jobCategory, jobTitle } = body;

  if (!jobCategory || typeof jobCategory !== 'string' || jobCategory.length === 0) {
    return createErrorResponse(400, 'Valid job category is required');
  }

  // Get user's documents from database
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAMES.DOCUMENTS,
    IndexName: 'userId-index', 
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  }));

  const documents = ((result as any).Items || []) as any[];
  
  if (documents.length === 0) {
    return createErrorResponse(400, 'No documents found for resume generation');
  }

  try {
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
  } catch (error) {
    console.error('이력서 생성 실패:', error);
    return createErrorResponse(500, '이력서 생성 서비스 일시 중단. 잠시 후 다시 시도해주세요.');
  }
}