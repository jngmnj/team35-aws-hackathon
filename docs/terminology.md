# Project Terminology

## Core Concepts
- **Document**: User-created content containing personal information
- **Document Type**: Category of document (experience, skills, values, achievements)
- **Analysis**: AI-generated personality and behavioral insights
- **Resume**: AI-generated professional document tailored to job category
- **Job Category**: Target profession (developer, PM, designer, marketer, data)

## Technical Terms
- **User ID**: Unique identifier for authenticated users
- **Document ID**: Unique identifier for each document
- **Analysis ID**: Unique identifier for analysis results
- **Resume ID**: Unique identifier for generated resumes
- **Timestamp**: ISO 8601 formatted date-time string
- **Content**: Rich text content in JSON format
- **Personality Type**: Structured object containing personality analysis
- **Strengths**: Array of identified user strengths
- **Weaknesses**: Array of identified areas for improvement
- **Values**: Array of user's core values and motivations
- **Interests**: Array of user's professional interests

## AWS Services
- **DynamoDB**: NoSQL database for storing user data
- **Lambda**: Serverless compute functions
- **API Gateway**: REST API management service
- **Cognito**: User authentication and management
- **Bedrock**: AI/ML service for text analysis
- **S3**: Static website hosting
- **CloudFront**: Content delivery network
- **CDK**: Cloud Development Kit for infrastructure

## API Endpoints
- **Auth Endpoints**: `/auth/*` - Authentication related operations
- **Document Endpoints**: `/documents/*` - Document CRUD operations
- **Analysis Endpoints**: `/analysis/*` - AI analysis operations
- **Resume Endpoints**: `/resume/*` - Resume generation operations

## Frontend Components
- **Editor**: Rich text editor component
- **Dashboard**: Main user interface
- **Document List**: Component showing user's documents
- **Analysis View**: Component displaying AI insights
- **Resume Generator**: Component for creating resumes
- **Job Selector**: Component for choosing job categories

## Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error