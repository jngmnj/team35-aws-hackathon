"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
const database_1 = require("../../shared/database");
const auth_1 = require("../../shared/auth");
const bedrock_1 = require("../../shared/bedrock");
const utils_1 = require("../../shared/utils");
const handler = async (event) => {
    try {
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                body: ''
            };
        }
        const authResult = (0, auth_1.verifyToken)(event.headers.Authorization || event.headers.authorization);
        if (!authResult.success) {
            return (0, utils_1.createErrorResponse)(401, 'Unauthorized');
        }
        const userId = authResult.userId;
        const method = event.httpMethod;
        switch (method) {
            case 'GET':
                return await getResumes(userId, event.queryStringParameters);
            case 'POST':
                let requestBody = {};
                if (event.body) {
                    try {
                        requestBody = JSON.parse(event.body);
                    }
                    catch (error) {
                        return (0, utils_1.createErrorResponse)(400, 'Invalid JSON in request body');
                    }
                }
                return await createResume(userId, requestBody);
            default:
                return (0, utils_1.createErrorResponse)(405, 'Method not allowed');
        }
    }
    catch (error) {
        console.error('Error:', error);
        return (0, utils_1.createErrorResponse)(500, 'Internal server error');
    }
};
exports.handler = handler;
async function getResumes(userId, queryParams) {
    // Validate userId to prevent injection
    if (!userId || typeof userId !== 'string' || userId.length === 0) {
        return (0, utils_1.createErrorResponse)(400, 'Invalid user ID');
    }
    const jobCategory = queryParams?.jobCategory;
    // Validate jobCategory if provided
    if (jobCategory && (typeof jobCategory !== 'string' || jobCategory.length === 0)) {
        return (0, utils_1.createErrorResponse)(400, 'Invalid job category');
    }
    let queryCommand;
    if (jobCategory) {
        queryCommand = new lib_dynamodb_1.QueryCommand({
            TableName: database_1.TABLE_NAMES.RESUMES,
            IndexName: 'userId-jobCategory-index',
            KeyConditionExpression: 'userId = :userId AND jobCategory = :jobCategory',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':jobCategory': jobCategory,
            },
        });
    }
    else {
        queryCommand = new lib_dynamodb_1.QueryCommand({
            TableName: database_1.TABLE_NAMES.RESUMES,
            IndexName: 'userId-jobCategory-index',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
        });
    }
    try {
        const result = await database_1.docClient.send(queryCommand);
        return (0, utils_1.createSuccessResponse)({
            resumes: result.Items || [],
            total: result.Count || 0,
        });
    }
    catch (error) {
        console.error('DynamoDB query error:', error);
        return (0, utils_1.createErrorResponse)(500, 'Failed to retrieve resumes');
    }
}
async function createResume(userId, body) {
    // Validate userId to prevent injection
    if (!userId || typeof userId !== 'string' || userId.length === 0) {
        return (0, utils_1.createErrorResponse)(400, 'Invalid user ID');
    }
    const { jobCategory, jobTitle } = body;
    if (!jobCategory || typeof jobCategory !== 'string' || jobCategory.length === 0) {
        return (0, utils_1.createErrorResponse)(400, 'Valid job category is required');
    }
    console.log('Creating resume for userId:', userId, 'jobCategory:', jobCategory);
    try {
        // Get user's documents from database with error handling
        const result = await database_1.docClient.send(new lib_dynamodb_1.QueryCommand({
            TableName: database_1.TABLE_NAMES.DOCUMENTS,
            IndexName: 'userId-index',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
        }));
        console.log('Documents query result count:', result.Count || 0);
        const rawDocuments = result.Items || [];
        if (rawDocuments.length === 0) {
            return (0, utils_1.createErrorResponse)(400, 'No documents found for resume generation. Please add some documents first.');
        }
        // Map documents to the expected format
        const documents = rawDocuments.map(doc => ({
            type: doc.type || 'Unknown',
            title: doc.title || 'Untitled',
            content: doc.content || ''
        }));
        console.log('Mapped documents for resume:', documents.length);
        // Generate resume with AI
        const resumeResult = await (0, bedrock_1.generateResume)({ documents, jobCategory, jobTitle });
        const resumeId = (0, uuid_1.v4)();
        const resume = {
            resumeId,
            userId,
            jobCategory,
            jobTitle: jobTitle || '',
            content: resumeResult,
            createdAt: new Date().toISOString(),
        };
        // Save resume to database
        await database_1.docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: database_1.TABLE_NAMES.RESUMES,
            Item: resume,
        }));
        console.log('Resume created successfully:', resumeId);
        return (0, utils_1.createSuccessResponse)(resume, 201);
    }
    catch (error) {
        console.error('이력서 생성 실패 - 상세 오류:', error);
        // Specific error handling
        if (error instanceof Error) {
            if (error.message.includes('ResourceNotFoundException')) {
                return (0, utils_1.createErrorResponse)(500, 'Database configuration error. Please contact support.');
            }
            if (error.message.includes('AccessDeniedException')) {
                return (0, utils_1.createErrorResponse)(500, 'AI service access denied. Please contact support.');
            }
            if (error.message.includes('ThrottlingException')) {
                return (0, utils_1.createErrorResponse)(429, 'Service temporarily busy. Please try again in a few moments.');
            }
        }
        return (0, utils_1.createErrorResponse)(500, '이력서 생성 서비스 일시 중단. 잠시 후 다시 시도해주세요.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZnVuY3Rpb25zL3Jlc3VtZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBaUU7QUFDakUsK0JBQW9DO0FBQ3BDLG9EQUErRDtBQUMvRCw0Q0FBZ0Q7QUFDaEQsa0RBQXNEO0FBQ3RELDhDQUFnRjtBQUV6RSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBMkIsRUFBa0MsRUFBRTtJQUMzRixJQUFJLENBQUM7UUFDSCxJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDbkMsT0FBTztnQkFDTCxVQUFVLEVBQUUsR0FBRztnQkFDZixPQUFPLEVBQUU7b0JBQ1AsNkJBQTZCLEVBQUUsR0FBRztvQkFDbEMsOEJBQThCLEVBQUUsb0JBQW9CO29CQUNwRCw4QkFBOEIsRUFBRSw2QkFBNkI7aUJBQzlEO2dCQUNELElBQUksRUFBRSxFQUFFO2FBQ1QsQ0FBQztRQUNKLENBQUM7UUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFBLGtCQUFXLEVBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMzRixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3hCLE9BQU8sSUFBQSwyQkFBbUIsRUFBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFPLENBQUM7UUFDbEMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztRQUVoQyxRQUFRLE1BQU0sRUFBRSxDQUFDO1lBQ2YsS0FBSyxLQUFLO2dCQUNSLE9BQU8sTUFBTSxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQy9ELEtBQUssTUFBTTtnQkFDVCxJ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ZixPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTNDLDBCQUEwQjtRQUMxQixJQUFJLEtBQUssWUFBWSxLQUFLLEVBQUUsQ0FBQztZQUMzQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLDJCQUEyQixDQUFDLEVBQUUsQ0FBQztnQkFDeEQsT0FBTyxJQUFBLDJCQUFtQixFQUFDLEdBQUcsRUFBRSx1REFBdUQsQ0FBQyxDQUFDO1lBQzNGLENBQUM7WUFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQztnQkFDcEQsT0FBTyxJQUFBLDJCQUFtQixFQUFDLEdBQUcsRUFBRSxtREFBbUQsQ0FBQyxDQUFDO1lBQ3ZGLENBQUM7WUFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQztnQkFDbEQsT0FBTyxJQUFBLDJCQUFtQixFQUFDLEdBQUcsRUFBRSw4REFBOEQsQ0FBQyxDQUFDO1lBQ2xHLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxJQUFBLDJCQUFtQixFQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgUHV0Q29tbWFuZCwgUXVlcnlDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvbGliLWR5bmFtb2RiJztcbmltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gJ3V1aWQnO1xuaW1wb3J0IHsgZG9jQ2xpZW50LCBUQUJMRV9OQU1FUyB9IGZyb20gJy4uLy4uL3NoYXJlZC9kYXRhYmFzZSc7XG5pbXBvcnQgeyB2ZXJpZnlUb2tlbiB9IGZyb20gJy4uLy4uL3NoYXJlZC9hdXRoJztcbmltcG9ydCB7IGdlbmVyYXRlUmVzdW1lIH0gZnJvbSAnLi4vLi4vc2hhcmVkL2JlZHJvY2snO1xuaW1wb3J0IHsgY3JlYXRlRXJyb3JSZXNwb25zZSwgY3JlYXRlU3VjY2Vzc1Jlc3BvbnNlIH0gZnJvbSAnLi4vLi4vc2hhcmVkL3V0aWxzJztcblxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgdHJ5IHtcbiAgICBpZiAoZXZlbnQuaHR0cE1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICByZXR1cm4geyBcbiAgICAgICAgc3RhdHVzQ29kZTogMjAwLCBcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULCBQT1NULCBPUFRJT05TJyxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24nXG4gICAgICAgIH0sIFxuICAgICAgICBib2R5OiAnJyBcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgYXV0aFJlc3VsdCA9IHZlcmlmeVRva2VuKGV2ZW50LmhlYWRlcnMuQXV0aG9yaXphdGlvbiB8fCBldmVudC5oZWFkZXJzLmF1dGhvcml6YXRpb24pO1xuICAgIGlmICghYXV0aFJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDEsICdVbmF1dGhvcml6ZWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VySWQgPSBhdXRoUmVzdWx0LnVzZXJJZCE7XG4gICAgY29uc3QgbWV0aG9kID0gZXZlbnQuaHR0cE1ldGhvZDtcblxuICAgIHN3aXRjaCAobWV0aG9kKSB7XG4gICAgICBjYXNlICdHRVQnOlxuICAgICAgICByZXR1cm4gYXdhaXQgZ2V0UmVzdW1lcyh1c2VySWQsIGV2ZW50LnF1ZXJ5U3RyaW5nUGFyYW1ldGVycyk7XG4gICAgICBjYXNlICdQT1NUJzpcbiAgICAgICAgbGV0IHJlcXVlc3RCb2R5ID0ge307XG4gICAgICAgIGlmIChldmVudC5ib2R5KSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlcXVlc3RCb2R5ID0gSlNPTi5wYXJzZShldmVudC5ib2R5KTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDAwLCAnSW52YWxpZCBKU09OIGluIHJlcXVlc3QgYm9keScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXdhaXQgY3JlYXRlUmVzdW1lKHVzZXJJZCwgcmVxdWVzdEJvZHkpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDA1LCAnTWV0aG9kIG5vdCBhbGxvd2VkJyk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOicsIGVycm9yKTtcbiAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg1MDAsICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InKTtcbiAgfVxufTtcblxuaW50ZXJmYWNlIFF1ZXJ5UGFyYW1zIHtcbiAgam9iQ2F0ZWdvcnk/OiBzdHJpbmc7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFJlc3VtZXModXNlcklkOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBRdWVyeVBhcmFtcyB8IG51bGwpIHtcbiAgLy8gVmFsaWRhdGUgdXNlcklkIHRvIHByZXZlbnQgaW5qZWN0aW9uXG4gIGlmICghdXNlcklkIHx8IHR5cGVvZiB1c2VySWQgIT09ICdzdHJpbmcnIHx8IHVzZXJJZC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDAsICdJbnZhbGlkIHVzZXIgSUQnKTtcbiAgfVxuXG4gIGNvbnN0IGpvYkNhdGVnb3J5ID0gcXVlcnlQYXJhbXM/LmpvYkNhdGVnb3J5O1xuXG4gIC8vIFZhbGlkYXRlIGpvYkNhdGVnb3J5IGlmIHByb3ZpZGVkXG4gIGlmIChqb2JDYXRlZ29yeSAmJiAodHlwZW9mIGpvYkNhdGVnb3J5ICE9PSAnc3RyaW5nJyB8fCBqb2JDYXRlZ29yeS5sZW5ndGggPT09IDApKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDAwLCAnSW52YWxpZCBqb2IgY2F0ZWdvcnknKTtcbiAgfVxuXG4gIGxldCBxdWVyeUNvbW1hbmQ7XG4gIGlmIChqb2JDYXRlZ29yeSkge1xuICAgIHF1ZXJ5Q29tbWFuZCA9IG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FUy5SRVNVTUVTLFxuICAgICAgSW5kZXhOYW1lOiAndXNlcklkLWpvYkNhdGVnb3J5LWluZGV4JyxcbiAgICAgIEtleUNvbmRpdGlvbkV4cHJlc3Npb246ICd1c2VySWQgPSA6dXNlcklkIEFORCBqb2JDYXRlZ29yeSA9IDpqb2JDYXRlZ29yeScsXG4gICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICc6dXNlcklkJzogdXNlcklkLFxuICAgICAgICAnOmpvYkNhdGVnb3J5Jzogam9iQ2F0ZWdvcnksXG4gICAgICB9LFxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHF1ZXJ5Q29tbWFuZCA9IG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FUy5SRVNVTUVTLFxuICAgICAgSW5kZXhOYW1lOiAndXNlcklkLWpvYkNhdGVnb3J5LWluZGV4JyxcbiAgICAgIEtleUNvbmRpdGlvbkV4cHJlc3Npb246ICd1c2VySWQgPSA6dXNlcklkJyxcbiAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgJzp1c2VySWQnOiB1c2VySWQsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkb2NDbGllbnQuc2VuZChxdWVyeUNvbW1hbmQpO1xuICAgIHJldHVybiBjcmVhdGVTdWNjZXNzUmVzcG9uc2Uoe1xuICAgICAgcmVzdW1lczogcmVzdWx0Lkl0ZW1zIHx8IFtdLFxuICAgICAgdG90YWw6IHJlc3VsdC5Db3VudCB8fCAwLFxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0R5bmFtb0RCIHF1ZXJ5IGVycm9yOicsIGVycm9yKTtcbiAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg1MDAsICdGYWlsZWQgdG8gcmV0cmlldmUgcmVzdW1lcycpO1xuICB9XG5cbn1cblxuaW50ZXJmYWNlIENyZWF0ZVJlc3VtZVJlcXVlc3Qge1xuICBkb2N1bWVudHM6IEFycmF5PHtcbiAgICB0eXBlOiBzdHJpbmc7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICBjb250ZW50OiBzdHJpbmc7XG4gIH0+O1xuICBqb2JDYXRlZ29yeTogc3RyaW5nO1xuICBqb2JUaXRsZT86IHN0cmluZztcbn1cblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlUmVzdW1lKHVzZXJJZDogc3RyaW5nLCBib2R5OiBhbnkpIHtcbiAgLy8gVmFsaWRhdGUgdXNlcklkIHRvIHByZXZlbnQgaW5qZWN0aW9uXG4gIGlmICghdXNlcklkIHx8IHR5cGVvZiB1c2VySWQgIT09ICdzdHJpbmcnIHx8IHVzZXJJZC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDAsICdJbnZhbGlkIHVzZXIgSUQnKTtcbiAgfVxuXG4gIGNvbnN0IHsgam9iQ2F0ZWdvcnksIGpvYlRpdGxlIH0gPSBib2R5O1xuXG4gIGlmICgham9iQ2F0ZWdvcnkgfHwgdHlwZW9mIGpvYkNhdGVnb3J5ICE9PSAnc3RyaW5nJyB8fCBqb2JDYXRlZ29yeS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDAsICdWYWxpZCBqb2IgY2F0ZWdvcnkgaXMgcmVxdWlyZWQnKTtcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdDcmVhdGluZyByZXN1bWUgZm9yIHVzZXJJZDonLCB1c2VySWQsICdqb2JDYXRlZ29yeTonLCBqb2JDYXRlZ29yeSk7XG5cbiAgdHJ5IHtcbiAgICAvLyBHZXQgdXNlcidzIGRvY3VtZW50cyBmcm9tIGRhdGFiYXNlIHdpdGggZXJyb3IgaGFuZGxpbmdcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkb2NDbGllbnQuc2VuZChuZXcgUXVlcnlDb21tYW5kKHtcbiAgICAgIFRhYmxlTmFtZTogVEFCTEVfTkFNRVMuRE9DVU1FTlRTLFxuICAgICAgSW5kZXhOYW1lOiAndXNlcklkLWluZGV4JywgXG4gICAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiAndXNlcklkID0gOnVzZXJJZCcsXG4gICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICc6dXNlcklkJzogdXNlcklkLFxuICAgICAgfSxcbiAgICB9KSk7XG5cbiAgICBjb25zb2xlLmxvZygnRG9jdW1lbnRzIHF1ZXJ5IHJlc3VsdCBjb3VudDonLCByZXN1bHQuQ291bnQgfHwgMCk7XG4gICAgY29uc3QgcmF3RG9jdW1lbnRzID0gcmVzdWx0Lkl0ZW1zIHx8IFtdO1xuICAgIFxuICAgIGlmIChyYXdEb2N1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDAsICdObyBkb2N1bWVudHMgZm91bmQgZm9yIHJlc3VtZSBnZW5lcmF0aW9uLiBQbGVhc2UgYWRkIHNvbWUgZG9jdW1lbnRzIGZpcnN0LicpO1xuICAgIH1cblxuICAgIC8vIE1hcCBkb2N1bWVudHMgdG8gdGhlIGV4cGVjdGVkIGZvcm1hdFxuICAgIGNvbnN0IGRvY3VtZW50cyA9IHJhd0RvY3VtZW50cy5tYXAoZG9jID0+ICh7XG4gICAgICB0eXBlOiBkb2MudHlwZSB8fCAnVW5rbm93bicsXG4gICAgICB0aXRsZTogZG9jLnRpdGxlIHx8ICdVbnRpdGxlZCcsXG4gICAgICBjb250ZW50OiBkb2MuY29udGVudCB8fCAnJ1xuICAgIH0pKTtcblxuICAgIGNvbnNvbGUubG9nKCdNYXBwZWQgZG9jdW1lbnRzIGZvciByZXN1bWU6JywgZG9jdW1lbnRzLmxlbmd0aCk7XG5cbiAgICAvLyBHZW5lcmF0ZSByZXN1bWUgd2l0aCBBSVxuICAgIGNvbnN0IHJlc3VtZVJlc3VsdCA9IGF3YWl0IGdlbmVyYXRlUmVzdW1lKHsgZG9jdW1lbnRzLCBqb2JDYXRlZ29yeSwgam9iVGl0bGUgfSk7XG4gICAgY29uc3QgcmVzdW1lSWQgPSB1dWlkdjQoKTtcblxuICAgIGNvbnN0IHJlc3VtZSA9IHtcbiAgICAgIHJlc3VtZUlkLFxuICAgICAgdXNlcklkLFxuICAgICAgam9iQ2F0ZWdvcnksXG4gICAgICBqb2JUaXRsZTogam9iVGl0bGUgfHwgJycsXG4gICAgICBjb250ZW50OiByZXN1bWVSZXN1bHQsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9O1xuXG4gICAgLy8gU2F2ZSByZXN1bWUgdG8gZGF0YWJhc2VcbiAgICBhd2FpdCBkb2NDbGllbnQuc2VuZChuZXcgUHV0Q29tbWFuZCh7XG4gICAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUVTLlJFU1VNRVMsXG4gICAgICBJdGVtOiByZXN1bWUsXG4gICAgfSkpO1xuXG4gICAgY29uc29sZS5sb2coJ1Jlc3VtZSBjcmVhdGVkIHN1Y2Nlc3NmdWxseTonLCByZXN1bWVJZCk7XG4gICAgcmV0dXJuIGNyZWF0ZVN1Y2Nlc3NSZXNwb25zZShyZXN1bWUsIDIwMSk7XG4gICAgXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcign7J2066Cl7IScIOyDneyEsSDsi6TtjKggLSDsg4HshLgg7Jik66WYOicsIGVycm9yKTtcbiAgICBcbiAgICAvLyBTcGVjaWZpYyBlcnJvciBoYW5kbGluZ1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBpZiAoZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnUmVzb3VyY2VOb3RGb3VuZEV4Y2VwdGlvbicpKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDUwMCwgJ0RhdGFiYXNlIGNvbmZpZ3VyYXRpb24gZXJyb3IuIFBsZWFzZSBjb250YWN0IHN1cHBvcnQuJyk7XG4gICAgICB9XG4gICAgICBpZiAoZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnQWNjZXNzRGVuaWVkRXhjZXB0aW9uJykpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNTAwLCAnQUkgc2VydmljZSBhY2Nlc3MgZGVuaWVkLiBQbGVhc2UgY29udGFjdCBzdXBwb3J0LicpO1xuICAgICAgfVxuICAgICAgaWYgKGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ1Rocm90dGxpbmdFeGNlcHRpb24nKSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MjksICdTZXJ2aWNlIHRlbXBvcmFyaWx5IGJ1c3kuIFBsZWFzZSB0cnkgYWdhaW4gaW4gYSBmZXcgbW9tZW50cy4nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNTAwLCAn7J2066Cl7IScIOyDneyEsSDshJzruYTsiqQg7J287IucIOykkeuLqC4g7J6g7IucIO2bhCDri6Tsi5wg7Iuc64+E7ZW07KO87IS47JqULicpO1xuICB9XG59Il19