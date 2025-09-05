import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../../shared/auth';
import { validateDocumentType, validateDocumentData } from '../../shared/validation';
import { DocumentType } from '../../types/document';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    // Verify JWT token using shared utility
    const authResult = verifyToken(event.headers.Authorization || event.headers.authorization);
    if (!authResult.success) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, error: { message: 'Unauthorized' } }),
      };
    }

    const userId = authResult.userId!;

    const method = event.httpMethod;
    const pathParameters = event.pathParameters;

    switch (method) {
      case 'GET':
        return await getDocuments(userId, event.queryStringParameters);
      case 'POST':
        return await createDocument(userId, JSON.parse(event.body || '{}'));
      case 'PUT':
        return await updateDocument(pathParameters?.id!, JSON.parse(event.body || '{}'));
      case 'DELETE':
        return await deleteDocument(pathParameters?.id!);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ success: false, error: { message: 'Method not allowed' } }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Internal server error' } }),
    };
  }
};

async function getDocuments(userId: string, queryParams?: any) {
  let keyConditionExpression = 'userId = :userId';
  const expressionAttributeValues: any = {
    ':userId': userId,
  };

  // Add type filter if provided
  if (queryParams?.type && validateDocumentType(queryParams.type)) {
    keyConditionExpression += ' AND #type = :type';
    expressionAttributeValues[':type'] = queryParams.type;
  }

  const result = await docClient.send(new QueryCommand({
    TableName: process.env.DOCUMENTS_TABLE_NAME,
    IndexName: 'userId-index',
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeNames: queryParams?.type ? { '#type': 'type' } : undefined,
    ExpressionAttributeValues: expressionAttributeValues,
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      data: {
        documents: result.Items || [],
        total: result.Count || 0,
      },
    }),
  };
}

async function createDocument(userId: string, body: any) {
  const { type, title, content } = body;

  if (!type || !title) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Missing required fields' } }),
    };
  }

  if (!validateDocumentType(type)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Invalid document type' } }),
    };
  }

  const validation = validateDocumentData(type as DocumentType, title, content);
  if (!validation.isValid) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Validation failed', details: validation.errors } }),
    };
  }

  const documentId = uuidv4();
  const now = new Date().toISOString();

  const document = {
    documentId,
    userId,
    type,
    title,
    content: content || '',
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: process.env.DOCUMENTS_TABLE_NAME,
    Item: document,
  }));

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      success: true,
      data: document,
    }),
  };
}

async function updateDocument(documentId: string, body: any) {
  const { title, content, type } = body;

  if (!title && !content) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'No fields to update' } }),
    };
  }

  // If type is provided, validate the document data
  if (type && title) {
    if (!validateDocumentType(type)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: { message: 'Invalid document type' } }),
      };
    }

    const validation = validateDocumentData(type as DocumentType, title, content);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: { message: 'Validation failed', details: validation.errors } }),
      };
    }
  }

  const updateExpression = [];
  const expressionAttributeValues: any = {};

  if (title) {
    updateExpression.push('title = :title');
    expressionAttributeValues[':title'] = title;
  }

  if (content) {
    updateExpression.push('content = :content');
    expressionAttributeValues[':content'] = content;
  }

  updateExpression.push('updatedAt = :updatedAt');
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  const result = await docClient.send(new UpdateCommand({
    TableName: process.env.DOCUMENTS_TABLE_NAME,
    Key: { documentId },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      data: result.Attributes,
    }),
  };
}

async function deleteDocument(documentId: string) {
  await docClient.send(new DeleteCommand({
    TableName: process.env.DOCUMENTS_TABLE_NAME,
    Key: { documentId },
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Document deleted successfully',
    }),
  };
}

