import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { docClient, TABLE_NAMES } from '../../shared/database';
import { verifyToken } from '../../shared/auth';
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
    const pathParameters = event.pathParameters;

    switch (method) {
      case 'GET':
        return await getDocuments(userId);
      case 'POST':
        return await createDocument(userId, JSON.parse(event.body || '{}'));
      case 'PUT':
        return await updateDocument(pathParameters?.id!, JSON.parse(event.body || '{}'));
      case 'DELETE':
        return await deleteDocument(pathParameters?.id!);
      default:
        return createErrorResponse(405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Error:', error);
    return createErrorResponse(500, 'Internal server error');
  }
};

async function getDocuments(userId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAMES.DOCUMENTS,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  }));

  return createSuccessResponse({
    documents: result.Items || [],
    total: result.Count || 0,
  });
}

async function createDocument(userId: string, body: any) {
  const { type, title, content } = body;
  const documentId = uuidv4();

  const document = {
    documentId,
    userId,
    type,
    title,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAMES.DOCUMENTS,
    Item: document,
  }));

  return createSuccessResponse(document, 201);
}

async function updateDocument(documentId: string, body: any) {
  const { title, content } = body;

  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAMES.DOCUMENTS,
    Key: { documentId },
    UpdateExpression: 'SET title = :title, content = :content, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':title': title,
      ':content': content,
      ':updatedAt': new Date().toISOString(),
    },
  }));

  return createSuccessResponse({ message: 'Document updated successfully' });
}

async function deleteDocument(documentId: string) {
  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAMES.DOCUMENTS,
    Key: { documentId },
  }));

  return createSuccessResponse({ message: 'Document deleted successfully' });
}