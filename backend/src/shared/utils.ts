export function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function createResponse(statusCode: number, data: Record<string, unknown>) {
  try {
    return {
      statusCode,
      headers: getHeaders(),
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('JSON serialization error:', error);
    return {
      statusCode: 500,
      headers: getHeaders(),
      body: JSON.stringify({ success: false, error: { message: 'Serialization error' } }),
    };
  }
}

export function createErrorResponse(statusCode: number, message: string) {
  return createResponse(statusCode, {
    success: false,
    error: { message },
  });
}

export function createSuccessResponse(data: unknown, statusCode: number = 200) {
  return createResponse(statusCode, {
    success: true,
    data,
  });
}