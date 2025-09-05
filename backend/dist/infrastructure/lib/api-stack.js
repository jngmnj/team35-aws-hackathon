"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
class ApiStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.ApiStack = ApiStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vaW5mcmFzdHJ1Y3R1cmUvbGliL2FwaS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsdUVBQXlEO0FBQ3pELCtEQUFpRDtBQUVqRCx5REFBMkM7QUFVM0MsTUFBYSxRQUFTLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDckMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFvQjtRQUM1RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixxQkFBcUI7UUFDckIsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUM3RCxXQUFXLEVBQUUsc0JBQXNCO1lBQ25DLDJCQUEyQixFQUFFO2dCQUMzQixZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXO2dCQUN6QyxZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXO2dCQUN6QyxZQUFZLEVBQUUsQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDO2FBQ2hEO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsbUJBQW1CO1FBQ25CLE1BQU0sWUFBWSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQzdELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLGVBQWU7WUFDeEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDO1lBQ3BELFdBQVcsRUFBRTtnQkFDWCxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVM7Z0JBQzVDLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSx3Q0FB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Q2xELFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUM5RSxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFFL0UsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUMxRSxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQzdFLENBQUM7Q0FDRjtBQTNHRCw0QkEyR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmludGVyZmFjZSBBcGlTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICB1c2Vyc1RhYmxlOiBkeW5hbW9kYi5UYWJsZTtcbiAgZG9jdW1lbnRzVGFibGU6IGR5bmFtb2RiLlRhYmxlO1xuICBhbmFseXNpc1RhYmxlOiBkeW5hbW9kYi5UYWJsZTtcbiAgcmVzdW1lc1RhYmxlOiBkeW5hbW9kYi5UYWJsZTtcbn1cblxuZXhwb3J0IGNsYXNzIEFwaVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEFwaVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIENyZWF0ZSBBUEkgR2F0ZXdheVxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ1Jlc3VtZUdlbmVyYXRvckFwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnUmVzdW1lIEdlbmVyYXRvciBBUEknLFxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxuICAgICAgICBhbGxvd01ldGhvZHM6IGFwaWdhdGV3YXkuQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZScsICdBdXRob3JpemF0aW9uJ10sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uc1xuICAgIGNvbnN0IGF1dGhGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0F1dGhGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9zcmMvZnVuY3Rpb25zL2F1dGgnKSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFVTRVJTX1RBQkxFX05BTUU6IHByb3BzLnVzZXJzVGFibGUudGFibGVOYW1lLFxuICAgICAgICBKV1RfU0VDUkVUOiAneW91ci1qd3Qtc2VjcmV0JywgLy8gVXNlIEFXUyBTZWNyZXRzIE1hbmFnZXIgaW4gcHJvZHVjdGlvblxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGRvY3VtZW50c0Z1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnRG9jdW1lbnRzRnVuY3Rpb24nLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vc3JjL2Z1bmN0aW9ucy9kb2N1bWVudHMnKSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIERPQ1VNRU5UU19UQUJMRV9OQU1FOiBwcm9wcy5kb2N1bWVudHNUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIEpXVF9TRUNSRVQ6ICd5b3VyLWp3dC1zZWNyZXQnLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFuYWx5c2lzRnVuY3Rpb24gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdBbmFseXNpc0Z1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL3NyYy9mdW5jdGlvbnMvYW5hbHlzaXMnKSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQU5BTFlTSVNfVEFCTEVfTkFNRTogcHJvcHMuYW5hbHlzaXNUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIERPQ1VNRU5UU19UQUJMRV9OQU1FOiBwcm9wcy5kb2N1bWVudHNUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIEpXVF9TRUNSRVQ6ICd5b3VyLWp3dC1zZWNyZXQnLFxuICAgICAgICBCRURST0NLX1JFR0lPTjogdGhpcy5yZWdpb24sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzdW1lRnVuY3Rpb24gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdSZXN1bWVGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9zcmMvZnVuY3Rpb25zL3Jlc3VtZScpLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBSRVNVTUVTX1RBQkxFX05BTUU6IHByb3BzLnJlc3VtZXNUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIERPQ1VNRU5UU19UQUJMRV9OQU1FOiBwcm9wcy5kb2N1bWVudHNUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIEpXVF9TRUNSRVQ6ICd5b3VyLWp3dC1zZWNyZXQnLFxuICAgICAgICBCRURST0NLX1JFR0lPTjogdGhpcy5yZWdpb24sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gR3JhbnQgcGVybWlzc2lvbnNcbiAgICBwcm9wcy51c2Vyc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShhdXRoRnVuY3Rpb24pO1xuICAgIHByb3BzLmRvY3VtZW50c1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShkb2N1bWVudHNGdW5jdGlvbik7XG4gICAgcHJvcHMuYW5hbHlzaXNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoYW5hbHlzaXNGdW5jdGlvbik7XG4gICAgcHJvcHMuZG9jdW1lbnRzVGFibGUuZ3JhbnRSZWFkRGF0YShhbmFseXNpc0Z1bmN0aW9uKTsgLy8gQW5hbHlzaXMgbmVlZHMgdG8gcmVhZCBkb2N1bWVudHNcbiAgICBwcm9wcy5yZXN1bWVzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHJlc3VtZUZ1bmN0aW9uKTtcbiAgICBwcm9wcy5kb2N1bWVudHNUYWJsZS5ncmFudFJlYWREYXRhKHJlc3VtZUZ1bmN0aW9uKTsgLy8gUmVzdW1lIG5lZWRzIHRvIHJlYWQgZG9jdW1lbnRzXG4gICAgXG4gICAgLy8gR3JhbnQgQmVkcm9jayBwZXJtaXNzaW9uc1xuICAgIGNvbnN0IGJlZHJvY2tQb2xpY3kgPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdiZWRyb2NrOkludm9rZU1vZGVsJyxcbiAgICAgICAgJ2JlZHJvY2s6SW52b2tlTW9kZWxXaXRoUmVzcG9uc2VTdHJlYW0nXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgIGBhcm46YXdzOmJlZHJvY2s6JHt0aGlzLnJlZ2lvbn06OmZvdW5kYXRpb24tbW9kZWwvYW50aHJvcGljLmNsYXVkZS0zLXNvbm5ldC0yMDI0MDIyOS12MTowYCxcbiAgICAgICAgYGFybjphd3M6YmVkcm9jazp1cy1lYXN0LTE6OmZvdW5kYXRpb24tbW9kZWwvYW50aHJvcGljLmNsYXVkZS0zLXNvbm5ldC0yMDI0MDIyOS12MTowYFxuICAgICAgXVxuICAgIH0pO1xuICAgIFxuICAgIGFuYWx5c2lzRnVuY3Rpb24uYWRkVG9Sb2xlUG9saWN5KGJlZHJvY2tQb2xpY3kpO1xuICAgIHJlc3VtZUZ1bmN0aW9uLmFkZFRvUm9sZVBvbGljeShiZWRyb2NrUG9saWN5KTtcblxuICAgIC8vIEFQSSByb3V0ZXNcbiAgICBjb25zdCBhdXRoID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2F1dGgnKTtcbiAgICBhdXRoLmFkZFJlc291cmNlKCdyZWdpc3RlcicpLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGF1dGhGdW5jdGlvbikpO1xuICAgIGF1dGguYWRkUmVzb3VyY2UoJ2xvZ2luJykuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oYXV0aEZ1bmN0aW9uKSk7XG5cbiAgICBjb25zdCBkb2N1bWVudHMgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgnZG9jdW1lbnRzJyk7XG4gICAgZG9jdW1lbnRzLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZG9jdW1lbnRzRnVuY3Rpb24pKTtcbiAgICBkb2N1bWVudHMuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZG9jdW1lbnRzRnVuY3Rpb24pKTtcbiAgICBjb25zdCBkb2N1bWVudEJ5SWQgPSBkb2N1bWVudHMuYWRkUmVzb3VyY2UoJ3tpZH0nKTtcbiAgICBkb2N1bWVudEJ5SWQuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihkb2N1bWVudHNGdW5jdGlvbikpO1xuICAgIGRvY3VtZW50QnlJZC5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGRvY3VtZW50c0Z1bmN0aW9uKSk7XG5cbiAgICBjb25zdCBhbmFseXNpcyA9IGFwaS5yb290LmFkZFJlc291cmNlKCdhbmFseXNpcycpO1xuICAgIGFuYWx5c2lzLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oYW5hbHlzaXNGdW5jdGlvbikpO1xuICAgIGFuYWx5c2lzLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGFuYWx5c2lzRnVuY3Rpb24pKTtcblxuICAgIGNvbnN0IHJlc3VtZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdyZXN1bWUnKTtcbiAgICByZXN1bWUuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihyZXN1bWVGdW5jdGlvbikpO1xuICAgIHJlc3VtZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihyZXN1bWVGdW5jdGlvbikpO1xuICB9XG59Il19