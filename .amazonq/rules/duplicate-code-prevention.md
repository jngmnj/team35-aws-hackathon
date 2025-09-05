# Duplicate Code Prevention Rule

## Rule
Never create duplicate code blocks, return statements, or function bodies in the same file. Always check for existing code before adding new content.

## Common Violations
❌ **Wrong - Duplicate return statements**
```typescript
export default function Component() {
  return <div>Content</div>;
}

return <div>Content</div>; // ERROR: Duplicate return outside function
```

❌ **Wrong - Duplicate function bodies**
```typescript
export default function Component() {
  return <div>First</div>;
}

export default function Component() {
  return <div>Second</div>; // ERROR: Duplicate function
}
```

❌ **Wrong - Duplicate code blocks**
```typescript
const handleClick = () => {
  console.log('click');
};

const handleClick = () => {
  console.log('click'); // ERROR: Duplicate handler
};
```

## Prevention Strategy
1. **Before adding code**: Search for similar patterns in the file
2. **When editing**: Replace existing code, don't append duplicate
3. **Use unique names**: If multiple similar blocks needed, use descriptive names
4. **File review**: Always check entire file before saving

## Correct Patterns
✅ **Single function definition**
```typescript
export default function Component() {
  return <div>Content</div>;
}
```

✅ **Unique function names**
```typescript
const handlePrimaryClick = () => { /* logic */ };
const handleSecondaryClick = () => { /* different logic */ };
```

## Reason
Duplicate code causes parsing errors, compilation failures, and unpredictable behavior. JavaScript/TypeScript cannot have multiple definitions of the same identifier or return statements outside functions.