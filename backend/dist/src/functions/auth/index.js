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
const handler = async (event) => {
    try {
        const path = event.path;
        const method = event.httpMethod;
        if (method === 'OPTIONS') {
            return { statusCode: 200, headers: {}, body: '' };
        }
        const body = JSON.parse(event.body || '{}');
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
        return (0, utils_1.createErrorResponse)(500, 'Internal server error');
    }
};
exports.handler = handler;
async function handleRegister(body) {
    const { email, password, name } = body;
    if (!email || !password || !name) {
        return (0, utils_1.createErrorResponse)(400, 'Missing required fields');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZnVuY3Rpb25zL2F1dGgvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esd0RBQStEO0FBQy9ELGlEQUFtQztBQUNuQywwQ0FBaUQ7QUFDakQsK0JBQW9DO0FBQ3BDLG9EQUErRDtBQUMvRCw4Q0FBZ0Y7QUFFekUsTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQTJCLEVBQWtDLEVBQUU7SUFDM0YsSUFBSSxDQUFDO1FBQ0gsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztRQUN4QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO1FBRWhDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3pCLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ3BELENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7UUFFNUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7WUFDL0IsT0FBTyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxDQUFDO2FBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDbkMsT0FBTyxNQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRUQsT0FBTyxJQUFBLDJCQUFtQixFQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENB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S0FBSztLQUN6QixDQUFDLENBQUM7SUFFSCxPQUFPLElBQUEsNkJBQXFCLEVBQUM7UUFDM0IsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTTtRQUMxQixLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLO1FBQ3hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUk7UUFDdEIsS0FBSztLQUNOLENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBQdXRDb21tYW5kLCBHZXRDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvbGliLWR5bmFtb2RiJztcbmltcG9ydCAqIGFzIGJjcnlwdCBmcm9tICdiY3J5cHRqcyc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRva2VuIH0gZnJvbSAnLi4vLi4vc2hhcmVkL2p3dCc7XG5pbXBvcnQgeyB2NCBhcyB1dWlkdjQgfSBmcm9tICd1dWlkJztcbmltcG9ydCB7IGRvY0NsaWVudCwgVEFCTEVfTkFNRVMgfSBmcm9tICcuLi8uLi9zaGFyZWQvZGF0YWJhc2UnO1xuaW1wb3J0IHsgY3JlYXRlRXJyb3JSZXNwb25zZSwgY3JlYXRlU3VjY2Vzc1Jlc3BvbnNlIH0gZnJvbSAnLi4vLi4vc2hhcmVkL3V0aWxzJztcblxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXRoID0gZXZlbnQucGF0aDtcbiAgICBjb25zdCBtZXRob2QgPSBldmVudC5odHRwTWV0aG9kO1xuXG4gICAgaWYgKG1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICByZXR1cm4geyBzdGF0dXNDb2RlOiAyMDAsIGhlYWRlcnM6IHt9LCBib2R5OiAnJyB9O1xuICAgIH1cblxuICAgIGNvbnN0IGJvZHkgPSBKU09OLnBhcnNlKGV2ZW50LmJvZHkgfHwgJ3t9Jyk7XG5cbiAgICBpZiAocGF0aC5lbmRzV2l0aCgnL3JlZ2lzdGVyJykpIHtcbiAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVSZWdpc3Rlcihib2R5KTtcbiAgICB9IGVsc2UgaWYgKHBhdGguZW5kc1dpdGgoJy9sb2dpbicpKSB7XG4gICAgICByZXR1cm4gYXdhaXQgaGFuZGxlTG9naW4oYm9keSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDA0LCAnTm90IGZvdW5kJyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3I6JywgZXJyb3IpO1xuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDUwMCwgJ0ludGVybmFsIHNlcnZlciBlcnJvcicpO1xuICB9XG59O1xuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVSZWdpc3Rlcihib2R5OiBhbnkpIHtcbiAgY29uc3QgeyBlbWFpbCwgcGFzc3dvcmQsIG5hbWUgfSA9IGJvZHk7XG5cbiAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQgfHwgIW5hbWUpIHtcbiAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDAsICdNaXNzaW5nIHJlcXVpcmVkIGZpZWxkcycpO1xuICB9XG5cbiAgY29uc3QgZXhpc3RpbmdVc2VyID0gYXdhaXQgZG9jQ2xpZW50LnNlbmQobmV3IEdldENvbW1hbmQoe1xuICAgIFRhYmxlTmFtZTogVEFCTEVfTkFNRVMuVVNFUlMsXG4gICAgS2V5OiB7IHVzZXJJZDogZW1haWwgfSxcbiAgfSkpO1xuXG4gIGlmIChleGlzdGluZ1VzZXIuSXRlbSkge1xuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwMCwgJ1VzZXIgYWxyZWFkeSBleGlzdHMnKTtcbiAgfVxuXG4gIGNvbnN0IGhhc2hlZFBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2gocGFzc3dvcmQsIDEwKTtcbiAgY29uc3QgdXNlcklkID0gdXVpZHY0KCk7XG5cbiAgYXdhaXQgZG9jQ2xpZW50LnNlbmQobmV3IFB1dENvbW1hbmQoe1xuICAgIFRhYmxlTmFtZTogVEFCTEVfTkFNRVMuVVNFUlMsXG4gICAgSXRlbToge1xuICAgICAgdXNlcklkLFxuICAgICAgZW1haWwsXG4gICAgICBuYW1lLFxuICAgICAgcGFzc3dvcmQ6IGhhc2hlZFBhc3N3b3JkLFxuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9LFxuICB9KSk7XG5cbiAgY29uc3QgdG9rZW4gPSBnZW5lcmF0ZVRva2VuKHsgdXNlcklkLCBlbWFpbCB9KTtcblxuICByZXR1cm4gY3JlYXRlU3VjY2Vzc1Jlc3BvbnNlKHsgdXNlcklkLCBlbWFpbCwgbmFtZSwgdG9rZW4gfSwgMjAxKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTG9naW4oYm9keTogYW55KSB7XG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSBib2R5O1xuXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRvY0NsaWVudC5zZW5kKG5ldyBHZXRDb21tYW5kKHtcbiAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUVTLlVTRVJTLFxuICAgIEtleTogeyB1c2VySWQ6IGVtYWlsIH0sXG4gIH0pKTtcblxuICBpZiAoIXJlc3VsdC5JdGVtKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDAxLCAnSW52YWxpZCBjcmVkZW50aWFscycpO1xuICB9XG5cbiAgY29uc3QgaXNWYWxpZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCByZXN1bHQuSXRlbS5wYXNzd29yZCk7XG4gIGlmICghaXNWYWxpZCkge1xuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwMSwgJ0ludmFsaWQgY3JlZGVudGlhbHMnKTtcbiAgfVxuXG4gIGNvbnN0IHRva2VuID0gZ2VuZXJhdGVUb2tlbih7IFxuICAgIHVzZXJJZDogcmVzdWx0Lkl0ZW0udXNlcklkLCBcbiAgICBlbWFpbDogcmVzdWx0Lkl0ZW0uZW1haWwgXG4gIH0pO1xuXG4gIHJldHVybiBjcmVhdGVTdWNjZXNzUmVzcG9uc2Uoe1xuICAgIHVzZXJJZDogcmVzdWx0Lkl0ZW0udXNlcklkLFxuICAgIGVtYWlsOiByZXN1bHQuSXRlbS5lbWFpbCxcbiAgICBuYW1lOiByZXN1bHQuSXRlbS5uYW1lLFxuICAgIHRva2VuLFxuICB9KTtcbn0iXX0=