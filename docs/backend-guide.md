# Backend Development Guide

## Project Structure
```
backend/
├── infrastructure/          # AWS CDK code
│   ├── lib/
│   │   ├── database-stack.ts
│   │   ├── api-stack.ts
│   │   ├── auth-stack.ts
│   │   └── ai-stack.ts
│   ├── bin/
│   │   └── app.ts
│   └── cdk.json
├── src/
│   ├── functions/          # Lambda functions
│   │   ├── auth/
│   │   ├── documents/
│   │   ├── analysis/
│   │   └── resume/
│   ├── shared/             # Shared utilities
│   │   ├── database.ts
│   │   ├── auth.ts
│   │   ├── bedrock.ts
│   │   └── utils.ts
│   └── types/              # TypeScript types
├── tests/                  # Unit and integration tests
└── package.json
```

## AWS CDK Infrastructure

### Database Stack
```typescript
// infrastructure/lib/database-stack.ts
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DatabaseStack extends Stack {
  public readonly usersTable: dynamodb.Table;
  public readonly documentsTable: dynamodb.Table;
  public readonly analysisTable: dynamodb.Table;
  public readonly resumesTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Users table
    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'users',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Documents table
    this.documentsTable = new dynamodb.Table(this, 'DocumentsTable', {
      tableName: 'documents',
      partitionKey: { name: 'documentId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Add GSI for userId
    this.documentsTable.addGlobalSecondaryIndex({
      indexName: 'userId-index',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    });

    // Analysis table
    this.analysisTable = new dynamodb.Table(this, 'AnalysisTable', {
      tableName: 'analysis',
      partitionKey: { name: 'analysisId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.analysisTable.addGlobalSecondaryIndex({
      indexName: 'userId-index',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    });

    // Resumes table
    this.resumesTable = new dynamodb.Table(this, 'ResumesTable', {
      tableName: 'resumes',
      partitionKey: { name: 'resumeId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.resumesTable.addGlobalSecondaryIndex({
      indexName: 'userId-jobCategory-index',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'jobCategory', type: dynamodb.AttributeType.STRING },
    });
  }
}
```

### API Stack
```typescript
// infrastructure/lib/api-stack.ts
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'ResumeGeneratorApi', {
      restApiName: 'Resume Generator API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Lambda functions
    const authFunction = new lambda.Function(this, 'AuthFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/functions/auth'),
      environment: {
        USERS_TABLE_NAME: props.usersTable.tableName,
        JWT_SECRET: 'your-jwt-secret', // Use AWS Secrets Manager in production
      },
    });

    const documentsFunction = new lambda.Function(this, 'DocumentsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/functions/documents'),
      environment: {
        DOCUMENTS_TABLE_NAME: props.documentsTable.tableName,
      },
    });

    // Grant permissions
    props.usersTable.grantReadWriteData(authFunction);
    props.documentsTable.grantReadWriteData(documentsFunction);

    // API routes
    const auth = api.root.addResource('auth');
    auth.addResource('register').addMethod('POST', new apigateway.LambdaIntegration(authFunction));
    auth.addResource('login').addMethod('POST', new apigateway.LambdaIntegration(authFunction));

    const documents = api.root.addResource('documents');
    documents.addMethod('GET', new apigateway.LambdaIntegration(documentsFunction));
    documents.addMethod('POST', new apigateway.LambdaIntegration(documentsFunction));
    documents.addResource('{id}').addMethod('PUT', new apigateway.LambdaIntegration(documentsFunction));
    documents.addResource('{id}').addMethod('DELETE', new apigateway.LambdaIntegration(documentsFunction));
  }
}
```

## Lambda Functions

