import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
export declare const docClient: DynamoDBDocumentClient;
export declare const TABLE_NAMES: {
    USERS: string;
    DOCUMENTS: string;
    ANALYSIS: string;
    RESUMES: string;
};
