#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

const databaseStack = new DatabaseStack(app, 'DatabaseStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new ApiStack(app, 'ApiStack', {
  usersTable: databaseStack.usersTable,
  documentsTable: databaseStack.documentsTable,
  analysisTable: databaseStack.analysisTable,
  resumesTable: databaseStack.resumesTable,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});