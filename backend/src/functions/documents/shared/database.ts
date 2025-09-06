import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

export const TABLE_NAMES = {
  USERS: process.env.USERS_TABLE_NAME || 'users',
  DOCUMENTS: process.env.DOCUMENTS_TABLE_NAME || 'documents',
  ANALYSIS: process.env.ANALYSIS_TABLE_NAME || 'analysis',
  RESUMES: process.env.RESUMES_TABLE_NAME || 'resumes',
};