# Project Specification: AI-Powered Self-Understanding & Resume Generator

## Project Overview

A Notion-like document-based platform that helps users understand themselves better and generates personalized resumes based on their collected data.

### Timeline: 1 Day Hackathon
### Team Size: 4 Members

## Core Features

### 1. Document-Based Data Collection
- **Notion-style Editor**: Users create multiple documents containing personal information
- **Document Types**:
  - Experience Documents (projects, internships, activities)
  - Skills Documents (technical skills, certifications, languages)
  - Values Documents (goals, motivations, philosophy)
  - Achievement Documents (awards, accomplishments, leadership)

### 2. AI-Powered Analysis
- **Comprehensive Analysis**: AI analyzes all user documents collectively
- **Insights Generated**:
  - Personality type analysis
  - Strengths and weaknesses identification
  - Values and interests mapping
  - Experience categorization

### 3. Resume Generation
- **Job Category Support**: Developer, Product Manager, Marketer, Designer, etc.
- **Personalized Content**: AI generates tailored resumes based on user's documents and target job
- **Multiple Formats**: Different resume templates for various industries

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14+
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Deployment**: AWS S3 + CloudFront

### Backend Stack
- **Runtime**: Node.js
- **Architecture**: Serverless (AWS Lambda)
- **API**: AWS API Gateway
- **Database**: AWS DynamoDB
- **AI Service**: AWS Bedrock (Claude/GPT models)
- **Authentication**: AWS Cognito

### Development Tools
- **Code Generation**: Amazon Q Developer
- **Infrastructure**: AWS CDK
- **Version Control**: Git

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │   Lambda        │
│   (S3+CF)       │◄──►│   + Lambda       │◄──►│   Functions     │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   AWS Cognito    │    │   DynamoDB      │
                       │   (Auth)         │    │   (Documents)   │
                       └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   AWS Bedrock   │
                                               │   (AI Analysis) │
                                               └─────────────────┘
```

## Data Flow

1. **User Registration/Login** → AWS Cognito
2. **Document Creation** → Store in DynamoDB
3. **AI Analysis Request** → Lambda processes documents via Bedrock
4. **Insight Generation** → AI analyzes all documents collectively
5. **Resume Generation** → AI creates personalized resume based on job category
6. **Result Display** → Frontend shows analysis and generated resume

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Documents
- `GET /documents` - Get user's documents
- `POST /documents` - Create new document
- `PUT /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document

### Analysis
- `POST /analysis/generate` - Generate personality analysis
- `GET /analysis/:userId` - Get user's analysis results

### Resume
- `POST /resume/generate` - Generate resume for specific job category
- `GET /resume/:userId/:jobCategory` - Get generated resume

## Database Schema

### Users Table
```json
{
  "userId": "string (PK)",
  "email": "string",
  "name": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Documents Table
```json
{
  "documentId": "string (PK)",
  "userId": "string (GSI)",
  "type": "experience|skills|values|achievements",
  "title": "string",
  "content": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Analysis Table
```json
{
  "analysisId": "string (PK)",
  "userId": "string (GSI)",
  "personalityType": "object",
  "strengths": "array",
  "weaknesses": "array",
  "values": "array",
  "interests": "array",
  "createdAt": "timestamp"
}
```

### Resumes Table
```json
{
  "resumeId": "string (PK)",
  "userId": "string (GSI)",
  "jobCategory": "string",
  "content": "string",
  "createdAt": "timestamp"
}
```

## Job Categories

- **Developer**: Frontend, Backend, Full-stack, Mobile, DevOps
- **Product Manager**: Product Strategy, Technical PM, Growth PM
- **Designer**: UX/UI Designer, Graphic Designer, Product Designer
- **Marketer**: Digital Marketing, Content Marketing, Growth Marketing
- **Data**: Data Analyst, Data Scientist, ML Engineer

## Development Priorities

### Phase 1: Core Infrastructure (2-3 hours)
1. Project setup and basic UI/UX
2. AWS infrastructure setup (CDK)
3. Authentication system
4. Basic document CRUD operations

### Phase 2: AI Integration (3-4 hours)
1. Bedrock integration for text analysis
2. Personality analysis logic
3. Resume generation templates
4. API endpoint implementation

### Phase 3: Integration & Testing (2-3 hours)
1. Frontend-backend integration
2. End-to-end testing
3. UI/UX refinement
4. Deployment and demo preparation

## Success Metrics

- **Functionality**: Complete user flow from document creation to resume generation
- **AI Quality**: Meaningful personality insights and relevant resume content
- **User Experience**: Intuitive document editor and clear result presentation
- **Technical Implementation**: Proper AWS service integration and scalable architecture

## Risk Mitigation

- **Time Constraint**: Focus on MVP features first
- **AI Integration**: Have fallback templates if Bedrock integration fails
- **Deployment Issues**: Prepare simple deployment scripts
- **Team Coordination**: Clear role division and regular check-ins

## Deliverables

1. **Working Application**: Deployed on AWS with full functionality
2. **Demo**: 5-minute presentation showing complete user journey
3. **Documentation**: Architecture overview and setup instructions
4. **Source Code**: Clean, documented codebase on GitHub