export function handleDynamoDBError(error: any) {
  console.error('DynamoDB Error:', error);

  // Resource not found
  if (error.name === 'ResourceNotFoundException') {
    return {
      statusCode: 404,
      error: { message: 'Resource not found' }
    };
  }

  // Conditional check failed
  if (error.name === 'ConditionalCheckFailedException') {
    return {
      statusCode: 409,
      error: { message: 'Resource conflict - item may have been modified' }
    };
  }

  // Validation exception
  if (error.name === 'ValidationException') {
    return {
      statusCode: 400,
      error: { message: 'Invalid request parameters' }
    };
  }

  // Throttling
  if (error.name === 'ProvisionedThroughputExceededException' || error.name === 'ThrottlingException') {
    return {
      statusCode: 429,
      error: { message: 'Too many requests - please try again later' }
    };
  }

  // Access denied
  if (error.name === 'AccessDeniedException') {
    return {
      statusCode: 403,
      error: { message: 'Access denied' }
    };
  }

  // Default to 500 for unknown errors
  return {
    statusCode: 500,
    error: { message: 'Internal server error' }
  };
}