import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
export declare class DatabaseStack extends cdk.Stack {
    readonly usersTable: dynamodb.Table;
    readonly documentsTable: dynamodb.Table;
    readonly analysisTable: dynamodb.Table;
    readonly resumesTable: dynamodb.Table;
    constructor(scope: Construct, id: string, props?: cdk.StackProps);
}
