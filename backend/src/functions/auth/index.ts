import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import * as bcrypt from 'bcryptjs';
import { generateToken } from './shared/jwt';
import { v4 as uuidv4 } from 'uuid';
import { docClient, TABLE_NAMES } from './shared/database';
import { createErrorResponse, createSuccessResponse } from './shared/utils';
import { validateEmail } from './shared/validation';
import { handleDynamoDBError } from './shared/error-handler';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const path = event.path;
    const method = event.httpMethod;

    if (method === 'OPTIONS') {
      return { statusCode: 200, headers: {}, body: '' };
    }

    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (error) {
        return createErrorResponse(400, 'Invalid JSON in request body');
      }
    }

    if (path.endsWith('/register')) {
      return await handleRegister(body as RegisterRequest);
    } else if (path.endsWith('/login')) {
      return await handleLogin(body as LoginRequest);
    }

    return createErrorResponse(404, 'Not found');
  } catch (error: any) {
    console.error('Error:', error);
    
    // Handle DynamoDB specific errors
    if (error.name && error.name.includes('Exception')) {
      const dbError = handleDynamoDBError(error);
      return {
        statusCode: dbError.statusCode,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: dbError.error }),
      };
    }

    return createErrorResponse(500, 'Internal server error');
  }
};

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

async function handleRegister(body: RegisterRequest) {
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return createErrorResponse(400, 'Missing required fields');
  }

  if (!validateEmail(email)) {
    return createErrorResponse(400, 'Invalid email format');
  }

  if (password.length < 6) {
    return createErrorResponse(400, 'Password must be at least 6 characters');
  }

  const existingUser = await docClient.send(new GetCommand({
    TableName: TABLE_NAMES.USERS,
    Key: { userId: email },
  }));

  if (existingUser.Item) {
    return createErrorResponse(400, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await docClient.send(new PutCommand({
    TableName: TABLE_NAMES.USERS,
    Item: {
      userId: email,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }));

  const token = generateToken({ userId: email, email });

  return createSuccessResponse({ userId: email, email, name, token }, 201);
}

interface LoginRequest {
  email: string;
  password: string;
}

async function handleLogin(body: LoginRequest) {
  const { email, password } = body;

  if (!email || !password) {
    return createErrorResponse(400, 'Email and password are required');
  }

  if (!validateEmail(email)) {
    return createErrorResponse(400, 'Invalid email format');
  }

  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAMES.USERS,
    Key: { userId: email },
  }));

  if (!result.Item) {
    return createErrorResponse(401, 'Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, result.Item.password);
  if (!isValid) {
    return createErrorResponse(401, 'Invalid credentials');
  }

  const token = generateToken({ 
    userId: result.Item.userId, 
    email: result.Item.email 
  });

  return createSuccessResponse({
    userId: result.Item.userId,
    email: result.Item.email,
    name: result.Item.name,
    token,
  });
}