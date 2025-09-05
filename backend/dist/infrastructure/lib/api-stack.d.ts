import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
interface ApiStackProps extends cdk.StackProps {
    usersTable: dynamodb.Table;
    documentsTable: dynamodb.Table;
    analysisTable: dynamodb.Table;
    resumesTable: dynamodb.Table;
}
export declare class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps);
}
export {};
