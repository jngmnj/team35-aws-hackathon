#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

// Database Stack
const databaseStack = new DatabaseStack(app, 'ResumeGeneratorDatabaseStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// API Stack
const apiStack = new ApiStack(app, 'ResumeGeneratorApiStack', {
  usersTable: databaseStack.usersTable,
  documentsTable: databaseStack.documentsTable,
  analysisTable: databaseStack.analysisTable,
  resumesTable: databaseStack.resumesTable,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

apiStack.addDependency(databaseStack);