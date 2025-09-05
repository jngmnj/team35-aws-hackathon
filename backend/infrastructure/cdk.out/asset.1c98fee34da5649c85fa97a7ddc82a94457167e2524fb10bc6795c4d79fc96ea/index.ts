import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { docClient, TABLE_NAMES } from '../../shared/database';
import { createErrorResponse, createSuccessResponse } from '../../shared/utils';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const path = event.path;
    const method = event.httpMethod;

    if (method === 'OPTIONS') {
      return { statusCode: 200, headers: {}, body: '' };
    }

    const body = JSON.parse(event.body || '{}');

    if (path.endsWith('/register')) {
      return await handleRegister(body);
    } else if (path.endsWith('/login')) {
      return await handleLogin(body);
    }

    return createErrorResponse(404, 'Not found');
  } catch (error) {
    console.error('Error:', error);
    return createErrorResponse(500, 'Internal server error');
  }
};

async function handleRegister(body: any) {
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return createErrorResponse(400, 'Missing required fields');
  }

  const existingUser = await docClient.send(new GetCommand({
    TableName: TABLE_NAMES.USERS,
    Key: { userId: email },
  }));

  if (existingUser.Item) {
    return createErrorResponse(400, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  await docClient.send(new PutCommand({
    TableName: TABLE_NAMES.USERS,
    Item: {
      userId,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }));

  const token = jwt.sign({ userId, email }, process.env.JWT_SECRET!, { expiresIn: '24h' });

  return createSuccessResponse({ userId, email, name, token }, 201);
}

async function handleLogin(body: any) {
  const { email, password } = body;

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

  const token = jwt.sign(
    { userId: result.Item.userId, email: result.Item.email },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  return createSuccessResponse({
    userId: result.Item.userId,
    email: result.Item.email,
    name: result.Item.name,
    token,
  });
}