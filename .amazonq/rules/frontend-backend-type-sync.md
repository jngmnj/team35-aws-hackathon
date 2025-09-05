# Frontend-Backend Type Synchronization Rule

## Rule
Always sync type definitions between Frontend and Backend when adding new document types or API interfaces.

## Problem Pattern
"Invalid document type" errors occur when Frontend defines new types but Backend validation doesn't include them.

## Root Cause Example
```typescript
// Frontend (types/index.ts) - 8 types
export type DocumentType = 'experience' | 'skills' | 'values' | 'achievements' | 'daily_record' | 'mood_tracker' | 'reflection' | 'test_result';

// Backend (validation.ts) - Only 4 types
const validTypes = ['experience', 'skills', 'values', 'achievements']; // Missing new types!
```

## Prevention Steps

### 1. Update Both Locations Simultaneously
```typescript
// Always update these files together:
- Frontend: src/types/index.ts
- Backend: backend/src/types/document.ts  
- Backend: backend/src/shared/validation.ts
```

### 2. Backend Validation Update
```typescript
// backend/src/shared/validation.ts
export function validateDocumentType(type: string): boolean {
  const validTypes = [
    'experience', 'skills', 'values', 'achievements',
    'daily_record', 'mood_tracker', 'reflection', 'test_result' // Add new types
  ];
  return validTypes.includes(type.toLowerCase());
}
```

### 3. Backend Type Definition Update
```typescript
// backend/src/types/document.ts
export type DocumentType = 'experience' | 'skills' | 'values' | 'achievements' | 'daily_record' | 'mood_tracker' | 'reflection' | 'test_result';
```

### 4. Lambda Deployment Required
```bash
# After type changes, redeploy Lambda functions
aws lambda update-function-code --function-name [FUNCTION_NAME] --zip-file fileb://function.zip
```

## Checklist When Adding New Types
- [ ] Update Frontend types/index.ts
- [ ] Update Backend types/document.ts
- [ ] Update Backend validation.ts
- [ ] Redeploy affected Lambda functions
- [ ] Test API endpoints with new types
- [ ] Verify error handling works

## Common Locations to Update
1. **Frontend Types**: `src/types/index.ts`
2. **Backend Types**: `backend/src/types/document.ts`
3. **Backend Validation**: `backend/src/shared/validation.ts`
4. **Lambda Functions**: Redeploy after changes

## Error Indicators
- "Invalid document type" from API
- 400 Bad Request on document creation
- Type validation failures in Lambda logs

## Reason
Prevents runtime API errors by ensuring Frontend and Backend type definitions stay synchronized.