### Authentication Function
```typescript
// src/functions/auth/index.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const path = event.path;
    const method = event.httpMethod;

    if (method === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    const body = JSON.parse(event.body || '{}');

    if (path.endsWith('/register')) {
      return await handleRegister(body);
    } else if (path.endsWith('/login')) {
      return await handleLogin(body);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Not found' } }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Internal server error' } }),
    };
  }
};

async function handleRegister(body: any) {
  const { email, password, name } = body;

  // Validate input
  if (!email || !password || !name) {
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({ success: false, error: { message: 'Missing required fields' } }),
    };
  }

  // Check if user exists
  const existingUser = await docClient.send(new GetCommand({
    TableName: process.env.USERS_TABLE_NAME,
    Key: { userId: email }, // Using email as userId for simplicity
  }));

  if (existingUser.Item) {
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({ success: false, error: { message: 'User already exists' } }),
    };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  // Create user
  await docClient.send(new PutCommand({
    TableName: process.env.USERS_TABLE_NAME,
    Item: {
      userId,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }));

  // Generate JWT
  const token = jwt.sign({ userId, email }, process.env.JWT_SECRET!, { expiresIn: '24h' });

  return {
    statusCode: 201,
    headers: getHeaders(),
    body: JSON.stringify({
      success: true,
      data: { userId, email, name, token },
    }),
  };
}

async function handleLogin(body: any) {
  const { email, password } = body;

  // Get user
  const result = await docClient.send(new GetCommand({
    TableName: process.env.USERS_TABLE_NAME,
    Key: { userId: email },
  }));

  if (!result.Item) {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({ success: false, error: { message: 'Invalid credentials' } }),
    };
  }

  // Verify password
  const isValid = await bcrypt.compare(password, result.Item.password);
  if (!isValid) {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({ success: false, error: { message: 'Invalid credentials' } }),
    };
  }

  // Generate JWT
  const token = jwt.sign(
    { userId: result.Item.userId, email: result.Item.email },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  return {
    statusCode: 200,
    headers: getHeaders(),
    body: JSON.stringify({
      success: true,
      data: {
        userId: result.Item.userId,
        email: result.Item.email,
        name: result.Item.name,
        token,
      },
    }),
  };
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
```

### Documents Function
```typescript
// src/functions/documents/index.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { verifyToken } from '../../shared/auth';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    // Verify authentication
    const authResult = verifyToken(event.headers.Authorization || event.headers.authorization);
    if (!authResult.success) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, error: { message: 'Unauthorized' } }),
      };
    }

    const userId = authResult.userId;
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

async function getDocuments(userId: string, queryParams: any) {
  const result = await docClient.send(new QueryCommand({
    TableName: process.env.DOCUMENTS_TABLE_NAME,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  }));

  return {
    statusCode: 200,
    headers: getHeaders(),
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
    TableName: process.env.DOCUMENTS_TABLE_NAME,
    Item: document,
  }));

  return {
    statusCode: 201,
    headers: getHeaders(),
    body: JSON.stringify({
      success: true,
      data: document,
    }),
  };
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
```

## AWS Bedrock Integration

### Bedrock Client
```typescript
// src/shared/bedrock.ts
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: 'us-east-1' });

export interface AnalysisPrompt {
  documents: Array<{
    type: string;
    title: string;
    content: string;
  }>;
}

export interface ResumePrompt {
  documents: Array<{
    type: string;
    title: string;
    content: string;
  }>;
  jobCategory: string;
  jobTitle?: string;
}

export async function generatePersonalityAnalysis(prompt: AnalysisPrompt): Promise<any> {
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

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    body,
    contentType: "application/json",
    accept: "application/json",
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  
  return JSON.parse(responseBody.content[0].text);
}

export async function generateResume(prompt: ResumePrompt): Promise<any> {
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

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    body,
    contentType: "application/json",
    accept: "application/json",
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  
  return JSON.parse(responseBody.content[0].text);
}
```

## Shared Utilities

### Authentication Utility
```typescript
// src/shared/auth.ts
import * as jwt from 'jsonwebtoken';

export interface AuthResult {
  success: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

export function verifyToken(authHeader?: string): AuthResult {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return {
      success: true,
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}
```

## Deployment Commands

### CDK Deployment
```bash
# Install dependencies
npm install

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy all stacks
cdk deploy --all

# Deploy specific stack
cdk deploy DatabaseStack
cdk deploy ApiStack

# Destroy all resources (cleanup)
cdk destroy --all
```

### Environment Variables
```bash
# .env file for local development
JWT_SECRET=your-super-secret-jwt-key
AWS_REGION=us-east-1
USERS_TABLE_NAME=users
DOCUMENTS_TABLE_NAME=documents
ANALYSIS_TABLE_NAME=analysis
RESUMES_TABLE_NAME=resumes
```