import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DatabaseStack extends cdk.Stack {
  public readonly usersTable: dynamodb.Table;
  public readonly documentsTable: dynamodb.Table;
  public readonly analysisTable: dynamodb.Table;
  public readonly resumesTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Users table
    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'users',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Documents table
    this.documentsTable = new dynamodb.Table(this, 'DocumentsTable', {
      tableName: 'documents',
      partitionKey: { name: 'documentId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
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
      removalPolicy: cdk.RemovalPolicy.DESTROY,
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
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.resumesTable.addGlobalSecondaryIndex({
      indexName: 'userId-jobCategory-index',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'jobCategory', type: dynamodb.AttributeType.STRING },
    });
  }
}