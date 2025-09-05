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
                JWT_SECRET: process.env.JWT_SECRET || 'hackathon-jwt-secret-2024',
            },
        });
        const documentsFunction = new lambda.Function(this, 'DocumentsFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../src/functions/documents'),
            environment: {
                DOCUMENTS_TABLE_NAME: props.documentsTable.tableName,
                JWT_SECRET: process.env.JWT_SECRET || 'hackathon-jwt-secret-2024',
            },
        });
        const analysisFunction = new lambda.Function(this, 'AnalysisFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../src/functions/analysis'),
            timeout: cdk.Duration.minutes(5),
            environment: {
                ANALYSIS_TABLE_NAME: props.analysisTable.tableName,
                DOCUMENTS_TABLE_NAME: props.documentsTable.tableName,
                JWT_SECRET: process.env.JWT_SECRET || 'hackathon-jwt-secret-2024',
            },
        });
        const resumeFunction = new lambda.Function(this, 'ResumeFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../src/functions/resume'),
            timeout: cdk.Duration.minutes(5),
            environment: {
                RESUMES_TABLE_NAME: props.resumesTable.tableName,
                DOCUMENTS_TABLE_NAME: props.documentsTable.tableName,
                JWT_SECRET: process.env.JWT_SECRET || 'hackathon-jwt-secret-2024',
            },
        });
        // Grant permissions
        props.usersTable.grantReadWriteData(authFunction);
        props.documentsTable.grantReadWriteData(documentsFunction);
        props.analysisTable.grantReadWriteData(analysisFunction);
        props.resumesTable.grantReadWriteData(resumeFunction);
        // Grant Bedrock permissions for AI functions
        analysisFunction.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            actions: ['bedrock:InvokeModel'],
            resources: ['arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0'],
        }));
        resumeFunction.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            actions: ['bedrock:InvokeModel'],
            resources: ['arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0'],
        }));
        // Grant documents table access for AI functions
        props.documentsTable.grantReadData(analysisFunction);
        props.documentsTable.grantReadData(resumeFunction);
        // CORS configuration for all methods
        const corsOptions = {
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowMethods: apigateway.Cors.ALL_METHODS,
            allowHeaders: ['Content-Type', 'Authorization'],
        };
        // API routes with CORS
        const auth = api.root.addResource('auth', { defaultCorsPreflightOptions: corsOptions });
        auth.addResource('register', { defaultCorsPreflightOptions: corsOptions }).addMethod('POST', new apigateway.LambdaIntegration(authFunction));
        auth.addResource('login', { defaultCorsPreflightOptions: corsOptions }).addMethod('POST', new apigateway.LambdaIntegration(authFunction));
        const documents = api.root.addResource('documents', { defaultCorsPreflightOptions: corsOptions });
        documents.addMethod('GET', new apigateway.LambdaIntegration(documentsFunction));
        documents.addMethod('POST', new apigateway.LambdaIntegration(documentsFunction));
        const documentById = documents.addResource('{id}', { defaultCorsPreflightOptions: corsOptions });
        documentById.addMethod('PUT', new apigateway.LambdaIntegration(documentsFunction));
        documentById.addMethod('DELETE', new apigateway.LambdaIntegration(documentsFunction));
        const analysis = api.root.addResource('analysis', { defaultCorsPreflightOptions: corsOptions });
        analysis.addMethod('GET', new apigateway.LambdaIntegration(analysisFunction));
        analysis.addMethod('POST', new apigateway.LambdaIntegration(analysisFunction));
        const resume = api.root.addResource('resume', { defaultCorsPreflightOptions: corsOptions });
        resume.addMethod('GET', new apigateway.LambdaIntegration(resumeFunction));
        resume.addMethod('POST', new apigateway.LambdaIntegration(resumeFunction));
    }
}
exports.ApiStack = ApiStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vaW5mcmFzdHJ1Y3R1cmUvbGliL2FwaS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsdUVBQXlEO0FBQ3pELCtEQUFpRDtBQVdqRCxNQUFhLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNyQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQW9CO1FBQzVELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLHFCQUFxQjtRQUNyQixNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQzdELFdBQVcsRUFBRSxzQkFBc0I7WUFDbkMsMkJBQTJCLEVBQUU7Z0JBQzNCLFlBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVc7Z0JBQ3pDLFlBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVc7Z0JBQ3pDLFlBQVksRUFBRSxDQUFDLGNBQWMsRUFBRSxlQUFlLENBQUM7YUFDaEQ7U0FDRixDQUFDLENBQUM7UUFFSCxtQkFBbUI7UUFDbkIsTUFBTSxZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDN0QsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsZUFBZTtZQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUM7WUFDcEQsV0FBVyxFQUFFO2dCQUNYLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUztnQkFDNUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJ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b3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmludGVyZmFjZSBBcGlTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICB1c2Vyc1RhYmxlOiBkeW5hbW9kYi5UYWJsZTtcbiAgZG9jdW1lbnRzVGFibGU6IGR5bmFtb2RiLlRhYmxlO1xuICBhbmFseXNpc1RhYmxlOiBkeW5hbW9kYi5UYWJsZTtcbiAgcmVzdW1lc1RhYmxlOiBkeW5hbW9kYi5UYWJsZTtcbn1cblxuZXhwb3J0IGNsYXNzIEFwaVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEFwaVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIENyZWF0ZSBBUEkgR2F0ZXdheVxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ1Jlc3VtZUdlbmVyYXRvckFwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnUmVzdW1lIEdlbmVyYXRvciBBUEknLFxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxuICAgICAgICBhbGxvd01ldGhvZHM6IGFwaWdhdGV3YXkuQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZScsICdBdXRob3JpemF0aW9uJ10sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uc1xuICAgIGNvbnN0IGF1dGhGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0F1dGhGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9zcmMvZnVuY3Rpb25zL2F1dGgnKSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFVTRVJTX1RBQkxFX05BTUU6IHByb3BzLnVzZXJzVGFibGUudGFibGVOYW1lLFxuICAgICAgICBKV1RfU0VDUkVUOiBwcm9jZXNzLmVudi5KV1RfU0VDUkVUIHx8ICdoYWNrYXRob24tand0LXNlY3JldC0yMDI0JyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBkb2N1bWVudHNGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0RvY3VtZW50c0Z1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL3NyYy9mdW5jdGlvbnMvZG9jdW1lbnRzJyksXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBET0NVTUVOVFNfVEFCTEVfTkFNRTogcHJvcHMuZG9jdW1lbnRzVGFibGUudGFibGVOYW1lLFxuICAgICAgICBKV1RfU0VDUkVUOiBwcm9jZXNzLmVudi5KV1RfU0VDUkVUIHx8ICdoYWNrYXRob24tand0LXNlY3JldC0yMDI0JyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBhbmFseXNpc0Z1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQW5hbHlzaXNGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9zcmMvZnVuY3Rpb25zL2FuYWx5c2lzJyksXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIEFOQUxZU0lTX1RBQkxFX05BTUU6IHByb3BzLmFuYWx5c2lzVGFibGUudGFibGVOYW1lLFxuICAgICAgICBET0NVTUVOVFNfVEFCTEVfTkFNRTogcHJvcHMuZG9jdW1lbnRzVGFibGUudGFibGVOYW1lLFxuICAgICAgICBKV1RfU0VDUkVUOiBwcm9jZXNzLmVudi5KV1RfU0VDUkVUIHx8ICdoYWNrYXRob24tand0LXNlY3JldC0yMDI0JyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCByZXN1bWVGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1Jlc3VtZUZ1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL3NyYy9mdW5jdGlvbnMvcmVzdW1lJyksXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFJFU1VNRVNfVEFCTEVfTkFNRTogcHJvcHMucmVzdW1lc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgRE9DVU1FTlRTX1RBQkxFX05BTUU6IHByb3BzLmRvY3VtZW50c1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgSldUX1NFQ1JFVDogcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCB8fCAnaGFja2F0aG9uLWp3dC1zZWNyZXQtMjAyNCcsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gR3JhbnQgcGVybWlzc2lvbnNcbiAgICBwcm9wcy51c2Vyc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShhdXRoRnVuY3Rpb24pO1xuICAgIHByb3BzLmRvY3VtZW50c1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShkb2N1bWVudHNGdW5jdGlvbik7XG4gICAgcHJvcHMuYW5hbHlzaXNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoYW5hbHlzaXNGdW5jdGlvbik7XG4gICAgcHJvcHMucmVzdW1lc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShyZXN1bWVGdW5jdGlvbik7XG4gICAgXG4gICAgLy8gR3JhbnQgQmVkcm9jayBwZXJtaXNzaW9ucyBmb3IgQUkgZnVuY3Rpb25zXG4gICAgYW5hbHlzaXNGdW5jdGlvbi5hZGRUb1JvbGVQb2xpY3kobmV3IGNkay5hd3NfaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGNkay5hd3NfaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFsnYmVkcm9jazpJbnZva2VNb2RlbCddLFxuICAgICAgcmVzb3VyY2VzOiBbJ2Fybjphd3M6YmVkcm9jazp1cy1lYXN0LTE6OmZvdW5kYXRpb24tbW9kZWwvYW50aHJvcGljLmNsYXVkZS0zLXNvbm5ldC0yMDI0MDIyOS12MTowJ10sXG4gICAgfSkpO1xuICAgIFxuICAgIHJlc3VtZUZ1bmN0aW9uLmFkZFRvUm9sZVBvbGljeShuZXcgY2RrLmF3c19pYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogY2RrLmF3c19pYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogWydiZWRyb2NrOkludm9rZU1vZGVsJ10sXG4gICAgICByZXNvdXJjZXM6IFsnYXJuOmF3czpiZWRyb2NrOnVzLWVhc3QtMTo6Zm91bmRhdGlvbi1tb2RlbC9hbnRocm9waWMuY2xhdWRlLTMtc29ubmV0LTIwMjQwMjI5LXYxOjAnXSxcbiAgICB9KSk7XG4gICAgXG4gICAgLy8gR3JhbnQgZG9jdW1lbnRzIHRhYmxlIGFjY2VzcyBmb3IgQUkgZnVuY3Rpb25zXG4gICAgcHJvcHMuZG9jdW1lbnRzVGFibGUuZ3JhbnRSZWFkRGF0YShhbmFseXNpc0Z1bmN0aW9uKTtcbiAgICBwcm9wcy5kb2N1bWVudHNUYWJsZS5ncmFudFJlYWREYXRhKHJlc3VtZUZ1bmN0aW9uKTtcblxuICAgIC8vIENPUlMgY29uZmlndXJhdGlvbiBmb3IgYWxsIG1ldGhvZHNcbiAgICBjb25zdCBjb3JzT3B0aW9ucyA9IHtcbiAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxuICAgICAgYWxsb3dNZXRob2RzOiBhcGlnYXRld2F5LkNvcnMuQUxMX01FVEhPRFMsXG4gICAgICBhbGxvd0hlYWRlcnM6IFsnQ29udGVudC1UeXBlJywgJ0F1dGhvcml6YXRpb24nXSxcbiAgICB9O1xuXG4gICAgLy8gQVBJIHJvdXRlcyB3aXRoIENPUlNcbiAgICBjb25zdCBhdXRoID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2F1dGgnLCB7IGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczogY29yc09wdGlvbnMgfSk7XG4gICAgYXV0aC5hZGRSZXNvdXJjZSgncmVnaXN0ZXInLCB7IGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczogY29yc09wdGlvbnMgfSkuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oYXV0aEZ1bmN0aW9uKSk7XG4gICAgYXV0aC5hZGRSZXNvdXJjZSgnbG9naW4nLCB7IGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczogY29yc09wdGlvbnMgfSkuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oYXV0aEZ1bmN0aW9uKSk7XG5cbiAgICBjb25zdCBkb2N1bWVudHMgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgnZG9jdW1lbnRzJywgeyBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6IGNvcnNPcHRpb25zIH0pO1xuICAgIGRvY3VtZW50cy5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGRvY3VtZW50c0Z1bmN0aW9uKSk7XG4gICAgZG9jdW1lbnRzLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGRvY3VtZW50c0Z1bmN0aW9uKSk7XG4gICAgY29uc3QgZG9jdW1lbnRCeUlkID0gZG9jdW1lbnRzLmFkZFJlc291cmNlKCd7aWR9JywgeyBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6IGNvcnNPcHRpb25zIH0pO1xuICAgIGRvY3VtZW50QnlJZC5hZGRNZXRob2QoJ1BVVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGRvY3VtZW50c0Z1bmN0aW9uKSk7XG4gICAgZG9jdW1lbnRCeUlkLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZG9jdW1lbnRzRnVuY3Rpb24pKTtcblxuICAgIGNvbnN0IGFuYWx5c2lzID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2FuYWx5c2lzJywgeyBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6IGNvcnNPcHRpb25zIH0pO1xuICAgIGFuYWx5c2lzLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oYW5hbHlzaXNGdW5jdGlvbikpO1xuICAgIGFuYWx5c2lzLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGFuYWx5c2lzRnVuY3Rpb24pKTtcblxuICAgIGNvbnN0IHJlc3VtZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdyZXN1bWUnLCB7IGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczogY29yc09wdGlvbnMgfSk7XG4gICAgcmVzdW1lLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocmVzdW1lRnVuY3Rpb24pKTtcbiAgICByZXN1bWUuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocmVzdW1lRnVuY3Rpb24pKTtcbiAgfVxufSJdfQ==