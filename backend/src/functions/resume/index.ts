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
      return { 
        statusCode: 200, 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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
        return await createResume(userId, requestBody);
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
      resumes: result.Items || [],
      total: result.Count || 0,
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

  console.log('Creating resume for userId:', userId, 'jobCategory:', jobCategory);

  try {
    // Get user's documents from database with error handling
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAMES.DOCUMENTS,
      IndexName: 'userId-index', 
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    }));

    console.log('Documents query result count:', result.Count || 0);
    const rawDocuments = result.Items || [];
    
    if (rawDocuments.length === 0) {
      return createErrorResponse(400, 'No documents found for resume generation. Please add some documents first.');
    }

    // Map documents to the expected format
    const documents = rawDocuments.map(doc => ({
      type: doc.type || 'Unknown',
      title: doc.title || 'Untitled',
      content: doc.content || ''
    }));

    console.log('Mapped documents for resume:', documents.length);

    // Generate resume with AI
    const resumeResult = await generateResume({ documents, jobCategory, jobTitle });
    const resumeId = uuidv4();

    const resume = {
      resumeId,
      userId,
      jobCategory,
      jobTitle: jobTitle || '',
      content: resumeResult,
      createdAt: new Date().toISOString(),
    };

    // Save resume to database
    await docClient.send(new PutCommand({
      TableName: TABLE_NAMES.RESUMES,
      Item: resume,
    }));

    console.log('Resume created successfully:', resumeId);
    return createSuccessResponse(resume, 201);
    
  } catch (error) {
    console.error('이력서 생성 실패 - 상세 오류:', error);
    
    // Specific error handling
    if (error instanceof Error) {
      if (error.message.includes('ResourceNotFoundException')) {
        return createErrorResponse(500, 'Database configuration error. Please contact support.');
      }
      if (error.message.includes('AccessDeniedException')) {
        return createErrorResponse(500, 'AI service access denied. Please contact support.');
      }
      if (error.message.includes('ThrottlingException')) {
        return createErrorResponse(429, 'Service temporarily busy. Please try again in a few moments.');
      }
    }
    
    return createErrorResponse(500, '이력서 생성 서비스 일시 중단. 잠시 후 다시 시도해주세요.');
  }
}