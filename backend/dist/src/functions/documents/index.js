"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
const auth_1 = require("./shared/auth");
const validation_1 = require("./shared/validation");
const error_handler_1 = require("./shared/error-handler");
const utils_1 = require("./shared/utils");
const client = new client_dynamodb_1.DynamoDBClient({});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, If-Match',
};
const handler = async (event) => {
    try {
        if (event.httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers, body: '' };
        }
        // Verify JWT token using shared utility
        const authResult = (0, auth_1.verifyToken)(event.headers.Authorization || event.headers.authorization);
        if (!authResult.success) {
            return (0, utils_1.createErrorResponse)(401, 'Unauthorized');
        }
        const userId = authResult.userId;
        const method = event.httpMethod;
        const pathParameters = event.pathParameters;
        let requestBody = {};
        if (event.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
            try {
                requestBody = JSON.parse(event.body);
            }
            catch (error) {
                return (0, utils_1.createErrorResponse)(400, 'Invalid JSON in request body');
            }
        }
        switch (method) {
            case 'GET':
                if (pathParameters?.id) {
                    return await getDocument(pathParameters.id, userId);
                }
                return await getDocuments(userId, event.queryStringParameters);
            case 'POST':
                return await createDocument(userId, requestBody);
            case 'PUT':
                if (!pathParameters?.id) {
                    return (0, utils_1.createErrorResponse)(400, 'Document ID is required');
                }
                return await updateDocument(pathParameters.id, requestBody, userId);
            case 'PATCH':
                if (!pathParameters?.id) {
                    return (0, utils_1.createErrorResponse)(400, 'Document ID is required');
                }
                return await patchDocument(pathParameters.id, requestBody, userId);
            case 'DELETE':
                if (!pathParameters?.id) {
                    return (0, utils_1.createErrorResponse)(400, 'Document ID is required');
                }
                return await deleteDocument(pathParameters.id, userId);
            default:
                return (0, utils_1.createErrorResponse)(405, 'Method not allowed');
        }
    }
    catch (error) {
        console.error('Error:', error);
        // Handle DynamoDB specific errors
        if (error.name && error.name.includes('Exception')) {
            const dbError = (0, error_handler_1.handleDynamoDBError)(error);
            return {
                statusCode: dbError.statusCode,
                headers,
                body: JSON.stringify({ success: false, error: dbError.error }),
            };
        }
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: { message: 'Internal server error' } }),
        };
    }
};
exports.handler = handler;
async function getDocument(documentId, userId) {
    const document = await docClient.send(new lib_dynamodb_1.GetCommand({
        TableName: process.env.DOCUMENTS_TABLE_NAME,
        Key: { documentId },
    }));
    if (!document.Item) {
        return (0, utils_1.createErrorResponse)(404, 'Document not found');
    }
    if (document.Item.userId !== userId) {
        return (0, utils_1.createErrorResponse)(403, 'Access denied');
    }
    return (0, utils_1.createSuccessResponse)(document.Item);
}
async function getDocuments(userId, queryParams) {
    // Validate userId to prevent injection
    if (!userId || typeof userId !== 'string' || userId.length === 0) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: { message: 'Invalid user ID' } }),
        };
    }
    let keyConditionExpression = 'userId = :userId';
    const expressionAttributeValues = {
        ':userId': userId,
    };
    // Add type filter if provided and validated
    if (queryParams?.type && (0, validation_1.validateDocumentType)(queryParams.type)) {
        keyConditionExpression += ' AND #type = :type';
        expressionAttributeValues[':type'] = queryParams.type;
    }
    try {
        const result = await docClient.send(new lib_dynamodb_1.QueryCommand({
            TableName: process.env.DOCUMENTS_TABLE_NAME,
            IndexName: 'userId-index',
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeNames: queryParams?.type ? { '#type': 'type' } : undefined,
            ExpressionAttributeValues: expressionAttributeValues,
        }));
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    documents: result.Items || [],
                    total: result.Count || 0,
                    hasMore: false // TODO: Implement pagination logic
                },
                timestamp: new Date().toISOString()
            }),
        };
    }
    catch (error) {
        console.error('DynamoDB query error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: { message: 'Database query failed' } }),
        };
    }
}
async function createDocument(userId, body) {
    // Validate userId to prevent injection
    if (!userId || typeof userId !== 'string' || userId.length === 0) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: { message: 'Invalid user ID' } }),
        };
    }
    const { type, title, content } = body;
    if (!type || !title) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: { message: 'Missing required fields' } }),
        };
    }
    if (!(0, validation_1.validateDocumentType)(type)) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: { message: 'Invalid document type' } }),
        };
    }
    const validation = (0, validation_1.validateDocumentData)(type, title, content);
    if (!validation.isValid) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: { message: 'Validation failed', details: validation.errors } }),
        };
    }
    const documentId = (0, uuid_1.v4)();
    const now = new Date().toISOString();
    const document = {
        documentId,
        userId,
        type,
        title,
        content: content || '',
        version: 1,
        createdAt: now,
        updatedAt: now,
    };
    try {
        await docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: process.env.DOCUMENTS_TABLE_NAME,
            Item: document,
        }));
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                data: document,
            }),
        };
    }
    catch (error) {
        console.error('DynamoDB put error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: { message: 'Failed to create document' } }),
        };
    }
}
async function updateDocument(documentId, body, userId) {
    const { title, content, type } = body;
    if (!documentId) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: { message: 'Document ID is required' } }),
        };
    }
    // Check document ownership
    const ownershipCheck = await verifyDocumentOwnership(documentId, userId);
    if (!ownershipCheck.success) {
        return ownershipCheck.response;
    }
    if (!title && !content) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: { message: 'No fields to update' } }),
        };
    }
    // If type is provided, validate the document data
    if (type && title) {
        if (!(0, validation_1.validateDocumentType)(type)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: { message: 'Invalid document type' } }),
            };
        }
        const validation = (0, validation_1.validateDocumentData)(type, title, content);
        if (!validation.isValid) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: { message: 'Validation failed', details: validation.errors } }),
            };
        }
    }
    const updateExpression = [];
    const expressionAttributeValues = {};
    if (title) {
        updateExpression.push('title = :title');
        expressionAttributeValues[':title'] = title;
    }
    if (content) {
        updateExpression.push('content = :content');
        expressionAttributeValues[':content'] = content;
    }
    updateExpression.push('updatedAt = :updatedAt', '#version = #version + :inc');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    expressionAttributeValues[':inc'] = 1;
    const result = await docClient.send(new lib_dynamodb_1.UpdateCommand({
        TableName: process.env.DOCUMENTS_TABLE_NAME,
        Key: { documentId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: { '#version': 'version' },
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
    }));
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            data: result.Attributes,
        }),
    };
}
async function patchDocument(documentId, body, userId) {
    const { title, content, version: clientVersion } = body;
    if (!title && !content) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: { message: 'No fields to update' } }),
        };
    }
    // Check document ownership
    const ownershipCheck = await verifyDocumentOwnership(documentId, userId);
    if (!ownershipCheck.success) {
        return ownershipCheck.response;
    }
    // Get current document for version check
    const currentDoc = await docClient.send(new lib_dynamodb_1.GetCommand({
        TableName: process.env.DOCUMENTS_TABLE_NAME,
        Key: { documentId },
    }));
    if (!currentDoc.Item) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ success: false, error: { message: 'Document not found' } }),
        };
    }
    // Version conflict check for concurrent editing
    if (clientVersion && currentDoc.Item.version !== clientVersion) {
        return {
            statusCode: 409,
            headers,
            body: JSON.stringify({
                success: false,
                error: {
                    message: 'Document has been modified by another user',
                    currentVersion: currentDoc.Item.version,
                    conflictData: currentDoc.Item
                }
            }),
        };
    }
    const updateExpression = [];
    const expressionAttributeValues = {};
    if (title !== undefined) {
        updateExpression.push('title = :title');
        expressionAttributeValues[':title'] = title;
    }
    if (content !== undefined) {
        updateExpression.push('content = :content');
        expressionAttributeValues[':content'] = content;
    }
    updateExpression.push('updatedAt = :updatedAt', '#version = #version + :inc');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    expressionAttributeValues[':inc'] = 1;
    const result = await docClient.send(new lib_dynamodb_1.UpdateCommand({
        TableName: process.env.DOCUMENTS_TABLE_NAME,
        Key: { documentId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: { '#version': 'version' },
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
    }));
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            data: result.Attributes,
        }),
    };
}
async function deleteDocument(documentId, userId) {
    if (!documentId) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: { message: 'Document ID is required' } }),
        };
    }
    // Check document ownership
    const ownershipCheck = await verifyDocumentOwnership(documentId, userId);
    if (!ownershipCheck.success) {
        return ownershipCheck.response;
    }
    await docClient.send(new lib_dynamodb_1.DeleteCommand({
        TableName: process.env.DOCUMENTS_TABLE_NAME,
        Key: { documentId },
    }));
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: 'Document deleted successfully',
        }),
    };
}
async function verifyDocumentOwnership(documentId, userId) {
    const document = await docClient.send(new lib_dynamodb_1.GetCommand({
        TableName: process.env.DOCUMENTS_TABLE_NAME,
        Key: { documentId },
    }));
    if (!document.Item) {
        return {
            success: false,
            response: {
                statusCode: 404,
                headers,
                body: JSON.stringify({ success: false, error: { message: 'Document not found' } }),
            }
        };
    }
    if (document.Item.userId !== userId) {
        return {
            success: false,
            response: {
                statusCode: 403,
                headers,
                body: JSON.stringify({ success: false, error: { message: 'Access denied: You can only modify your own documents' } }),
            }
        };
    }
    return { success: true, document: document.Item };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZnVuY3Rpb25zL2RvY3VtZW50cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw4REFBMEQ7QUFDMUQsd0RBQW1JO0FBQ25JLCtCQUFvQztBQUNwQyx3Q0FBNEM7QUFDNUMsb0RBQWlGO0FBQ2pGLDBEQUE2RDtBQUM3RCwwQ0FBNEU7QUFHNUUsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sU0FBUyxHQUFHLHFDQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUV0RCxNQUFNLE9BQU8sR0FBRztJQUNkLGNBQWMsRUFBRSxrQkFBa0I7SUFDbEMsNkJBQTZCLEVBQUUsR0FBRztJQUNsQyw4QkFBOEIsRUFBRSx3Q0FBd0M7SUFDeEUsOEJBQThCLEVBQUUsdUNBQXVDO0NBQ3hFLENBQUM7QUFFSyxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBMkIsRUFBa0MsRUFBRTtJQUMzRixJQUFJLENBQUM7UUFDSCxJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDbkMsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUNoRCxDQUFDO1FBRUQsd0NBQXdDO1FBQ3hDLE1BQU0sVUFBVSxHQUFHLElBQUEsa0JBQVcsRUFBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzNGLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDeEIsT0FBTyxJQUFBLDJCQUFtQixFQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1B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QUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBEeW5hbW9EQkNsaWVudCB9IGZyb20gJ0Bhd3Mtc2RrL2NsaWVudC1keW5hbW9kYic7XG5pbXBvcnQgeyBEeW5hbW9EQkRvY3VtZW50Q2xpZW50LCBQdXRDb21tYW5kLCBHZXRDb21tYW5kLCBRdWVyeUNvbW1hbmQsIFVwZGF0ZUNvbW1hbmQsIERlbGV0ZUNvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9saWItZHluYW1vZGInO1xuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XG5pbXBvcnQgeyB2ZXJpZnlUb2tlbiB9IGZyb20gJy4vc2hhcmVkL2F1dGgnO1xuaW1wb3J0IHsgdmFsaWRhdGVEb2N1bWVudFR5cGUsIHZhbGlkYXRlRG9jdW1lbnREYXRhIH0gZnJvbSAnLi9zaGFyZWQvdmFsaWRhdGlvbic7XG5pbXBvcnQgeyBoYW5kbGVEeW5hbW9EQkVycm9yIH0gZnJvbSAnLi9zaGFyZWQvZXJyb3ItaGFuZGxlcic7XG5pbXBvcnQgeyBjcmVhdGVFcnJvclJlc3BvbnNlLCBjcmVhdGVTdWNjZXNzUmVzcG9uc2UgfSBmcm9tICcuL3NoYXJlZC91dGlscyc7XG5pbXBvcnQgeyBEb2N1bWVudFR5cGUgfSBmcm9tICcuL3R5cGVzL2RvY3VtZW50JztcblxuY29uc3QgY2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHt9KTtcbmNvbnN0IGRvY0NsaWVudCA9IER5bmFtb0RCRG9jdW1lbnRDbGllbnQuZnJvbShjbGllbnQpO1xuXG5jb25zdCBoZWFkZXJzID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIFBVVCwgUEFUQ0gsIERFTEVURSwgT1BUSU9OUycsXG4gICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgSWYtTWF0Y2gnLFxufTtcblxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgdHJ5IHtcbiAgICBpZiAoZXZlbnQuaHR0cE1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICByZXR1cm4geyBzdGF0dXNDb2RlOiAyMDAsIGhlYWRlcnMsIGJvZHk6ICcnIH07XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IEpXVCB0b2tlbiB1c2luZyBzaGFyZWQgdXRpbGl0eVxuICAgIGNvbnN0IGF1dGhSZXN1bHQgPSB2ZXJpZnlUb2tlbihldmVudC5oZWFkZXJzLkF1dGhvcml6YXRpb24gfHwgZXZlbnQuaGVhZGVycy5hdXRob3JpemF0aW9uKTtcbiAgICBpZiAoIWF1dGhSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDAxLCAnVW5hdXRob3JpemVkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgdXNlcklkID0gYXV0aFJlc3VsdC51c2VySWQhO1xuXG4gICAgY29uc3QgbWV0aG9kID0gZXZlbnQuaHR0cE1ldGhvZDtcbiAgICBjb25zdCBwYXRoUGFyYW1ldGVycyA9IGV2ZW50LnBhdGhQYXJhbWV0ZXJzO1xuXG4gICAgbGV0IHJlcXVlc3RCb2R5ID0ge307XG4gICAgaWYgKGV2ZW50LmJvZHkgJiYgWydQT1NUJywgJ1BVVCcsICdQQVRDSCddLmluY2x1ZGVzKG1ldGhvZCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3RCb2R5ID0gSlNPTi5wYXJzZShldmVudC5ib2R5KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwMCwgJ0ludmFsaWQgSlNPTiBpbiByZXF1ZXN0IGJvZHknKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzd2l0Y2ggKG1ldGhvZCkge1xuICAgICAgY2FzZSAnR0VUJzpcbiAgICAgICAgaWYgKHBhdGhQYXJhbWV0ZXJzPy5pZCkge1xuICAgICAgICAgIHJldHVybiBhd2FpdCBnZXREb2N1bWVudChwYXRoUGFyYW1ldGVycy5pZCwgdXNlcklkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXdhaXQgZ2V0RG9jdW1lbnRzKHVzZXJJZCwgZXZlbnQucXVlcnlTdHJpbmdQYXJhbWV0ZXJzKTtcbiAgICAgIGNhc2UgJ1BPU1QnOlxuICAgICAgICByZXR1cm4gYXdhaXQgY3JlYXRlRG9jdW1lbnQodXNlcklkLCByZXF1ZXN0Qm9keSBhcyBDcmVhdGVEb2N1bWVudFJlcXVlc3QpO1xuICAgICAgY2FzZSAnUFVUJzpcbiAgICAgICAgaWYgKCFwYXRoUGFyYW1ldGVycz8uaWQpIHtcbiAgICAgICAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDAsICdEb2N1bWVudCBJRCBpcyByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhd2FpdCB1cGRhdGVEb2N1bWVudChwYXRoUGFyYW1ldGVycy5pZCwgcmVxdWVzdEJvZHkgYXMgVXBkYXRlRG9jdW1lbnRSZXF1ZXN0LCB1c2VySWQpO1xuICAgICAgY2FzZSAnUEFUQ0gnOlxuICAgICAgICBpZiAoIXBhdGhQYXJhbWV0ZXJzPy5pZCkge1xuICAgICAgICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwMCwgJ0RvY3VtZW50IElEIGlzIHJlcXVpcmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF3YWl0IHBhdGNoRG9jdW1lbnQocGF0aFBhcmFtZXRlcnMuaWQsIHJlcXVlc3RCb2R5IGFzIFBhdGNoRG9jdW1lbnRSZXF1ZXN0LCB1c2VySWQpO1xuICAgICAgY2FzZSAnREVMRVRFJzpcbiAgICAgICAgaWYgKCFwYXRoUGFyYW1ldGVycz8uaWQpIHtcbiAgICAgICAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDAsICdEb2N1bWVudCBJRCBpcyByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhd2FpdCBkZWxldGVEb2N1bWVudChwYXRoUGFyYW1ldGVycy5pZCwgdXNlcklkKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwNSwgJ01ldGhvZCBub3QgYWxsb3dlZCcpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOicsIGVycm9yKTtcbiAgICBcbiAgICAvLyBIYW5kbGUgRHluYW1vREIgc3BlY2lmaWMgZXJyb3JzXG4gICAgaWYgKGVycm9yLm5hbWUgJiYgZXJyb3IubmFtZS5pbmNsdWRlcygnRXhjZXB0aW9uJykpIHtcbiAgICAgIGNvbnN0IGRiRXJyb3IgPSBoYW5kbGVEeW5hbW9EQkVycm9yKGVycm9yKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1c0NvZGU6IGRiRXJyb3Iuc3RhdHVzQ29kZSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGRiRXJyb3IuZXJyb3IgfSksXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICBoZWFkZXJzLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHsgbWVzc2FnZTogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSB9KSxcbiAgICB9O1xuICB9XG59O1xuXG5pbnRlcmZhY2UgUXVlcnlQYXJhbXMge1xuICB0eXBlPzogc3RyaW5nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXREb2N1bWVudChkb2N1bWVudElkOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nKSB7XG4gIGNvbnN0IGRvY3VtZW50ID0gYXdhaXQgZG9jQ2xpZW50LnNlbmQobmV3IEdldENvbW1hbmQoe1xuICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuRE9DVU1FTlRTX1RBQkxFX05BTUUsXG4gICAgS2V5OiB7IGRvY3VtZW50SWQgfSxcbiAgfSkpO1xuXG4gIGlmICghZG9jdW1lbnQuSXRlbSkge1xuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwNCwgJ0RvY3VtZW50IG5vdCBmb3VuZCcpO1xuICB9XG5cbiAgaWYgKGRvY3VtZW50Lkl0ZW0udXNlcklkICE9PSB1c2VySWQpIHtcbiAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDMsICdBY2Nlc3MgZGVuaWVkJyk7XG4gIH1cblxuICByZXR1cm4gY3JlYXRlU3VjY2Vzc1Jlc3BvbnNlKGRvY3VtZW50Lkl0ZW0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXREb2N1bWVudHModXNlcklkOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zPzogUXVlcnlQYXJhbXMpIHtcbiAgLy8gVmFsaWRhdGUgdXNlcklkIHRvIHByZXZlbnQgaW5qZWN0aW9uXG4gIGlmICghdXNlcklkIHx8IHR5cGVvZiB1c2VySWQgIT09ICdzdHJpbmcnIHx8IHVzZXJJZC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB7IG1lc3NhZ2U6ICdJbnZhbGlkIHVzZXIgSUQnIH0gfSksXG4gICAgfTtcbiAgfVxuXG4gIGxldCBrZXlDb25kaXRpb25FeHByZXNzaW9uID0gJ3VzZXJJZCA9IDp1c2VySWQnO1xuICBjb25zdCBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICc6dXNlcklkJzogdXNlcklkLFxuICB9O1xuXG4gIC8vIEFkZCB0eXBlIGZpbHRlciBpZiBwcm92aWRlZCBhbmQgdmFsaWRhdGVkXG4gIGlmIChxdWVyeVBhcmFtcz8udHlwZSAmJiB2YWxpZGF0ZURvY3VtZW50VHlwZShxdWVyeVBhcmFtcy50eXBlKSkge1xuICAgIGtleUNvbmRpdGlvbkV4cHJlc3Npb24gKz0gJyBBTkQgI3R5cGUgPSA6dHlwZSc7XG4gICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlc1snOnR5cGUnXSA9IHF1ZXJ5UGFyYW1zLnR5cGU7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRvY0NsaWVudC5zZW5kKG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5ET0NVTUVOVFNfVEFCTEVfTkFNRSxcbiAgICAgIEluZGV4TmFtZTogJ3VzZXJJZC1pbmRleCcsXG4gICAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiBrZXlDb25kaXRpb25FeHByZXNzaW9uLFxuICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiBxdWVyeVBhcmFtcz8udHlwZSA/IHsgJyN0eXBlJzogJ3R5cGUnIH0gOiB1bmRlZmluZWQsXG4gICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzLFxuICAgIH0pKTtcblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICBoZWFkZXJzLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgZG9jdW1lbnRzOiByZXN1bHQuSXRlbXMgfHwgW10sXG4gICAgICAgICAgdG90YWw6IHJlc3VsdC5Db3VudCB8fCAwLFxuICAgICAgICAgIGhhc01vcmU6IGZhbHNlIC8vIFRPRE86IEltcGxlbWVudCBwYWdpbmF0aW9uIGxvZ2ljXG4gICAgICAgIH0sXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9KSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0R5bmFtb0RCIHF1ZXJ5IGVycm9yOicsIGVycm9yKTtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB7IG1lc3NhZ2U6ICdEYXRhYmFzZSBxdWVyeSBmYWlsZWQnIH0gfSksXG4gICAgfTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgQ3JlYXRlRG9jdW1lbnRSZXF1ZXN0IHtcbiAgdHlwZTogc3RyaW5nO1xuICB0aXRsZTogc3RyaW5nO1xuICBjb250ZW50Pzogc3RyaW5nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVEb2N1bWVudCh1c2VySWQ6IHN0cmluZywgYm9keTogQ3JlYXRlRG9jdW1lbnRSZXF1ZXN0KSB7XG4gIC8vIFZhbGlkYXRlIHVzZXJJZCB0byBwcmV2ZW50IGluamVjdGlvblxuICBpZiAoIXVzZXJJZCB8fCB0eXBlb2YgdXNlcklkICE9PSAnc3RyaW5nJyB8fCB1c2VySWQubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogeyBtZXNzYWdlOiAnSW52YWxpZCB1c2VyIElEJyB9IH0pLFxuICAgIH07XG4gIH1cblxuICBjb25zdCB7IHR5cGUsIHRpdGxlLCBjb250ZW50IH0gPSBib2R5O1xuXG4gIGlmICghdHlwZSB8fCAhdGl0bGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB7IG1lc3NhZ2U6ICdNaXNzaW5nIHJlcXVpcmVkIGZpZWxkcycgfSB9KSxcbiAgICB9O1xuICB9XG5cbiAgaWYgKCF2YWxpZGF0ZURvY3VtZW50VHlwZSh0eXBlKSkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBoZWFkZXJzLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHsgbWVzc2FnZTogJ0ludmFsaWQgZG9jdW1lbnQgdHlwZScgfSB9KSxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlRG9jdW1lbnREYXRhKHR5cGUgYXMgRG9jdW1lbnRUeXBlLCB0aXRsZSwgY29udGVudCk7XG4gIGlmICghdmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogeyBtZXNzYWdlOiAnVmFsaWRhdGlvbiBmYWlsZWQnLCBkZXRhaWxzOiB2YWxpZGF0aW9uLmVycm9ycyB9IH0pLFxuICAgIH07XG4gIH1cblxuICBjb25zdCBkb2N1bWVudElkID0gdXVpZHY0KCk7XG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICBjb25zdCBkb2N1bWVudCA9IHtcbiAgICBkb2N1bWVudElkLFxuICAgIHVzZXJJZCxcbiAgICB0eXBlLFxuICAgIHRpdGxlLFxuICAgIGNvbnRlbnQ6IGNvbnRlbnQgfHwgJycsXG4gICAgdmVyc2lvbjogMSxcbiAgICBjcmVhdGVkQXQ6IG5vdyxcbiAgICB1cGRhdGVkQXQ6IG5vdyxcbiAgfTtcblxuICB0cnkge1xuICAgIGF3YWl0IGRvY0NsaWVudC5zZW5kKG5ldyBQdXRDb21tYW5kKHtcbiAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuRE9DVU1FTlRTX1RBQkxFX05BTUUsXG4gICAgICBJdGVtOiBkb2N1bWVudCxcbiAgICB9KSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogMjAxLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YTogZG9jdW1lbnQsXG4gICAgICB9KSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0R5bmFtb0RCIHB1dCBlcnJvcjonLCBlcnJvcik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogeyBtZXNzYWdlOiAnRmFpbGVkIHRvIGNyZWF0ZSBkb2N1bWVudCcgfSB9KSxcbiAgICB9O1xuICB9XG59XG5cbmludGVyZmFjZSBVcGRhdGVEb2N1bWVudFJlcXVlc3Qge1xuICB0aXRsZT86IHN0cmluZztcbiAgY29udGVudD86IHN0cmluZztcbiAgdHlwZT86IHN0cmluZztcbn1cblxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlRG9jdW1lbnQoZG9jdW1lbnRJZDogc3RyaW5nLCBib2R5OiBVcGRhdGVEb2N1bWVudFJlcXVlc3QsIHVzZXJJZDogc3RyaW5nKSB7XG4gIGNvbnN0IHsgdGl0bGUsIGNvbnRlbnQsIHR5cGUgfSA9IGJvZHk7XG5cbiAgaWYgKCFkb2N1bWVudElkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogeyBtZXNzYWdlOiAnRG9jdW1lbnQgSUQgaXMgcmVxdWlyZWQnIH0gfSksXG4gICAgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGRvY3VtZW50IG93bmVyc2hpcFxuICBjb25zdCBvd25lcnNoaXBDaGVjayA9IGF3YWl0IHZlcmlmeURvY3VtZW50T3duZXJzaGlwKGRvY3VtZW50SWQsIHVzZXJJZCk7XG4gIGlmICghb3duZXJzaGlwQ2hlY2suc3VjY2Vzcykge1xuICAgIHJldHVybiBvd25lcnNoaXBDaGVjay5yZXNwb25zZTtcbiAgfVxuXG4gIGlmICghdGl0bGUgJiYgIWNvbnRlbnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB7IG1lc3NhZ2U6ICdObyBmaWVsZHMgdG8gdXBkYXRlJyB9IH0pLFxuICAgIH07XG4gIH1cblxuICAvLyBJZiB0eXBlIGlzIHByb3ZpZGVkLCB2YWxpZGF0ZSB0aGUgZG9jdW1lbnQgZGF0YVxuICBpZiAodHlwZSAmJiB0aXRsZSkge1xuICAgIGlmICghdmFsaWRhdGVEb2N1bWVudFR5cGUodHlwZSkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHsgbWVzc2FnZTogJ0ludmFsaWQgZG9jdW1lbnQgdHlwZScgfSB9KSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlRG9jdW1lbnREYXRhKHR5cGUgYXMgRG9jdW1lbnRUeXBlLCB0aXRsZSwgY29udGVudCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLmlzVmFsaWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHsgbWVzc2FnZTogJ1ZhbGlkYXRpb24gZmFpbGVkJywgZGV0YWlsczogdmFsaWRhdGlvbi5lcnJvcnMgfSB9KSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgY29uc3QgdXBkYXRlRXhwcmVzc2lvbjogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgbnVtYmVyPiA9IHt9O1xuXG4gIGlmICh0aXRsZSkge1xuICAgIHVwZGF0ZUV4cHJlc3Npb24ucHVzaCgndGl0bGUgPSA6dGl0bGUnKTtcbiAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzWyc6dGl0bGUnXSA9IHRpdGxlO1xuICB9XG5cbiAgaWYgKGNvbnRlbnQpIHtcbiAgICB1cGRhdGVFeHByZXNzaW9uLnB1c2goJ2NvbnRlbnQgPSA6Y29udGVudCcpO1xuICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzpjb250ZW50J10gPSBjb250ZW50O1xuICB9XG5cbiAgdXBkYXRlRXhwcmVzc2lvbi5wdXNoKCd1cGRhdGVkQXQgPSA6dXBkYXRlZEF0JywgJyN2ZXJzaW9uID0gI3ZlcnNpb24gKyA6aW5jJyk7XG4gIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzp1cGRhdGVkQXQnXSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlc1snOmluYyddID0gMTtcblxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkb2NDbGllbnQuc2VuZChuZXcgVXBkYXRlQ29tbWFuZCh7XG4gICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5ET0NVTUVOVFNfVEFCTEVfTkFNRSxcbiAgICBLZXk6IHsgZG9jdW1lbnRJZCB9LFxuICAgIFVwZGF0ZUV4cHJlc3Npb246IGBTRVQgJHt1cGRhdGVFeHByZXNzaW9uLmpvaW4oJywgJyl9YCxcbiAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHsgJyN2ZXJzaW9uJzogJ3ZlcnNpb24nIH0sXG4gICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyxcbiAgICBSZXR1cm5WYWx1ZXM6ICdBTExfTkVXJyxcbiAgfSkpO1xuXG4gIHJldHVybiB7XG4gICAgc3RhdHVzQ29kZTogMjAwLFxuICAgIGhlYWRlcnMsXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHJlc3VsdC5BdHRyaWJ1dGVzLFxuICAgIH0pLFxuICB9O1xufVxuXG5pbnRlcmZhY2UgUGF0Y2hEb2N1bWVudFJlcXVlc3Qge1xuICB0aXRsZT86IHN0cmluZztcbiAgY29udGVudD86IHN0cmluZztcbiAgdmVyc2lvbj86IG51bWJlcjtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcGF0Y2hEb2N1bWVudChkb2N1bWVudElkOiBzdHJpbmcsIGJvZHk6IFBhdGNoRG9jdW1lbnRSZXF1ZXN0LCB1c2VySWQ6IHN0cmluZykge1xuICBjb25zdCB7IHRpdGxlLCBjb250ZW50LCB2ZXJzaW9uOiBjbGllbnRWZXJzaW9uIH0gPSBib2R5O1xuXG4gIGlmICghdGl0bGUgJiYgIWNvbnRlbnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB7IG1lc3NhZ2U6ICdObyBmaWVsZHMgdG8gdXBkYXRlJyB9IH0pLFxuICAgIH07XG4gIH1cblxuICAvLyBDaGVjayBkb2N1bWVudCBvd25lcnNoaXBcbiAgY29uc3Qgb3duZXJzaGlwQ2hlY2sgPSBhd2FpdCB2ZXJpZnlEb2N1bWVudE93bmVyc2hpcChkb2N1bWVudElkLCB1c2VySWQpO1xuICBpZiAoIW93bmVyc2hpcENoZWNrLnN1Y2Nlc3MpIHtcbiAgICByZXR1cm4gb3duZXJzaGlwQ2hlY2sucmVzcG9uc2U7XG4gIH1cblxuICAvLyBHZXQgY3VycmVudCBkb2N1bWVudCBmb3IgdmVyc2lvbiBjaGVja1xuICBjb25zdCBjdXJyZW50RG9jID0gYXdhaXQgZG9jQ2xpZW50LnNlbmQobmV3IEdldENvbW1hbmQoe1xuICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuRE9DVU1FTlRTX1RBQkxFX05BTUUsXG4gICAgS2V5OiB7IGRvY3VtZW50SWQgfSxcbiAgfSkpO1xuXG4gIGlmICghY3VycmVudERvYy5JdGVtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwNCxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogeyBtZXNzYWdlOiAnRG9jdW1lbnQgbm90IGZvdW5kJyB9IH0pLFxuICAgIH07XG4gIH1cblxuICAvLyBWZXJzaW9uIGNvbmZsaWN0IGNoZWNrIGZvciBjb25jdXJyZW50IGVkaXRpbmdcbiAgaWYgKGNsaWVudFZlcnNpb24gJiYgY3VycmVudERvYy5JdGVtLnZlcnNpb24gIT09IGNsaWVudFZlcnNpb24pIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNDA5LFxuICAgICAgaGVhZGVycyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLCBcbiAgICAgICAgZXJyb3I6IHsgXG4gICAgICAgICAgbWVzc2FnZTogJ0RvY3VtZW50IGhhcyBiZWVuIG1vZGlmaWVkIGJ5IGFub3RoZXIgdXNlcicsXG4gICAgICAgICAgY3VycmVudFZlcnNpb246IGN1cnJlbnREb2MuSXRlbS52ZXJzaW9uLFxuICAgICAgICAgIGNvbmZsaWN0RGF0YTogY3VycmVudERvYy5JdGVtXG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgIH07XG4gIH1cblxuICBjb25zdCB1cGRhdGVFeHByZXNzaW9uOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXI+ID0ge307XG5cbiAgaWYgKHRpdGxlICE9PSB1bmRlZmluZWQpIHtcbiAgICB1cGRhdGVFeHByZXNzaW9uLnB1c2goJ3RpdGxlID0gOnRpdGxlJyk7XG4gICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlc1snOnRpdGxlJ10gPSB0aXRsZTtcbiAgfVxuXG4gIGlmIChjb250ZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICB1cGRhdGVFeHByZXNzaW9uLnB1c2goJ2NvbnRlbnQgPSA6Y29udGVudCcpO1xuICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzpjb250ZW50J10gPSBjb250ZW50O1xuICB9XG5cbiAgdXBkYXRlRXhwcmVzc2lvbi5wdXNoKCd1cGRhdGVkQXQgPSA6dXBkYXRlZEF0JywgJyN2ZXJzaW9uID0gI3ZlcnNpb24gKyA6aW5jJyk7XG4gIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzp1cGRhdGVkQXQnXSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlc1snOmluYyddID0gMTtcblxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkb2NDbGllbnQuc2VuZChuZXcgVXBkYXRlQ29tbWFuZCh7XG4gICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5ET0NVTUVOVFNfVEFCTEVfTkFNRSxcbiAgICBLZXk6IHsgZG9jdW1lbnRJZCB9LFxuICAgIFVwZGF0ZUV4cHJlc3Npb246IGBTRVQgJHt1cGRhdGVFeHByZXNzaW9uLmpvaW4oJywgJyl9YCxcbiAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHsgJyN2ZXJzaW9uJzogJ3ZlcnNpb24nIH0sXG4gICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyxcbiAgICBSZXR1cm5WYWx1ZXM6ICdBTExfTkVXJyxcbiAgfSkpO1xuXG4gIHJldHVybiB7XG4gICAgc3RhdHVzQ29kZTogMjAwLFxuICAgIGhlYWRlcnMsXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHJlc3VsdC5BdHRyaWJ1dGVzLFxuICAgIH0pLFxuICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWxldGVEb2N1bWVudChkb2N1bWVudElkOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nKSB7XG4gIGlmICghZG9jdW1lbnRJZCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBoZWFkZXJzLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHsgbWVzc2FnZTogJ0RvY3VtZW50IElEIGlzIHJlcXVpcmVkJyB9IH0pLFxuICAgIH07XG4gIH1cblxuICAvLyBDaGVjayBkb2N1bWVudCBvd25lcnNoaXBcbiAgY29uc3Qgb3duZXJzaGlwQ2hlY2sgPSBhd2FpdCB2ZXJpZnlEb2N1bWVudE93bmVyc2hpcChkb2N1bWVudElkLCB1c2VySWQpO1xuICBpZiAoIW93bmVyc2hpcENoZWNrLnN1Y2Nlc3MpIHtcbiAgICByZXR1cm4gb3duZXJzaGlwQ2hlY2sucmVzcG9uc2U7XG4gIH1cblxuICBhd2FpdCBkb2NDbGllbnQuc2VuZChuZXcgRGVsZXRlQ29tbWFuZCh7XG4gICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5ET0NVTUVOVFNfVEFCTEVfTkFNRSxcbiAgICBLZXk6IHsgZG9jdW1lbnRJZCB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHtcbiAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgaGVhZGVycyxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgbWVzc2FnZTogJ0RvY3VtZW50IGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICB9KSxcbiAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdmVyaWZ5RG9jdW1lbnRPd25lcnNoaXAoZG9jdW1lbnRJZDogc3RyaW5nLCB1c2VySWQ6IHN0cmluZykge1xuICBjb25zdCBkb2N1bWVudCA9IGF3YWl0IGRvY0NsaWVudC5zZW5kKG5ldyBHZXRDb21tYW5kKHtcbiAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkRPQ1VNRU5UU19UQUJMRV9OQU1FLFxuICAgIEtleTogeyBkb2N1bWVudElkIH0sXG4gIH0pKTtcblxuICBpZiAoIWRvY3VtZW50Lkl0ZW0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICByZXNwb25zZToge1xuICAgICAgICBzdGF0dXNDb2RlOiA0MDQsXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB7IG1lc3NhZ2U6ICdEb2N1bWVudCBub3QgZm91bmQnIH0gfSksXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGlmIChkb2N1bWVudC5JdGVtLnVzZXJJZCAhPT0gdXNlcklkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgcmVzcG9uc2U6IHtcbiAgICAgICAgc3RhdHVzQ29kZTogNDAzLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogeyBtZXNzYWdlOiAnQWNjZXNzIGRlbmllZDogWW91IGNhbiBvbmx5IG1vZGlmeSB5b3VyIG93biBkb2N1bWVudHMnIH0gfSksXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRvY3VtZW50OiBkb2N1bWVudC5JdGVtIH07XG59XG5cbiJdfQ==