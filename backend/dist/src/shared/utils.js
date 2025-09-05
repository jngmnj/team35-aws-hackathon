"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeaders = getHeaders;
exports.createResponse = createResponse;
exports.createErrorResponse = createErrorResponse;
exports.createSuccessResponse = createSuccessResponse;
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}
function createResponse(statusCode, data) {
    return {
        statusCode,
        headers: getHeaders(),
        body: JSON.stringify(data),
    };
}
function createErrorResponse(statusCode, message) {
    return createResponse(statusCode, {
        success: false,
        error: { message },
    });
}
function createSuccessResponse(data, statusCode = 200) {
    return createResponse(statusCode, {
        success: true,
        data,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2hhcmVkL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsZ0NBT0M7QUFFRCx3Q0FNQztBQUVELGtEQUtDO0FBRUQsc0RBS0M7QUE3QkQsU0FBZ0IsVUFBVTtJQUN4QixPQUFPO1FBQ0wsY0FBYyxFQUFFLGtCQUFrQjtRQUNsQyw2QkFBNkIsRUFBRSxHQUFHO1FBQ2xDLDhCQUE4QixFQUFFLGlDQUFpQztRQUNqRSw4QkFBOEIsRUFBRSw2QkFBNkI7S0FDOUQsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFnQixjQUFjLENBQUMsVUFBa0IsRUFBRSxJQUFTO0lBQzFELE9BQU87UUFDTCxVQUFVO1FBQ1YsT0FBTyxFQUFFLFVBQVUsRUFBRTtRQUNyQixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7S0FDM0IsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFnQixtQkFBbUIsQ0FBQyxVQUFrQixFQUFFLE9BQWU7SUFDckUsT0FBTyxjQUFjLENBQUMsVUFBVSxFQUFFO1FBQ2hDLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFO0tBQ25CLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxJQUFTLEVBQUUsYUFBcUIsR0FBRztJQUN2RSxPQUFPLGNBQWMsQ0FBQyxVQUFVLEVBQUU7UUFDaEMsT0FBTyxFQUFFLElBQUk7UUFDYixJQUFJO0tBQ0wsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkZXJzKCkge1xuICByZXR1cm4ge1xuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBPUFRJT05TJyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24nLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVzcG9uc2Uoc3RhdHVzQ29kZTogbnVtYmVyLCBkYXRhOiBhbnkpIHtcbiAgcmV0dXJuIHtcbiAgICBzdGF0dXNDb2RlLFxuICAgIGhlYWRlcnM6IGdldEhlYWRlcnMoKSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVycm9yUmVzcG9uc2Uoc3RhdHVzQ29kZTogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGNyZWF0ZVJlc3BvbnNlKHN0YXR1c0NvZGUsIHtcbiAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICBlcnJvcjogeyBtZXNzYWdlIH0sXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3VjY2Vzc1Jlc3BvbnNlKGRhdGE6IGFueSwgc3RhdHVzQ29kZTogbnVtYmVyID0gMjAwKSB7XG4gIHJldHVybiBjcmVhdGVSZXNwb25zZShzdGF0dXNDb2RlLCB7XG4gICAgc3VjY2VzczogdHJ1ZSxcbiAgICBkYXRhLFxuICB9KTtcbn0iXX0=