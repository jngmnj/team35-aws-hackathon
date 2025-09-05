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
const jwt_1 = require("./shared/jwt");
const uuid_1 = require("uuid");
const database_1 = require("./shared/database");
const utils_1 = require("./shared/utils");
const validation_1 = require("./shared/validation");
const error_handler_1 = require("./shared/error-handler");
const handler = async (event) => {
    try {
        const path = event.path;
        const method = event.httpMethod;
        if (method === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
                body: ''
            };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZnVuY3Rpb25zL2F1dGgvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esd0RBQStEO0FBQy9ELGlEQUFtQztBQUNuQyxzQ0FBNkM7QUFDN0MsK0JBQW9DO0FBQ3BDLGdEQUEyRDtBQUMzRCwwQ0FBNEU7QUFDNUUsb0RBQW9EO0FBQ3BELDBEQUE2RDtBQUV0RCxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBMkIsRUFBa0MsRUFBRTtJQUMzRixJQUFJLENBQUM7UUFDSCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7UUFFaEMsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDekIsT0FBTztnQkFDTCxVQUFVLEVBQUUsR0FBRztnQkFDZixPQUFPLEVBQUU7b0JBQ1AsNkJBQTZCLEVBQUUsR0FBRztvQkFDbEMsOEJBQThCLEVBQUUsaUNBQWlDO29CQUNqRSw4QkFBOEIsRUFBRSw2QkFBNkI7aUJBQzlEO2dCQUNELElBQUksRUFBRSxFQUFFO2FBQ1QsQ0FBQztRQUNKLENBQUM7UUFFRCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQztnQkFDSCxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEMsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2YsT0FBTyxJQUFBLDJCQUFtQixFQUFDLEdBQUcsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdB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LENBQUM7SUFDckUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2IsT0FBTyxJQUFBLDJCQUFtQixFQUFDLEdBQUcsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxNQUFNLEtBQUssR0FBRyxJQUFBLG1CQUFhLEVBQUM7UUFDMUIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTTtRQUMxQixLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLO0tBQ3pCLENBQUMsQ0FBQztJQUVILE9BQU8sSUFBQSw2QkFBcUIsRUFBQztRQUMzQixNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNO1FBQzFCLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUs7UUFDeEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSTtRQUN0QixLQUFLO0tBQ04sQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUV2ZW50LCBBUElHYXRld2F5UHJveHlSZXN1bHQgfSBmcm9tICdhd3MtbGFtYmRhJztcbmltcG9ydCB7IFB1dENvbW1hbmQsIEdldENvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9saWItZHluYW1vZGInO1xuaW1wb3J0ICogYXMgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJztcbmltcG9ydCB7IGdlbmVyYXRlVG9rZW4gfSBmcm9tICcuL3NoYXJlZC9qd3QnO1xuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XG5pbXBvcnQgeyBkb2NDbGllbnQsIFRBQkxFX05BTUVTIH0gZnJvbSAnLi9zaGFyZWQvZGF0YWJhc2UnO1xuaW1wb3J0IHsgY3JlYXRlRXJyb3JSZXNwb25zZSwgY3JlYXRlU3VjY2Vzc1Jlc3BvbnNlIH0gZnJvbSAnLi9zaGFyZWQvdXRpbHMnO1xuaW1wb3J0IHsgdmFsaWRhdGVFbWFpbCB9IGZyb20gJy4vc2hhcmVkL3ZhbGlkYXRpb24nO1xuaW1wb3J0IHsgaGFuZGxlRHluYW1vREJFcnJvciB9IGZyb20gJy4vc2hhcmVkL2Vycm9yLWhhbmRsZXInO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnQpOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHBhdGggPSBldmVudC5wYXRoO1xuICAgIGNvbnN0IG1ldGhvZCA9IGV2ZW50Lmh0dHBNZXRob2Q7XG5cbiAgICBpZiAobWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgT1BUSU9OUycsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogJydcbiAgICAgIH07XG4gICAgfVxuXG4gICAgbGV0IGJvZHkgPSB7fTtcbiAgICBpZiAoZXZlbnQuYm9keSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYm9keSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDAsICdJbnZhbGlkIEpTT04gaW4gcmVxdWVzdCBib2R5Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBhdGguZW5kc1dpdGgoJy9yZWdpc3RlcicpKSB7XG4gICAgICByZXR1cm4gYXdhaXQgaGFuZGxlUmVnaXN0ZXIoYm9keSBhcyBSZWdpc3RlclJlcXVlc3QpO1xuICAgIH0gZWxzZSBpZiAocGF0aC5lbmRzV2l0aCgnL2xvZ2luJykpIHtcbiAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVMb2dpbihib2R5IGFzIExvZ2luUmVxdWVzdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDA0LCAnTm90IGZvdW5kJyk7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvcjonLCBlcnJvcik7XG4gICAgXG4gICAgLy8gSGFuZGxlIER5bmFtb0RCIHNwZWNpZmljIGVycm9yc1xuICAgIGlmIChlcnJvci5uYW1lICYmIGVycm9yLm5hbWUuaW5jbHVkZXMoJ0V4Y2VwdGlvbicpKSB7XG4gICAgICBjb25zdCBkYkVycm9yID0gaGFuZGxlRHluYW1vREJFcnJvcihlcnJvcik7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXNDb2RlOiBkYkVycm9yLnN0YXR1c0NvZGUsXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJywgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZGJFcnJvci5lcnJvciB9KSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNTAwLCAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyk7XG4gIH1cbn07XG5cbmludGVyZmFjZSBSZWdpc3RlclJlcXVlc3Qge1xuICBlbWFpbDogc3RyaW5nO1xuICBwYXNzd29yZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlZ2lzdGVyKGJvZHk6IFJlZ2lzdGVyUmVxdWVzdCkge1xuICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCwgbmFtZSB9ID0gYm9keTtcblxuICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCB8fCAhbmFtZSkge1xuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwMCwgJ01pc3NpbmcgcmVxdWlyZWQgZmllbGRzJyk7XG4gIH1cblxuICBpZiAoIXZhbGlkYXRlRW1haWwoZW1haWwpKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDAwLCAnSW52YWxpZCBlbWFpbCBmb3JtYXQnKTtcbiAgfVxuXG4gIGlmIChwYXNzd29yZC5sZW5ndGggPCA2KSB7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDAwLCAnUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA2IGNoYXJhY3RlcnMnKTtcbiAgfVxuXG4gIGNvbnN0IGV4aXN0aW5nVXNlciA9IGF3YWl0IGRvY0NsaWVudC5zZW5kKG5ldyBHZXRDb21tYW5kKHtcbiAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUVTLlVTRVJTLFxuICAgIEtleTogeyB1c2VySWQ6IGVtYWlsIH0sXG4gIH0pKTtcblxuICBpZiAoZXhpc3RpbmdVc2VyLkl0ZW0pIHtcbiAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDAsICdVc2VyIGFscmVhZHkgZXhpc3RzJyk7XG4gIH1cblxuICBjb25zdCBoYXNoZWRQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5oYXNoKHBhc3N3b3JkLCAxMCk7XG4gIGNvbnN0IHVzZXJJZCA9IHV1aWR2NCgpO1xuXG4gIGF3YWl0IGRvY0NsaWVudC5zZW5kKG5ldyBQdXRDb21tYW5kKHtcbiAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUVTLlVTRVJTLFxuICAgIEl0ZW06IHtcbiAgICAgIHVzZXJJZCxcbiAgICAgIGVtYWlsLFxuICAgICAgbmFtZSxcbiAgICAgIHBhc3N3b3JkOiBoYXNoZWRQYXNzd29yZCxcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfSxcbiAgfSkpO1xuXG4gIGNvbnN0IHRva2VuID0gZ2VuZXJhdGVUb2tlbih7IHVzZXJJZCwgZW1haWwgfSk7XG5cbiAgcmV0dXJuIGNyZWF0ZVN1Y2Nlc3NSZXNwb25zZSh7IHVzZXJJZCwgZW1haWwsIG5hbWUsIHRva2VuIH0sIDIwMSk7XG59XG5cbmludGVyZmFjZSBMb2dpblJlcXVlc3Qge1xuICBlbWFpbDogc3RyaW5nO1xuICBwYXNzd29yZDogc3RyaW5nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVMb2dpbihib2R5OiBMb2dpblJlcXVlc3QpIHtcbiAgY29uc3QgeyBlbWFpbCwgcGFzc3dvcmQgfSA9IGJvZHk7XG5cbiAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQpIHtcbiAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDAsICdFbWFpbCBhbmQgcGFzc3dvcmQgYXJlIHJlcXVpcmVkJyk7XG4gIH1cblxuICBpZiAoIXZhbGlkYXRlRW1haWwoZW1haWwpKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDAwLCAnSW52YWxpZCBlbWFpbCBmb3JtYXQnKTtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRvY0NsaWVudC5zZW5kKG5ldyBHZXRDb21tYW5kKHtcbiAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUVTLlVTRVJTLFxuICAgIEtleTogeyB1c2VySWQ6IGVtYWlsIH0sXG4gIH0pKTtcblxuICBpZiAoIXJlc3VsdC5JdGVtKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDAxLCAnSW52YWxpZCBjcmVkZW50aWFscycpO1xuICB9XG5cbiAgY29uc3QgaXNWYWxpZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCByZXN1bHQuSXRlbS5wYXNzd29yZCk7XG4gIGlmICghaXNWYWxpZCkge1xuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwMSwgJ0ludmFsaWQgY3JlZGVudGlhbHMnKTtcbiAgfVxuXG4gIGNvbnN0IHRva2VuID0gZ2VuZXJhdGVUb2tlbih7IFxuICAgIHVzZXJJZDogcmVzdWx0Lkl0ZW0udXNlcklkLCBcbiAgICBlbWFpbDogcmVzdWx0Lkl0ZW0uZW1haWwgXG4gIH0pO1xuXG4gIHJldHVybiBjcmVhdGVTdWNjZXNzUmVzcG9uc2Uoe1xuICAgIHVzZXJJZDogcmVzdWx0Lkl0ZW0udXNlcklkLFxuICAgIGVtYWlsOiByZXN1bHQuSXRlbS5lbWFpbCxcbiAgICBuYW1lOiByZXN1bHQuSXRlbS5uYW1lLFxuICAgIHRva2VuLFxuICB9KTtcbn0iXX0=