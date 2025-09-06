# Duplicate Function Prevention Rule

## Rule
Never create duplicate function definitions in the same scope. Always check for existing function names before adding new functions.

## Common Violation
❌ **Wrong - Duplicate function definitions**
```typescript
const loadDocuments = async () => {
  // first definition
};

const loadDocuments = async () => {
  // duplicate definition - ERROR!
};
```

✅ **Correct - Single function definition**
```typescript
const loadDocuments = async () => {
  // single definition
};
```

## Prevention Strategy
1. **Before adding functions**: Search for existing function names in the file
2. **When modifying functions**: Replace the existing function, don't add a new one
3. **Use unique names**: If you need multiple similar functions, use descriptive names
4. **Code review**: Always check for duplicate definitions before committing

## Example Fix Pattern
❌ **Wrong**
```typescript
// Existing function
const fetchData = async () => { /* old logic */ };

// Adding new function with same name
const fetchData = async () => { /* new logic */ };
```

✅ **Correct**
```typescript
// Replace existing function
const fetchData = async () => { /* updated logic */ };

// Or use different names if both are needed
const fetchUserData = async () => { /* user logic */ };
const fetchDocumentData = async () => { /* document logic */ };
```

## Reason
Duplicate function definitions cause JavaScript/TypeScript compilation errors and make code unpredictable. The last definition overwrites previous ones, leading to unexpected behavior.