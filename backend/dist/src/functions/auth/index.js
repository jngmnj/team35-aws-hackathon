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
const jwt = __importStar(require("jsonwebtoken"));
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
    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '24h' });
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
    const token = jwt.sign({ userId: result.Item.userId, email: result.Item.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return (0, utils_1.createSuccessResponse)({
        userId: result.Item.userId,
        email: result.Item.email,
        name: result.Item.name,
        token,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZnVuY3Rpb25zL2F1dGgvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esd0RBQStEO0FBQy9ELGlEQUFtQztBQUNuQyxrREFBb0M7QUFDcEMsK0JBQW9DO0FBQ3BDLG9EQUErRDtBQUMvRCw4Q0FBZ0Y7QUFFekUsTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQTJCLEVBQWtDLEVBQUU7SUFDM0YsSUFBSSxDQUFDO1FBQ0gsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztRQUN4QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO1FBRWhDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3pCLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ3BELENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7UUFFNUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7WUFDL0IsT0FBTyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxDQUFDO2FBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDbkMsT0FBTyxNQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRUQsT0FBTyxJQUFBLDJCQUFtQixFQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENB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TSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsRUFDdkIsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQ3JCLENBQUM7SUFFRixPQUFPLElBQUEsNkJBQXFCLEVBQUM7UUFDM0IsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTTtRQUMxQixLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLO1FBQ3hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUk7UUFDdEIsS0FBSztLQUNOLENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBQdXRDb21tYW5kLCBHZXRDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvbGliLWR5bmFtb2RiJztcbmltcG9ydCAqIGFzIGJjcnlwdCBmcm9tICdiY3J5cHRqcyc7XG5pbXBvcnQgKiBhcyBqd3QgZnJvbSAnanNvbndlYnRva2VuJztcbmltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gJ3V1aWQnO1xuaW1wb3J0IHsgZG9jQ2xpZW50LCBUQUJMRV9OQU1FUyB9IGZyb20gJy4uLy4uL3NoYXJlZC9kYXRhYmFzZSc7XG5pbXBvcnQgeyBjcmVhdGVFcnJvclJlc3BvbnNlLCBjcmVhdGVTdWNjZXNzUmVzcG9uc2UgfSBmcm9tICcuLi8uLi9zaGFyZWQvdXRpbHMnO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnQpOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHBhdGggPSBldmVudC5wYXRoO1xuICAgIGNvbnN0IG1ldGhvZCA9IGV2ZW50Lmh0dHBNZXRob2Q7XG5cbiAgICBpZiAobWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgIHJldHVybiB7IHN0YXR1c0NvZGU6IDIwMCwgaGVhZGVyczoge30sIGJvZHk6ICcnIH07XG4gICAgfVxuXG4gICAgY29uc3QgYm9keSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSB8fCAne30nKTtcblxuICAgIGlmIChwYXRoLmVuZHNXaXRoKCcvcmVnaXN0ZXInKSkge1xuICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVJlZ2lzdGVyKGJvZHkpO1xuICAgIH0gZWxzZSBpZiAocGF0aC5lbmRzV2l0aCgnL2xvZ2luJykpIHtcbiAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVMb2dpbihib2R5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDQsICdOb3QgZm91bmQnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvcjonLCBlcnJvcik7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNTAwLCAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyk7XG4gIH1cbn07XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlZ2lzdGVyKGJvZHk6IGFueSkge1xuICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCwgbmFtZSB9ID0gYm9keTtcblxuICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCB8fCAhbmFtZSkge1xuICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwMCwgJ01pc3NpbmcgcmVxdWlyZWQgZmllbGRzJyk7XG4gIH1cblxuICBjb25zdCBleGlzdGluZ1VzZXIgPSBhd2FpdCBkb2NDbGllbnQuc2VuZChuZXcgR2V0Q29tbWFuZCh7XG4gICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FUy5VU0VSUyxcbiAgICBLZXk6IHsgdXNlcklkOiBlbWFpbCB9LFxuICB9KSk7XG5cbiAgaWYgKGV4aXN0aW5nVXNlci5JdGVtKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDAwLCAnVXNlciBhbHJlYWR5IGV4aXN0cycpO1xuICB9XG5cbiAgY29uc3QgaGFzaGVkUGFzc3dvcmQgPSBhd2FpdCBiY3J5cHQuaGFzaChwYXNzd29yZCwgMTApO1xuICBjb25zdCB1c2VySWQgPSB1dWlkdjQoKTtcblxuICBhd2FpdCBkb2NDbGllbnQuc2VuZChuZXcgUHV0Q29tbWFuZCh7XG4gICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FUy5VU0VSUyxcbiAgICBJdGVtOiB7XG4gICAgICB1c2VySWQsXG4gICAgICBlbWFpbCxcbiAgICAgIG5hbWUsXG4gICAgICBwYXNzd29yZDogaGFzaGVkUGFzc3dvcmQsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH0sXG4gIH0pKTtcblxuICBjb25zdCB0b2tlbiA9IGp3dC5zaWduKHsgdXNlcklkLCBlbWFpbCB9LCBwcm9jZXNzLmVudi5KV1RfU0VDUkVUISwgeyBleHBpcmVzSW46ICcyNGgnIH0pO1xuXG4gIHJldHVybiBjcmVhdGVTdWNjZXNzUmVzcG9uc2UoeyB1c2VySWQsIGVtYWlsLCBuYW1lLCB0b2tlbiB9LCAyMDEpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVMb2dpbihib2R5OiBhbnkpIHtcbiAgY29uc3QgeyBlbWFpbCwgcGFzc3dvcmQgfSA9IGJvZHk7XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZG9jQ2xpZW50LnNlbmQobmV3IEdldENvbW1hbmQoe1xuICAgIFRhYmxlTmFtZTogVEFCTEVfTkFNRVMuVVNFUlMsXG4gICAgS2V5OiB7IHVzZXJJZDogZW1haWwgfSxcbiAgfSkpO1xuXG4gIGlmICghcmVzdWx0Lkl0ZW0pIHtcbiAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDEsICdJbnZhbGlkIGNyZWRlbnRpYWxzJyk7XG4gIH1cblxuICBjb25zdCBpc1ZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUocGFzc3dvcmQsIHJlc3VsdC5JdGVtLnBhc3N3b3JkKTtcbiAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNDAxLCAnSW52YWxpZCBjcmVkZW50aWFscycpO1xuICB9XG5cbiAgY29uc3QgdG9rZW4gPSBqd3Quc2lnbihcbiAgICB7IHVzZXJJZDogcmVzdWx0Lkl0ZW0udXNlcklkLCBlbWFpbDogcmVzdWx0Lkl0ZW0uZW1haWwgfSxcbiAgICBwcm9jZXNzLmVudi5KV1RfU0VDUkVUISxcbiAgICB7IGV4cGlyZXNJbjogJzI0aCcgfVxuICApO1xuXG4gIHJldHVybiBjcmVhdGVTdWNjZXNzUmVzcG9uc2Uoe1xuICAgIHVzZXJJZDogcmVzdWx0Lkl0ZW0udXNlcklkLFxuICAgIGVtYWlsOiByZXN1bHQuSXRlbS5lbWFpbCxcbiAgICBuYW1lOiByZXN1bHQuSXRlbS5uYW1lLFxuICAgIHRva2VuLFxuICB9KTtcbn0iXX0=