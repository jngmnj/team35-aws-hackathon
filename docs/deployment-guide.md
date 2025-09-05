# Deployment Guide

## Frontend Deployment Status
✅ **Build Successful** - Next.js app builds without errors
⏳ **Ready for Deployment** - Choose deployment method below

## Deployment Options

### Option 1: AWS Amplify (Recommended)
```bash
# 1. Install AWS CLI and configure
aws configure

# 2. Install Amplify CLI
npm install -g @aws-amplify/cli

# 3. Initialize Amplify in the code directory
cd code
amplify init

# 4. Add hosting
amplify add hosting

# 5. Deploy
amplify publish
```

### Option 2: S3 + CloudFront
```bash
# 1. Build the application
cd code
npm run build

# 2. Create S3 bucket
aws s3 mb s3://team35-hackathon-frontend

# 3. Upload build files
aws s3 sync .next/static s3://team35-hackathon-frontend/_next/static
aws s3 sync out s3://team35-hackathon-frontend/

# 4. Configure S3 for static website hosting
aws s3 website s3://team35-hackathon-frontend --index-document index.html
```

### Option 3: Vercel (Alternative)
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy from code directory
cd code
vercel --prod
```

## Current Build Output
- **Total Routes**: 8 pages
- **Build Size**: ~166 kB shared JS
- **Status**: ✅ Production ready
- **Warnings**: Minor ESLint warnings (non-blocking)

## Environment Variables Needed
```env
NEXT_PUBLIC_API_URL=https://your-api-gateway-url
```

## Next Steps
1. Choose deployment method
2. Configure environment variables
3. Deploy frontend
4. Test deployed application
5. Deploy backend (CDK stack)

## Backend Deployment (After Frontend)
```bash
cd backend
npm install
npm run deploy
```