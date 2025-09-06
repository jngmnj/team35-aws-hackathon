# API Response Type Validation Rule

## Rule
Always verify API response structure matches frontend TypeScript types before implementing components.

## Problem Pattern
Frontend components fail with "Cannot read properties of undefined" when API response structure differs from expected types.

## Prevention Steps

### 1. API Response Verification
```bash
# Test actual API response first
curl -X POST https://api-url/endpoint \
  -H "Authorization: Bearer token" \
  -d '{}' | jq '.'
```

### 2. Type Definition Alignment
```typescript
// ❌ Wrong - Assuming flat structure
interface AnalysisResult {
  personalityType: PersonalityType;
  strengths: string[];
}

// ✅ Correct - Match actual API response
interface AnalysisResult {
  analysisId: string;
  userId: string;
  result: {
    personalityType: PersonalityType;
    strengths: StrengthItem[];
  };
  createdAt: string;
}
```

### 3. Component Data Access
```typescript
// ❌ Wrong - Direct access without checks
<PersonalityCard personalityType={analysis.personalityType} />

// ❌ Wrong - Array handling
const analysis = await getAnalysis(); // returns array
setAnalysis(analysis); // should be analysis[0]

// ✅ Correct - Safe access with checks
{analysis && analysis.result && (
  <PersonalityCard personalityType={analysis.result.personalityType} />
)}

// ✅ Correct - Array handling
const analyses = await getAnalysis();
if (analyses.length > 0) {
  setAnalysis(analyses[0]);
}

// ✅ Correct - Optional chaining for nested properties
<h3>{analysis.result?.personalityType?.type || 'Unknown'}</h3>
<span>강점 {analysis.result?.strengths?.length || 0}개</span>
```

## Validation Checklist
- [ ] Test API endpoint with actual request
- [ ] Compare response structure with TypeScript types
- [ ] Verify nested object access paths
- [ ] Check array item types (string[] vs object[])
- [ ] Handle array vs single object responses
- [ ] Add null/undefined checks for nested properties
- [ ] Use optional chaining (?.) for deeply nested properties
- [ ] Provide fallback values for missing data
- [ ] Test with real data, not mock data
- [ ] Verify conditional rendering guards
- [ ] Test all components that use the same API data

## Common Mistakes
1. **Nested Objects**: API returns `{ result: { data } }` but types expect `{ data }`
2. **Array Types**: API returns `[{title, description}]` but types expect `string[]`
3. **Property Names**: API uses `personalityType` but types expect `personality_type`
4. **Array vs Object**: API returns `[{...}]` but component expects single object `{...}`
5. **Undefined Properties**: Accessing nested properties without null checks
6. **Multiple Components**: Same API data used in different components with inconsistent access patterns
7. **Missing Fallbacks**: No default values when properties are undefined

## Implementation Order
1. **API First**: Test and document actual API response
2. **Types Second**: Define TypeScript interfaces matching API
3. **Components Last**: Implement components using correct data paths

## Reason
Prevents runtime errors and ensures type safety by aligning frontend expectations with backend reality.