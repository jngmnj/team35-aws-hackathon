import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

export class DomainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps & { domainName: string }) {
    super(scope, id, props);

    const domainName = props?.domainName || 'your-domain.com';

    // 1. 도메인 구매 (수동으로 AWS Console에서 구매 필요)
    // Route53 > Registered domains > Register domain

    // 2. 외부 도메인용 - Hosted Zone 생성하지 않음 (kro.kr은 외부 관리)

    // 3. S3 버킷 (프론트엔드 호스팅)
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `growlog-kro-kr-website`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 4. SSL 인증서 (외부 도메인용 - DNS 검증 사용 불가)
    // 수동으로 ACM에서 인증서 생성 후 ARN 입력 필요
    // const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', 'arn:aws:acm:...');

    // 5. CloudFront 배포
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      // domainNames: [domainName, `www.${domainName}`],
      // certificate: certificate,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // 6. DNS 레코드 (외부 도메인이므로 수동 CNAME 설정 필요)
    // kro.kr 사이트에서 CNAME 레코드 설정:
    // growlog.kro.kr -> CloudFront 도메인

    // Outputs
    new cdk.CfnOutput(this, 'DomainName', {
      value: domainName,
      description: 'Domain Name',
    });

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution URL',
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 Bucket Name',
    });

    new cdk.CfnOutput(this, 'CNAMETarget', {
      value: distribution.distributionDomainName,
      description: 'CNAME Target for growlog.kro.kr',
    });
  }
}