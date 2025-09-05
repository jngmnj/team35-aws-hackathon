import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../../shared/auth';
import { validateDocumentType, validateDocumentData } from '../../shared/validation';
import { handleDynamoDBError } from '../../shared/error-handler';
import { createErrorResponse, createSuccessResponse } from '../../shared/utils';
import { DocumentType } from '../../types/document';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, If-Match',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    // Verify JWT token using shared utility
    const authResult = verifyToken(event.headers.Authorization || event.headers.authorization);
    if (!authResult.success) {
      return createErrorResponse(401, 'Unauthorized');
    }

    const userId = authResult.userId!;

    const method = event.httpMethod;
    const pathParameters = event.pathParameters;

    let requestBody = {};
    if (event.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (error) {
        return createErrorResponse(400, 'Invalid JSON in request body');
      }
    }

    switch (method) {
      case 'GET':
        if (pathParameters?.id) {
          return await getDocument(pathParameters.id, userId);
        }
        return await getDocuments(userId, event.queryStringParameters);
      case 'POST':
        return await createDocument(userId, requestBody);
      case 'PUT':
        if (!pathParameters?.id) {
          return createErrorResponse(400, 'Document ID is required');
        }
        return await updateDocument(pathParameters.id, requestBody, userId);
      case 'PATCH':
        if (!pathParameters?.id) {
          return createErrorResponse(400, 'Document ID is required');
        }
        return await patchDocument(pathParameters.id, requestBody, userId);
      case 'DELETE':
        if (!pathParameters?.id) {
          return createErrorResponse(400, 'Document ID is required');
        }
        return await deleteDocument(pathParameters.id, userId);
      default:
        return createErrorResponse(405, 'Method not allowed');
    }
  } catch (error: any) {
    console.error('Error:', error);
    
    // Handle DynamoDB specific errors
    if (error.name && error.name.includes('Exception')) {
      const dbError = handleDynamoDBError(error);
      return {
        statusCode: dbError.statusCode,
        headers,
        body: JSON.stringify({ success: false, error: dbError.error }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Internal server error' } }),
    };
  }
};

interface QueryParams {
  type?: string;
}

async function getDocument(documentId: string, userId: string) {
  const document = await docClient.send(new GetCommand({
    TableName: process.env.DOCUMENTS_TABLE_NAME,
    Key: { documentId },
  }));

  if (!document.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Document not found' } }),
    };
  }

  if (document.Item.userId !== userId) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Access denied' } }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      data: document.Item,
    }),
  };
}

async function getDocuments(userId: string, queryParams?: QueryParams) {
  // Validate userId to prevent injection
  if (!userId || typeof userId !== 'string' || userId.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Invalid user ID' } }),
    };
  }

  let keyConditionExpression = 'userId = :userId';
  const expressionAttributeValues: Record<string, string> = {
    ':userId': userId,
  };

  // Add type filter if provided and validated
  if (queryParams?.type && validateDocumentType(queryParams.type)) {
    keyConditionExpression += ' AND #type = :type';
    expressionAttributeValues[':type'] = queryParams.type;
  }

  try {
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
          hasMore: false // TODO: Implement pagination logic
        },
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('DynamoDB query error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Database query failed' } }),
    };
  }
}

interface CreateDocumentRequest {
  type: string;
  title: string;
  content?: string;
}

async function createDocument(userId: string, body: CreateDocumentRequest) {
  // Validate userId to prevent injection
  if (!userId || typeof userId !== 'string' || userId.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Invalid user ID' } }),
    };
  }

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
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  try {
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
  } catch (error) {
    console.error('DynamoDB put error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Failed to create document' } }),
    };
  }
}

interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  type?: string;
}

async function updateDocument(documentId: string, body: UpdateDocumentRequest, userId: string) {
  const { title, content, type } = body;

  if (!documentId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Document ID is required' } }),
    };
  }

  // Check document ownership
  const ownershipCheck = await verifyDocumentOwnership(documentId, userId);
  if (!ownershipCheck.success) {
    return ownershipCheck.response;
  }

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

  const updateExpression: string[] = [];
  const expressionAttributeValues: Record<string, string | number> = {};

  if (title) {
    updateExpression.push('title = :title');
    expressionAttributeValues[':title'] = title;
  }

  if (content) {
    updateExpression.push('content = :content');
    expressionAttributeValues[':content'] = content;
  }

  updateExpression.push('updatedAt = :updatedAt', '#version = #version + :inc');
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();
  expressionAttributeValues[':inc'] = 1;

  const result = await docClient.send(new UpdateCommand({
    TableName: process.env.DOCUMENTS_TABLE_NAME,
    Key: { documentId },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: { '#version': 'version' },
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

interface PatchDocumentRequest {
  title?: string;
  content?: string;
  version?: number;
}

async function patchDocument(documentId: string, body: PatchDocumentRequest, userId: string) {
  const { title, content, version: clientVersion } = body;

  if (!title && !content) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'No fields to update' } }),
    };
  }

  // Check document ownership
  const ownershipCheck = await verifyDocumentOwnership(documentId, userId);
  if (!ownershipCheck.success) {
    return ownershipCheck.response;
  }

  // Get current document for version check
  const currentDoc = await docClient.send(new GetCommand({
    TableName: process.env.DOCUMENTS_TABLE_NAME,
    Key: { documentId },
  }));

  if (!currentDoc.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Document not found' } }),
    };
  }

  // Version conflict check for concurrent editing
  if (clientVersion && currentDoc.Item.version !== clientVersion) {
    return {
      statusCode: 409,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: { 
          message: 'Document has been modified by another user',
          currentVersion: currentDoc.Item.version,
          conflictData: currentDoc.Item
        }
      }),
    };
  }

  const updateExpression: string[] = [];
  const expressionAttributeValues: Record<string, string | number> = {};

  if (title !== undefined) {
    updateExpression.push('title = :title');
    expressionAttributeValues[':title'] = title;
  }

  if (content !== undefined) {
    updateExpression.push('content = :content');
    expressionAttributeValues[':content'] = content;
  }

  updateExpression.push('updatedAt = :updatedAt', '#version = #version + :inc');
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();
  expressionAttributeValues[':inc'] = 1;

  const result = await docClient.send(new UpdateCommand({
    TableName: process.env.DOCUMENTS_TABLE_NAME,
    Key: { documentId },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: { '#version': 'version' },
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

async function deleteDocument(documentId: string, userId: string) {
  if (!documentId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Document ID is required' } }),
    };
  }

  // Check document ownership
  const ownershipCheck = await verifyDocumentOwnership(documentId, userId);
  if (!ownershipCheck.success) {
    return ownershipCheck.response;
  }

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

async function verifyDocumentOwnership(documentId: string, userId: string) {
  const document = await docClient.send(new GetCommand({
    TableName: process.env.DOCUMENTS_TABLE_NAME,
    Key: { documentId },
  }));

  if (!document.Item) {
    return {
      success: false,
      response: {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, error: { message: 'Document not found' } }),
      }
    };
  }

  if (document.Item.userId !== userId) {
    return {
      success: false,
      response: {
        statusCode: 403,
        headers,
        body: JSON.stringify({ success: false, error: { message: 'Access denied: You can only modify your own documents' } }),
      }
    };
  }

  return { success: true, document: document.Item };
}

