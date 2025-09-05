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
                return await getAnalysis(userId);
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
                return await createAnalysis(userId, requestBody);
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
async function getAnalysis(userId) {
    const result = await database_1.docClient.send(new lib_dynamodb_1.QueryCommand({
        TableName: database_1.TABLE_NAMES.ANALYSIS,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId,
        },
    }));
    return (0, utils_1.createSuccessResponse)({
        analyses: result.Items || [],
        total: result.Count || 0,
    });
}
async function createAnalysis(userId, body) {
    console.log('Creating analysis for userId:', userId);
    // Get user's documents from database
    const result = await database_1.docClient.send(new lib_dynamodb_1.QueryCommand({
        TableName: database_1.TABLE_NAMES.DOCUMENTS,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId,
        },
    }));
    console.log('Documents query result:', JSON.stringify(result, null, 2));
    const rawDocuments = result.Items || [];
    if (rawDocuments.length === 0) {
        return (0, utils_1.createErrorResponse)(400, 'No documents found for analysis');
    }
    // Map documents to the expected format
    const documents = rawDocuments.map(doc => ({
        type: doc.type || 'Unknown',
        title: doc.title || 'Untitled',
        content: doc.content || ''
    }));
    console.log('Mapped documents for analysis:', documents.length);
    try {
        const analysisResult = await (0, bedrock_1.generatePersonalityAnalysis)({ documents });
        const analysisId = (0, uuid_1.v4)();
        const analysis = {
            analysisId,
            userId,
            result: analysisResult,
            createdAt: new Date().toISOString(),
        };
        await database_1.docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: database_1.TABLE_NAMES.ANALYSIS,
            Item: analysis,
        }));
        return (0, utils_1.createSuccessResponse)(analysis, 201);
    }
    catch (error) {
        console.error('AI 분석 실패:', error);
        return (0, utils_1.createErrorResponse)(500, 'AI 분석 서비스 일시 중단. 잠시 후 다시 시도해주세요.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZnVuY3Rpb25zL2FuYWx5c2lzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHdEQUFpRTtBQUNqRSwrQkFBb0M7QUFDcEMsb0RBQStEO0FBQy9ELDRDQUFnRDtBQUNoRCxrREFBbUU7QUFDbkUsOENBQWdGO0FBRXpFLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxLQUEyQixFQUFrQyxFQUFFO0lBQzNGLElBQUksQ0FBQztRQUNILElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUNuQyxPQUFPO2dCQUNMLFVBQVUsRUFBRSxHQUFHO2dCQUNmLE9BQU8sRUFBRTtvQkFDUCw2QkFBNkIsRUFBRSxHQUFHO29CQUNsQyw4QkFBOEIsRUFBRSxvQkFBb0I7b0JBQ3BELDhCQUE4QixFQUFFLDZCQUE2QjtpQkFDOUQ7Z0JBQ0QsSUFBSSxFQUFFLEVBQUU7YUFDVCxDQUFDO1FBQ0osQ0FBQztRQUVELE1BQU0sVUFBVSxHQUFHLElBQUEsa0JBQVcsRUFBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzNGLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDeEIsT0FBTyxJQUFBLDJCQUFtQixFQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU8sQ0FBQztRQUNsQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO1FBRWhDLFFBQVEsTUFBTSxFQUFFLENBQUM7WUFDZixLQUFLLEtBQUs7Z0JBQ1IsT0FBTyxNQUFNLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuQyxLQUFLLE1BQU07Z0JBQ1QsSUFBSSxXQUFXLEdBQUcsRUFBRSxD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QUFjLEdBQUcsTUFBTSxJQUFBLHFDQUEyQixFQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUN4RSxNQUFNLFVBQVUsR0FBRyxJQUFBLFNBQU0sR0FBRSxDQUFDO1FBRTVCLE1BQU0sUUFBUSxHQUFHO1lBQ2YsVUFBVTtZQUNWLE1BQU07WUFDTixNQUFNLEVBQUUsY0FBYztZQUN0QixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7U0FDcEMsQ0FBQztRQUVGLE1BQU0sb0JBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSx5QkFBVSxDQUFDO1lBQ2xDLFNBQVMsRUFBRSxzQkFBVyxDQUFDLFFBQVE7WUFDL0IsSUFBSSxFQUFFLFFBQVE7U0FDZixDQUFDLENBQUMsQ0FBQztRQUVKLE9BQU8sSUFBQSw2QkFBcUIsRUFBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsQyxPQUFPLElBQUEsMkJBQW1CLEVBQUMsR0FBRyxFQUFFLGtDQUFrQyxDQUFDLENBQUM7SUFDdEUsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBQdXRDb21tYW5kLCBRdWVyeUNvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9saWItZHluYW1vZGInO1xuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XG5pbXBvcnQgeyBkb2NDbGllbnQsIFRBQkxFX05BTUVTIH0gZnJvbSAnLi4vLi4vc2hhcmVkL2RhdGFiYXNlJztcbmltcG9ydCB7IHZlcmlmeVRva2VuIH0gZnJvbSAnLi4vLi4vc2hhcmVkL2F1dGgnO1xuaW1wb3J0IHsgZ2VuZXJhdGVQZXJzb25hbGl0eUFuYWx5c2lzIH0gZnJvbSAnLi4vLi4vc2hhcmVkL2JlZHJvY2snO1xuaW1wb3J0IHsgY3JlYXRlRXJyb3JSZXNwb25zZSwgY3JlYXRlU3VjY2Vzc1Jlc3BvbnNlIH0gZnJvbSAnLi4vLi4vc2hhcmVkL3V0aWxzJztcblxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgdHJ5IHtcbiAgICBpZiAoZXZlbnQuaHR0cE1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICByZXR1cm4geyBcbiAgICAgICAgc3RhdHVzQ29kZTogMjAwLCBcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULCBQT1NULCBPUFRJT05TJyxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24nXG4gICAgICAgIH0sIFxuICAgICAgICBib2R5OiAnJyBcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgYXV0aFJlc3VsdCA9IHZlcmlmeVRva2VuKGV2ZW50LmhlYWRlcnMuQXV0aG9yaXphdGlvbiB8fCBldmVudC5oZWFkZXJzLmF1dGhvcml6YXRpb24pO1xuICAgIGlmICghYXV0aFJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDEsICdVbmF1dGhvcml6ZWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VySWQgPSBhdXRoUmVzdWx0LnVzZXJJZCE7XG4gICAgY29uc3QgbWV0aG9kID0gZXZlbnQuaHR0cE1ldGhvZDtcblxuICAgIHN3aXRjaCAobWV0aG9kKSB7XG4gICAgICBjYXNlICdHRVQnOlxuICAgICAgICByZXR1cm4gYXdhaXQgZ2V0QW5hbHlzaXModXNlcklkKTtcbiAgICAgIGNhc2UgJ1BPU1QnOlxuICAgICAgICBsZXQgcmVxdWVzdEJvZHkgPSB7fTtcbiAgICAgICAgaWYgKGV2ZW50LmJvZHkpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVxdWVzdEJvZHkgPSBKU09OLnBhcnNlKGV2ZW50LmJvZHkpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDAsICdJbnZhbGlkIEpTT04gaW4gcmVxdWVzdCBib2R5Jyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhd2FpdCBjcmVhdGVBbmFseXNpcyh1c2VySWQsIHJlcXVlc3RCb2R5KTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwNSwgJ01ldGhvZCBub3QgYWxsb3dlZCcpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvcjonLCBlcnJvcik7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNTAwLCAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyk7XG4gIH1cbn07XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEFuYWx5c2lzKHVzZXJJZDogc3RyaW5nKSB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRvY0NsaWVudC5zZW5kKG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgIFRhYmxlTmFtZTogVEFCTEVfTkFNRVMuQU5BTFlTSVMsXG4gICAgSW5kZXhOYW1lOiAndXNlcklkLWluZGV4JyxcbiAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiAndXNlcklkID0gOnVzZXJJZCcsXG4gICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgJzp1c2VySWQnOiB1c2VySWQsXG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiBjcmVhdGVTdWNjZXNzUmVzcG9uc2Uoe1xuICAgIGFuYWx5c2VzOiByZXN1bHQuSXRlbXMgfHwgW10sXG4gICAgdG90YWw6IHJlc3VsdC5Db3VudCB8fCAwLFxuICB9KTtcbn1cblxuaW50ZXJmYWNlIEFuYWx5c2lzUmVxdWVzdCB7XG4gIGRvY3VtZW50czogQXJyYXk8e1xuICAgIHR5cGU6IHN0cmluZztcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgfT47XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUFuYWx5c2lzKHVzZXJJZDogc3RyaW5nLCBib2R5OiBhbnkpIHtcbiAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGFuYWx5c2lzIGZvciB1c2VySWQ6JywgdXNlcklkKTtcbiAgXG4gIC8vIEdldCB1c2VyJ3MgZG9jdW1lbnRzIGZyb20gZGF0YWJhc2VcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZG9jQ2xpZW50LnNlbmQobmV3IFF1ZXJ5Q29tbWFuZCh7XG4gICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FUy5ET0NVTUVOVFMsXG4gICAgSW5kZXhOYW1lOiAndXNlcklkLWluZGV4JyxcbiAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiAndXNlcklkID0gOnVzZXJJZCcsXG4gICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgJzp1c2VySWQnOiB1c2VySWQsXG4gICAgfSxcbiAgfSkpO1xuXG4gIGNvbnNvbGUubG9nKCdEb2N1bWVudHMgcXVlcnkgcmVzdWx0OicsIEpTT04uc3RyaW5naWZ5KHJlc3VsdCwgbnVsbCwgMikpO1xuICBjb25zdCByYXdEb2N1bWVudHMgPSByZXN1bHQuSXRlbXMgfHwgW107XG4gIFxuICBpZiAocmF3RG9jdW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwMCwgJ05vIGRvY3VtZW50cyBmb3VuZCBmb3IgYW5hbHlzaXMnKTtcbiAgfVxuXG4gIC8vIE1hcCBkb2N1bWVudHMgdG8gdGhlIGV4cGVjdGVkIGZvcm1hdFxuICBjb25zdCBkb2N1bWVudHMgPSByYXdEb2N1bWVudHMubWFwKGRvYyA9PiAoe1xuICAgIHR5cGU6IGRvYy50eXBlIHx8ICdVbmtub3duJyxcbiAgICB0aXRsZTogZG9jLnRpdGxlIHx8ICdVbnRpdGxlZCcsXG4gICAgY29udGVudDogZG9jLmNvbnRlbnQgfHwgJydcbiAgfSkpO1xuXG4gIGNvbnNvbGUubG9nKCdNYXBwZWQgZG9jdW1lbnRzIGZvciBhbmFseXNpczonLCBkb2N1bWVudHMubGVuZ3RoKTtcblxuICB0cnkge1xuICAgIGNvbnN0IGFuYWx5c2lzUmVzdWx0ID0gYXdhaXQgZ2VuZXJhdGVQZXJzb25hbGl0eUFuYWx5c2lzKHsgZG9jdW1lbnRzIH0pO1xuICAgIGNvbnN0IGFuYWx5c2lzSWQgPSB1dWlkdjQoKTtcblxuICAgIGNvbnN0IGFuYWx5c2lzID0ge1xuICAgICAgYW5hbHlzaXNJZCxcbiAgICAgIHVzZXJJZCxcbiAgICAgIHJlc3VsdDogYW5hbHlzaXNSZXN1bHQsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9O1xuXG4gICAgYXdhaXQgZG9jQ2xpZW50LnNlbmQobmV3IFB1dENvbW1hbmQoe1xuICAgICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FUy5BTkFMWVNJUyxcbiAgICAgIEl0ZW06IGFuYWx5c2lzLFxuICAgIH0pKTtcblxuICAgIHJldHVybiBjcmVhdGVTdWNjZXNzUmVzcG9uc2UoYW5hbHlzaXMsIDIwMSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignQUkg67aE7ISdIOyLpO2MqDonLCBlcnJvcik7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNTAwLCAnQUkg67aE7ISdIOyEnOu5hOyKpCDsnbzsi5wg7KSR64uoLiDsnqDsi5wg7ZuEIOuLpOyLnCDsi5zrj4TtlbTso7zshLjsmpQuJyk7XG4gIH1cbn0iXX0=