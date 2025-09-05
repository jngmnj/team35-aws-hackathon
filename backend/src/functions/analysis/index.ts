import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { docClient, TABLE_NAMES } from '../../shared/database';
import { verifyToken } from '../../shared/auth';
import { generatePersonalityAnalysis } from '../../shared/bedrock';
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
        return await getAnalysis(userId);
      case 'POST':
        let requestBody = {};
        if (event.body) {
          try {
            requestBody = JSON.parse(event.body);
          } catch (error) {
            return createErrorResponse(400, 'Invalid JSON in request body');
          }
        }
        return await createAnalysis(userId, requestBody);
      default:
        return createErrorResponse(405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Error:', error);
    return createErrorResponse(500, 'Internal server error');
  }
};

async function getAnalysis(userId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAMES.ANALYSIS,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  }));

  return createSuccessResponse({
    analyses: result.Items || [],
    total: result.Count || 0,
  });
}

interface AnalysisRequest {
  documents: Array<{
    type: string;
    title: string;
    content: string;
  }>;
}

async function createAnalysis(userId: string, body: AnalysisRequest) {
  const { documents } = body;

  if (!documents || !Array.isArray(documents)) {
    return createErrorResponse(400, 'Documents array is required');
  }

  if (documents.length === 0) {
    return createErrorResponse(400, 'At least one document is required for analysis');
  }

  // Validate document structure
  for (const doc of documents) {
    if (!doc.type || !doc.title || !doc.content) {
      return createErrorResponse(400, 'Each document must have type, title, and content');
    }
    if (typeof doc.content !== 'string' || doc.content.trim().length === 0) {
      return createErrorResponse(400, 'Document content cannot be empty');
    }
  }

  try {
    const analysisResult = await generatePersonalityAnalysis({ documents });
    const analysisId = uuidv4();

    const analysis = {
      analysisId,
      userId,
      result: analysisResult,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAMES.ANALYSIS,
      Item: analysis,
    }));

    return createSuccessResponse(analysis, 201);
  } catch (error) {
    console.error('AI 분석 실패:', error);
    return createErrorResponse(500, 'AI 분석 서비스 일시 중단. 잠시 후 다시 시도해주세요.');
  }
}