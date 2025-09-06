# ESLint & TypeScript Rules

## Rule
Always follow ESLint and TypeScript strict rules. Never use any type or leave unused variables.

## Common Violations & Solutions

### 1. @typescript-eslint/no-explicit-any
❌ **Wrong**
```typescript
const [documents, setDocuments] = useState<any[]>([]);
async function getData(): Promise<any> { }
```

✅ **Correct**
```typescript
interface Document { id: number; title: string; type: string; }
const [documents, setDocuments] = useState<Document[]>([]);
async function getData(): Promise<Document[]> { }
```

### 2. @typescript-eslint/no-unused-vars
❌ **Wrong**
```typescript
} catch (err) {
  setError('Error message');
}
const [error, setError] = useState(''); // error not used
```

✅ **Correct**
```typescript
} catch {
  setError('Error message');
}
// or
} catch (_err) {
  setError('Error message');
}
const [, setError] = useState(''); // or remove unused variable
```

### 3. react/no-unescaped-entities
❌ **Wrong**
```typescript
<span>Don't have an account?</span>
<p>It's working</p>
```

✅ **Correct**
```typescript
<span>Don&apos;t have an account?</span>
<p>It&apos;s working</p>
```

### 4. Safe Type Casting
❌ **Wrong**
```typescript
(documents as { documents: Document[] }).documents
```

✅ **Correct**
```typescript
Array.isArray(documents) ? documents : (documents as unknown as { documents: Document[] }).documents
```

### 5. Unused Imports
❌ **Wrong**
```typescript
import { apiClient } from '@/lib/api'; // not used in component
```

✅ **Correct**
```typescript
// Remove unused imports completely
```

## Checklist Before Commit
- [ ] No `any` types used - define specific interfaces
- [ ] No unused variables - add `_` prefix or remove
- [ ] No unescaped entities in JSX - use HTML entities
- [ ] No unused imports - remove completely
- [ ] Safe type casting with proper checks
- [ ] Unused parameters prefixed with `_`

## Reason
Strict TypeScript and ESLint rules ensure code quality, maintainability, and prevent runtime errors.