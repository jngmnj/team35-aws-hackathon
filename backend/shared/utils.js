const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const response = {
  success: (data, statusCode = 200) => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify({
      success: true,
      data
    })
  }),

  error: (message, statusCode = 400) => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify({
      success: false,
      error: message
    })
  })
};

const auth = {
  generateToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  },

  extractTokenFromHeader: (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }
    return authHeader.substring(7);
  }
};

const validate = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password) => {
    return password && password.length >= 6;
  },

  required: (fields, data) => {
    const missing = fields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }
};

const handleError = (error) => {
  console.error('Error:', error);
  
  if (error.message.includes('Missing required fields')) {
    return response.error(error.message, 400);
  }
  
  if (error.message.includes('Invalid token')) {
    return response.error('Unauthorized', 401);
  }
  
  return response.error('Internal server error', 500);
};

module.exports = {
  response,
  auth,
  validate,
  handleError
};