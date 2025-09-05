# API Specification - **Implementation Status Reflected**

> **Documentation Workflow**: This document is automatically updated after any API changes as per documentation rules.

## Base URL
```
https://api.{your-domain}.com/v1  # ❌ Not deployed - CDK deployment needed
```

## Current Implementation Status
- ✅ **API Schema Design Complete**
- ✅ **Lambda Function Implementation Complete** (Auth + Documents)
- ✅ **API Deployment Complete** (CDK Stack deployed)
- ✅ **API Gateway Integration Complete**
- ❌ **Frontend Integration Incomplete** (Using mock data)
- ⏳ **AI Analysis API Partially Complete** (Structure only)

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer {jwt_token}  # ❌ JWT logic not implemented
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

### Authentication - ⏳ **Basic Structure Complete, Actual Implementation Needed**

#### POST /auth/register - ❌ **Not Implemented**
Register new user account.

**Implementation Status**: Lambda function basic structure only, actual logic not implemented

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

#### POST /auth/login - ❌ **Not Implemented**
Authenticate existing user.

**Implementation Status**: Lambda function basic structure only, actual logic not implemented

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

### Documents - ⏳ **Basic Structure Complete, Actual Implementation Needed**

#### GET /documents - ❌ **Not Implemented**
Get all user documents.

**Implementation Status**: Lambda function basic structure only, DynamoDB integration not implemented

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

#### POST /documents - ❌ **Not Implemented**
Create new document.

**Implementation Status**: Lambda function basic structure only, DynamoDB integration not implemented

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

#### PUT /documents/{documentId} - ❌ **Not Implemented**
Update existing document.

**Implementation Status**: Lambda function basic structure only

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

#### DELETE /documents/{documentId} - ❌ **Not Implemented**
Delete document.

**Implementation Status**: Lambda function basic structure only

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### Analysis - ⏳ **Bedrock Integration Structure Complete, Actual Implementation Needed**

#### POST /analysis/generate - ❌ **Not Implemented**
Generate personality analysis from user documents.

**Implementation Status**: Bedrock integration code structure complete, prompts and logic not implemented

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

#### GET /analysis/{userId} - ❌ **Not Implemented**
Get latest analysis results for user.

**Implementation Status**: Not implemented

### Resume - ❌ **Not Started**

#### POST /resume/generate - ❌ **Not Implemented**
Generate resume for specific job category.

**Implementation Status**: Completely not implemented

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

#### GET /resume/{userId}/{jobCategory} - ❌ **Not Implemented**
Get existing resume for user and job category.

**Implementation Status**: Completely not implemented

## 🚨 Priority Implementation Order

### Step 1: Basic Infrastructure (Immediate Need)
1. Deploy DynamoDB tables
2. Set up API Gateway
3. Deploy Lambda functions

### Step 2: Authentication API (High Priority)
1. Implement POST /auth/register
2. Implement POST /auth/login
3. JWT token validation middleware

### Step 3: Documents API (High Priority)
1. Implement GET /documents
2. Implement POST /documents
3. Implement PUT /documents/{id}
4. Implement DELETE /documents/{id}

### Step 4: AI Analysis (Medium Priority)
1. Implement POST /analysis/generate
2. Implement GET /analysis/{userId}

### Step 5: Resume Generation (Medium Priority)
1. Implement POST /resume/generate
2. Implement GET /resume/{userId}/{jobCategory}

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