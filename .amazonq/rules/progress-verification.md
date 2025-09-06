# Progress Verification Rule

## Rule
Before updating any progress status in @docs, ALWAYS verify actual implementation by reading the code.

## Verification Process

### Frontend Verification
```
Check these files for actual implementation:
- src/components/[feature]/*.tsx - UI components
- src/hooks/use[Feature].ts - API integration
- src/app/[feature]/page.tsx - Page implementation
- src/lib/api.ts - API client methods
```

### Backend Verification
```
Check these files for actual implementation:
- src/functions/[feature]/index.ts - Lambda implementation
- src/shared/[utility].ts - Shared utilities
- infrastructure/lib/*.ts - CDK infrastructure
- cdk.out/ - Deployment artifacts
```

### Progress Indicators
- ✅ **Complete**: Fully functional with error handling
- ⏳ **In Progress**: Partial implementation or missing features
- ❌ **Not Started**: No implementation found

### Verification Checklist
```
Frontend Component:
□ Component exists and renders
□ Props/interfaces defined
□ Error states handled
□ Loading states implemented
□ API integration working

Backend Function:
□ Handler function implemented
□ Input validation present
□ Database operations working
□ Error handling comprehensive
□ Authentication/authorization working

Infrastructure:
□ CDK constructs defined
□ Resources properly configured
□ Permissions granted
□ Environment variables set
```

## Never Assume
- Don't trust existing documentation percentages
- Don't assume implementation based on file names
- Don't mark as complete without reading actual code
- Don't update progress without verification

## Implementation
```typescript
// Always do this before updating docs:
const actualStatus = await verifyImplementation({
  feature: 'analysis',
  checkFrontend: true,
  checkBackend: true,
  checkInfrastructure: true
});

updateDocumentation(actualStatus);
```

## Reason
Prevents documentation drift and ensures accurate project tracking by always verifying actual code implementation before updating progress status.