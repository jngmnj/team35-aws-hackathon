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
exports.verifyToken = verifyToken;
const jwt = __importStar(require("jsonwebtoken"));
function verifyToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { success: false, error: 'Missing or invalid authorization header' };
    }
    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return {
            success: true,
            userId: decoded.userId,
            email: decoded.email,
        };
    }
    catch (error) {
        return { success: false, error: 'Invalid token' };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zaGFyZWQvYXV0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVNBLGtDQWlCQztBQTFCRCxrREFBb0M7QUFTcEMsU0FBZ0IsV0FBVyxDQUFDLFVBQW1CO0lBQzdDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDckQsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLHlDQUF5QyxFQUFFLENBQUM7SUFDOUUsQ0FBQztJQUVELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFdEMsSUFBSSxDQUFDO1FBQ0gsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQVEsQ0FBQztRQUNsRSxPQUFPO1lBQ0wsT0FBTyxFQUFFLElBQUk7WUFDYixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07WUFDdEIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO1NBQ3JCLENBQUM7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsQ0FBQztJQUNwRCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGp3dCBmcm9tICdqc29ud2VidG9rZW4nO1xuXG5leHBvcnQgaW50ZXJmYWNlIEF1dGhSZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuO1xuICB1c2VySWQ/OiBzdHJpbmc7XG4gIGVtYWlsPzogc3RyaW5nO1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeVRva2VuKGF1dGhIZWFkZXI/OiBzdHJpbmcpOiBBdXRoUmVzdWx0IHtcbiAgaWYgKCFhdXRoSGVhZGVyIHx8ICFhdXRoSGVhZGVyLnN0YXJ0c1dpdGgoJ0JlYXJlciAnKSkge1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ01pc3Npbmcgb3IgaW52YWxpZCBhdXRob3JpemF0aW9uIGhlYWRlcicgfTtcbiAgfVxuXG4gIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlci5zdWJzdHJpbmcoNyk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBkZWNvZGVkID0gand0LnZlcmlmeSh0b2tlbiwgcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCEpIGFzIGFueTtcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIHVzZXJJZDogZGVjb2RlZC51c2VySWQsXG4gICAgICBlbWFpbDogZGVjb2RlZC5lbWFpbCxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgdG9rZW4nIH07XG4gIH1cbn0iXX0=