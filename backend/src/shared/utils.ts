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
    const responseData = {
      ...data,
      timestamp: new Date().toISOString()
    };
    return {
      statusCode,
      headers: getHeaders(),
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error('JSON serialization error:', error);
    return {
      statusCode: 500,
      headers: getHeaders(),
      body: JSON.stringify({ 
        success: false, 
        error: { 
          code: 'SERIALIZATION_ERROR',
          message: 'Serialization error' 
        },
        timestamp: new Date().toISOString()
      }),
    };
  }
}

export function createErrorResponse(statusCode: number, message: string, code?: string, details?: unknown) {
  return createResponse(statusCode, {
    success: false,
    error: { 
      code: code || getErrorCode(statusCode),
      message,
      ...(details && { details })
    },
  });
}

export function createSuccessResponse(data: unknown, statusCode: number = 200, message?: string) {
  return createResponse(statusCode, {
    success: true,
    data,
    ...(message && { message })
  });
}

function getErrorCode(statusCode: number): string {
  switch (statusCode) {
    case 400: return 'BAD_REQUEST';
    case 401: return 'UNAUTHORIZED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 409: return 'CONFLICT';
    case 429: return 'TOO_MANY_REQUESTS';
    case 500: return 'INTERNAL_SERVER_ERROR';
    default: return 'UNKNOWN_ERROR';
  }
}