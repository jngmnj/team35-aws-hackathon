# API Specification

## Base URL
```
https://api.{your-domain}.com/v1
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer {jwt_token}
```

## Response Format
```json
{
  "success": boolean,
  "data": object | array,
  "message": string,
  "timestamp": string
}
```

## Error Response Format
```json
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details": object
  },
  "timestamp": string
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "token": "jwt_token_here"
  }
}
```

### Documents

#### GET /documents
Get all user documents.

**Query Parameters:**
- `type` (optional): Filter by document type
- `limit` (optional): Number of documents to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "documentId": "doc-123",
        "userId": "user-123",
        "type": "experience",
        "title": "Software Engineering Internship",
        "content": "Rich text content...",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 10,
    "hasMore": false
  }
}
```

#### POST /documents
Create new document.

**Request Body:**
```json
{
  "type": "experience|skills|values|achievements",
  "title": "Document Title",
  "content": "Rich text content in JSON format"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "doc-123",
    "userId": "user-123",
    "type": "experience",
    "title": "Document Title",
    "content": "Rich text content...",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /documents/{documentId}
Update existing document.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

#### DELETE /documents/{documentId}
Delete document.

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### Analysis

#### POST /analysis/generate
Generate personality analysis from user documents.

**Request Body:**
```json
{
  "includeDocumentTypes": ["experience", "skills", "values", "achievements"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis-123",
    "userId": "user-123",
    "personalityType": {
      "type": "ENFP",
      "description": "The Campaigner",
      "traits": ["Enthusiastic", "Creative", "Sociable"]
    },
    "strengths": [
      "Strong communication skills",
      "Creative problem solving",
      "Leadership abilities"
    ],
    "weaknesses": [
      "Time management",
      "Attention to detail"
    ],
    "values": [
      "Innovation",
      "Collaboration",
      "Growth"
    ],
    "interests": [
      "Technology",
      "Design",
      "Education"
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /analysis/{userId}
Get latest analysis results for user.

### Resume

#### POST /resume/generate
Generate resume for specific job category.

**Request Body:**
```json
{
  "jobCategory": "developer|pm|designer|marketer|data",
  "jobTitle": "Frontend Developer",
  "includeAnalysis": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "resumeId": "resume-123",
    "userId": "user-123",
    "jobCategory": "developer",
    "content": {
      "personalInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "summary": "AI-generated professional summary..."
      },
      "experience": [
        {
          "title": "Software Engineer Intern",
          "company": "Tech Corp",
          "duration": "Jun 2023 - Aug 2023",
          "description": "AI-enhanced description..."
        }
      ],
      "skills": [
        "JavaScript",
        "React",
        "Node.js"
      ],
      "achievements": [
        "Led team of 5 developers",
        "Increased performance by 40%"
      ]
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /resume/{userId}/{jobCategory}
Get existing resume for user and job category.

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Missing or invalid token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Server-side error

## Rate Limiting

- Authentication endpoints: 10 requests per minute
- Document endpoints: 100 requests per minute
- Analysis endpoints: 5 requests per minute
- Resume endpoints: 10 requests per minute