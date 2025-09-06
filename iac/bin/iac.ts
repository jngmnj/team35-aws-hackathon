#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MainStack } from '../lib/main-stack';
import { DomainStack } from '../lib/domain-stack';

const app = new cdk.App();

// 도메인 이름 설정 (원하는 도메인으로 변경)
const domainName = 'growlog.net';

new MainStack(app, 'AiResumeStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
});

new DomainStack(app, 'DomainStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
  domainName: domainName,
});