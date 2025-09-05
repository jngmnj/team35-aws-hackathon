export function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function createResponse(statusCode: number, data: any) {
  return {
    statusCode,
    headers: getHeaders(),
    body: JSON.stringify(data),
  };
}

export function createErrorResponse(statusCode: number, message: string) {
  return createResponse(statusCode, {
    success: false,
    error: { message },
  });
}

export function createSuccessResponse(data: any, statusCode: number = 200) {
  return createResponse(statusCode, {
    success: true,
    data,
  });
}