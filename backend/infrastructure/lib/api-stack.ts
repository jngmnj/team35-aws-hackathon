import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
  usersTable: dynamodb.Table;
  documentsTable: dynamodb.Table;
  analysisTable: dynamodb.Table;
  resumesTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
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
      code: lambda.Code.fromAsset('../src/functions/auth'),
      environment: {
        USERS_TABLE_NAME: props.usersTable.tableName,
        JWT_SECRET: 'your-jwt-secret', // Use AWS Secrets Manager in production
      },
    });

    const documentsFunction = new lambda.Function(this, 'DocumentsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../src/functions/documents'),
      environment: {
        DOCUMENTS_TABLE_NAME: props.documentsTable.tableName,
        JWT_SECRET: 'your-jwt-secret',
      },
    });

    const analysisFunction = new lambda.Function(this, 'AnalysisFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../src/functions/analysis'),
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
      environment: {
        ANALYSIS_TABLE_NAME: props.analysisTable.tableName,
        DOCUMENTS_TABLE_NAME: props.documentsTable.tableName,
        JWT_SECRET: 'your-jwt-secret',
        BEDROCK_REGION: this.region,
      },
    });

    const resumeFunction = new lambda.Function(this, 'ResumeFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../src/functions/resume'),
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
      environment: {
        RESUMES_TABLE_NAME: props.resumesTable.tableName,
        DOCUMENTS_TABLE_NAME: props.documentsTable.tableName,
        JWT_SECRET: 'your-jwt-secret',
        BEDROCK_REGION: this.region,
      },
    });

    // Grant permissions
    props.usersTable.grantReadWriteData(authFunction);
    props.documentsTable.grantReadWriteData(documentsFunction);
    props.analysisTable.grantReadWriteData(analysisFunction);
    props.documentsTable.grantReadData(analysisFunction); // Analysis needs to read documents
    props.resumesTable.grantReadWriteData(resumeFunction);
    props.documentsTable.grantReadData(resumeFunction); // Resume needs to read documents
    
    // Grant Bedrock permissions
    const bedrockPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream'
      ],
      resources: [
        `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0`,
        `arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0`
      ]
    });
    
    analysisFunction.addToRolePolicy(bedrockPolicy);
    resumeFunction.addToRolePolicy(bedrockPolicy);

    // API routes
    const auth = api.root.addResource('auth');
    auth.addResource('register').addMethod('POST', new apigateway.LambdaIntegration(authFunction));
    auth.addResource('login').addMethod('POST', new apigateway.LambdaIntegration(authFunction));

    const documents = api.root.addResource('documents');
    documents.addMethod('GET', new apigateway.LambdaIntegration(documentsFunction));
    documents.addMethod('POST', new apigateway.LambdaIntegration(documentsFunction));
    const documentById = documents.addResource('{id}');
    documentById.addMethod('PUT', new apigateway.LambdaIntegration(documentsFunction));
    documentById.addMethod('DELETE', new apigateway.LambdaIntegration(documentsFunction));

    const analysis = api.root.addResource('analysis');
    analysis.addMethod('GET', new apigateway.LambdaIntegration(analysisFunction));
    analysis.addMethod('POST', new apigateway.LambdaIntegration(analysisFunction));

    const resume = api.root.addResource('resume');
    resume.addMethod('GET', new apigateway.LambdaIntegration(resumeFunction));
    resume.addMethod('POST', new apigateway.LambdaIntegration(resumeFunction));
  }
}