import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
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
      environment: {
        ANALYSIS_TABLE_NAME: props.analysisTable.tableName,
        JWT_SECRET: 'your-jwt-secret',
      },
    });

    const resumeFunction = new lambda.Function(this, 'ResumeFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../src/functions/resume'),
      environment: {
        RESUMES_TABLE_NAME: props.resumesTable.tableName,
        JWT_SECRET: 'your-jwt-secret',
      },
    });

    // Grant permissions
    props.usersTable.grantReadWriteData(authFunction);
    props.documentsTable.grantReadWriteData(documentsFunction);
    props.analysisTable.grantReadWriteData(analysisFunction);
    props.resumesTable.grantReadWriteData(resumeFunction);

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