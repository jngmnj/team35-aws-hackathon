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
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const bcrypt = __importStar(require("bcryptjs"));
const jwt_1 = require("../../shared/jwt");
const uuid_1 = require("uuid");
const database_1 = require("../../shared/database");
const utils_1 = require("../../shared/utils");
const validation_1 = require("../../shared/validation");
const error_handler_1 = require("../../shared/error-handler");
const handler = async (event) => {
    try {
        const path = event.path;
        const method = event.httpMethod;
        if (method === 'OPTIONS') {
            return { statusCode: 200, headers: {}, body: '' };
        }
        let body = {};
        if (event.body) {
            try {
                body = JSON.parse(event.body);
            }
            catch (error) {
                return (0, utils_1.createErrorResponse)(400, 'Invalid JSON in request body');
            }
        }
        if (path.endsWith('/register')) {
            return await handleRegister(body);
        }
        else if (path.endsWith('/login')) {
            return await handleLogin(body);
        }
        return (0, utils_1.createErrorResponse)(404, 'Not found');
    }
    catch (error) {
        console.error('Error:', error);
        // Handle DynamoDB specific errors
        if (error.name && error.name.includes('Exception')) {
            const dbError = (0, error_handler_1.handleDynamoDBError)(error);
            return {
                statusCode: dbError.statusCode,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, error: dbError.error }),
            };
        }
        return (0, utils_1.createErrorResponse)(500, 'Internal server error');
    }
};
exports.handler = handler;
async function handleRegister(body) {
    const { email, password, name } = body;
    if (!email || !password || !name) {
        return (0, utils_1.createErrorResponse)(400, 'Missing required fields');
    }
    if (!(0, validation_1.validateEmail)(email)) {
        return (0, utils_1.createErrorResponse)(400, 'Invalid email format');
    }
    if (password.length < 6) {
        return (0, utils_1.createErrorResponse)(400, 'Password must be at least 6 characters');
    }
    const existingUser = await database_1.docClient.send(new lib_dynamodb_1.GetCommand({
        TableName: database_1.TABLE_NAMES.USERS,
        Key: { userId: email },
    }));
    if (existingUser.Item) {
        return (0, utils_1.createErrorResponse)(400, 'User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = (0, uuid_1.v4)();
    await database_1.docClient.send(new lib_dynamodb_1.PutCommand({
        TableName: database_1.TABLE_NAMES.USERS,
        Item: {
            userId,
            email,
            name,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    }));
    const token = (0, jwt_1.generateToken)({ userId, email });
    return (0, utils_1.createSuccessResponse)({ userId, email, name, token }, 201);
}
async function handleLogin(body) {
    const { email, password } = body;
    if (!email || !password) {
        return (0, utils_1.createErrorResponse)(400, 'Email and password are required');
    }
    if (!(0, validation_1.validateEmail)(email)) {
        return (0, utils_1.createErrorResponse)(400, 'Invalid email format');
    }
    const result = await database_1.docClient.send(new lib_dynamodb_1.GetCommand({
        TableName: database_1.TABLE_NAMES.USERS,
        Key: { userId: email },
    }));
    if (!result.Item) {
        return (0, utils_1.createErrorResponse)(401, 'Invalid credentials');
    }
    const isValid = await bcrypt.compare(password, result.Item.password);
    if (!isValid) {
        return (0, utils_1.createErrorResponse)(401, 'Invalid credentials');
    }
    const token = (0, jwt_1.generateToken)({
        userId: result.Item.userId,
        email: result.Item.email
    });
    return (0, utils_1.createSuccessResponse)({
        userId: result.Item.userId,
        email: result.Item.email,
        name: result.Item.name,
        token,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZnVuY3Rpb25zL2F1dGgvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esd0RBQStEO0FBQy9ELGlEQUFtQztBQUNuQywwQ0FBaUQ7QUFDakQsK0JBQW9DO0FBQ3BDLG9EQUErRDtBQUMvRCw4Q0FBZ0Y7QUFDaEYsd0RBQXdEO0FBQ3hELDhEQUFpRTtBQUUxRCxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBMkIsRUFBa0MsRUFBRTtJQUMzRixJQUFJLENBQUM7UUFDSCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7UUFFaEMsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDekIsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUVELElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDO2dCQUNILElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoQyxDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDZixPQUFPLElBQUEsMkJBQW1CLEVBQUMsR0FBRyxFQUFFLDhCQUE4QixDQUFDLENBQUM7WUFDbEUsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUMvQixPQUFPLE1BQU0sY0FBYyxDQUFDLElBQXVCLENBQUMsQ0FBQztRQUN2RCxDQUFDO2FBQU0sSUFB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QixDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELE1BQU0sS0FBSyxHQUFHLElBQUEsbUJBQWEsRUFBQztRQUMxQixNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNO1FBQzFCLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUs7S0FDekIsQ0FBQyxDQUFDO0lBRUgsT0FBTyxJQUFBLDZCQUFxQixFQUFDO1FBQzNCLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU07UUFDMUIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSztRQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJO1FBQ3RCLEtBQUs7S0FDTixDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgUHV0Q29tbWFuZCwgR2V0Q29tbWFuZCB9IGZyb20gJ0Bhd3Mtc2RrL2xpYi1keW5hbW9kYic7XG5pbXBvcnQgKiBhcyBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVUb2tlbiB9IGZyb20gJy4uLy4uL3NoYXJlZC9qd3QnO1xuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XG5pbXBvcnQgeyBkb2NDbGllbnQsIFRBQkxFX05BTUVTIH0gZnJvbSAnLi4vLi4vc2hhcmVkL2RhdGFiYXNlJztcbmltcG9ydCB7IGNyZWF0ZUVycm9yUmVzcG9uc2UsIGNyZWF0ZVN1Y2Nlc3NSZXNwb25zZSB9IGZyb20gJy4uLy4uL3NoYXJlZC91dGlscyc7XG5pbXBvcnQgeyB2YWxpZGF0ZUVtYWlsIH0gZnJvbSAnLi4vLi4vc2hhcmVkL3ZhbGlkYXRpb24nO1xuaW1wb3J0IHsgaGFuZGxlRHluYW1vREJFcnJvciB9IGZyb20gJy4uLy4uL3NoYXJlZC9lcnJvci1oYW5kbGVyJztcblxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXRoID0gZXZlbnQucGF0aDtcbiAgICBjb25zdCBtZXRob2QgPSBldmVudC5odHRwTWV0aG9kO1xuXG4gICAgaWYgKG1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICByZXR1cm4geyBzdGF0dXNDb2RlOiAyMDAsIGhlYWRlcnM6IHt9LCBib2R5OiAnJyB9O1xuICAgIH1cblxuICAgIGxldCBib2R5ID0ge307XG4gICAgaWYgKGV2ZW50LmJvZHkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGJvZHkgPSBKU09OLnBhcnNlKGV2ZW50LmJvZHkpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDAwLCAnSW52YWxpZCBKU09OIGluIHJlcXVlc3QgYm9keScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwYXRoLmVuZHNXaXRoKCcvcmVnaXN0ZXInKSkge1xuICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVJlZ2lzdGVyKGJvZHkgYXMgUmVnaXN0ZXJSZXF1ZXN0KTtcbiAgICB9IGVsc2UgaWYgKHBhdGguZW5kc1dpdGgoJy9sb2dpbicpKSB7XG4gICAgICByZXR1cm4gYXdhaXQgaGFuZGxlTG9naW4oYm9keSBhcyBMb2dpblJlcXVlc3QpO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwNCwgJ05vdCBmb3VuZCcpO1xuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3I6JywgZXJyb3IpO1xuICAgIFxuICAgIC8vIEhhbmRsZSBEeW5hbW9EQiBzcGVjaWZpYyBlcnJvcnNcbiAgICBpZiAoZXJyb3IubmFtZSAmJiBlcnJvci5uYW1lLmluY2x1ZGVzKCdFeGNlcHRpb24nKSkge1xuICAgICAgY29uc3QgZGJFcnJvciA9IGhhbmRsZUR5bmFtb0RCRXJyb3IoZXJyb3IpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdHVzQ29kZTogZGJFcnJvci5zdGF0dXNDb2RlLFxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGRiRXJyb3IuZXJyb3IgfSksXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDUwMCwgJ0ludGVybmFsIHNlcnZlciBlcnJvcicpO1xuICB9XG59O1xuXG5pbnRlcmZhY2UgUmVnaXN0ZXJSZXF1ZXN0IHtcbiAgZW1haWw6IHN0cmluZztcbiAgcGFzc3dvcmQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVSZWdpc3Rlcihib2R5OiBSZWdpc3RlclJlcXVlc3QpIHtcbiAgY29uc3QgeyBlbWFpbCwgcGFzc3dvcmQsIG5hbWUgfSA9IGJvZHk7XG5cbiAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQgfHwgIW5hbWUpIHtcbiAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDAsICdNaXNzaW5nIHJlcXVpcmVkIGZpZWxkcycpO1xuICB9XG5cbiAgaWYgKCF2YWxpZGF0ZUVtYWlsKGVtYWlsKSkge1xuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwMCwgJ0ludmFsaWQgZW1haWwgZm9ybWF0Jyk7XG4gIH1cblxuICBpZiAocGFzc3dvcmQubGVuZ3RoIDwgNikge1xuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwMCwgJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgNiBjaGFyYWN0ZXJzJyk7XG4gIH1cblxuICBjb25zdCBleGlzdGluZ1VzZXIgPSBhd2FpdCBkb2NDbGllbnQuc2VuZChuZXcgR2V0Q29tbWFuZCh7XG4gICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FUy5VU0VSUyxcbiAgICBLZXk6IHsgdXNlcklkOiBlbWFpbCB9LFxuICB9KSk7XG5cbiAgaWYgKGV4aXN0aW5nVXNlci5JdGVtKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDAwLCAnVXNlciBhbHJlYWR5IGV4aXN0cycpO1xuICB9XG5cbiAgY29uc3QgaGFzaGVkUGFzc3dvcmQgPSBhd2FpdCBiY3J5cHQuaGFzaChwYXNzd29yZCwgMTApO1xuICBjb25zdCB1c2VySWQgPSB1dWlkdjQoKTtcblxuICBhd2FpdCBkb2NDbGllbnQuc2VuZChuZXcgUHV0Q29tbWFuZCh7XG4gICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FUy5VU0VSUyxcbiAgICBJdGVtOiB7XG4gICAgICB1c2VySWQsXG4gICAgICBlbWFpbCxcbiAgICAgIG5hbWUsXG4gICAgICBwYXNzd29yZDogaGFzaGVkUGFzc3dvcmQsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH0sXG4gIH0pKTtcblxuICBjb25zdCB0b2tlbiA9IGdlbmVyYXRlVG9rZW4oeyB1c2VySWQsIGVtYWlsIH0pO1xuXG4gIHJldHVybiBjcmVhdGVTdWNjZXNzUmVzcG9uc2UoeyB1c2VySWQsIGVtYWlsLCBuYW1lLCB0b2tlbiB9LCAyMDEpO1xufVxuXG5pbnRlcmZhY2UgTG9naW5SZXF1ZXN0IHtcbiAgZW1haWw6IHN0cmluZztcbiAgcGFzc3dvcmQ6IHN0cmluZztcbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTG9naW4oYm9keTogTG9naW5SZXF1ZXN0KSB7XG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSBib2R5O1xuXG4gIGlmICghZW1haWwgfHwgIXBhc3N3b3JkKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDAwLCAnRW1haWwgYW5kIHBhc3N3b3JkIGFyZSByZXF1aXJlZCcpO1xuICB9XG5cbiAgaWYgKCF2YWxpZGF0ZUVtYWlsKGVtYWlsKSkge1xuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwMCwgJ0ludmFsaWQgZW1haWwgZm9ybWF0Jyk7XG4gIH1cblxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkb2NDbGllbnQuc2VuZChuZXcgR2V0Q29tbWFuZCh7XG4gICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FUy5VU0VSUyxcbiAgICBLZXk6IHsgdXNlcklkOiBlbWFpbCB9LFxuICB9KSk7XG5cbiAgaWYgKCFyZXN1bHQuSXRlbSkge1xuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwMSwgJ0ludmFsaWQgY3JlZGVudGlhbHMnKTtcbiAgfVxuXG4gIGNvbnN0IGlzVmFsaWQgPSBhd2FpdCBiY3J5cHQuY29tcGFyZShwYXNzd29yZCwgcmVzdWx0Lkl0ZW0ucGFzc3dvcmQpO1xuICBpZiAoIWlzVmFsaWQpIHtcbiAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDEsICdJbnZhbGlkIGNyZWRlbnRpYWxzJyk7XG4gIH1cblxuICBjb25zdCB0b2tlbiA9IGdlbmVyYXRlVG9rZW4oeyBcbiAgICB1c2VySWQ6IHJlc3VsdC5JdGVtLnVzZXJJZCwgXG4gICAgZW1haWw6IHJlc3VsdC5JdGVtLmVtYWlsIFxuICB9KTtcblxuICByZXR1cm4gY3JlYXRlU3VjY2Vzc1Jlc3BvbnNlKHtcbiAgICB1c2VySWQ6IHJlc3VsdC5JdGVtLnVzZXJJZCxcbiAgICBlbWFpbDogcmVzdWx0Lkl0ZW0uZW1haWwsXG4gICAgbmFtZTogcmVzdWx0Lkl0ZW0ubmFtZSxcbiAgICB0b2tlbixcbiAgfSk7XG59Il19