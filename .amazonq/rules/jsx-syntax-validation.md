# JSX Syntax Validation Rule

## Rule
Always validate JSX syntax for proper bracket matching and JavaScript expression closure.

## Problem Pattern
Build fails with "Parsing ecmascript source code failed" when JSX has syntax errors like missing brackets or unclosed expressions.

## Common JSX Syntax Errors

### 1. Missing Closing Brackets in JavaScript Expressions
❌ **Wrong**
```typescript
{items.map((item, index) => (
  <li key={index}>{item}</li>
))  // Missing closing }
```

✅ **Correct**
```typescript
{items.map((item, index) => (
  <li key={index}>{item}</li>
))}  // Proper closing }
```

### 2. Unmatched Parentheses in JSX
❌ **Wrong**
```typescript
{items.map((item, index) => 
  <li key={index}>{item}</li>
)  // Missing opening (
```

✅ **Correct**
```typescript
{items.map((item, index) => (
  <li key={index}>{item}</li>
))}
```

### 3. Missing Brackets in Conditional Rendering
❌ **Wrong**
```typescript
{condition && 
  <div>Content</div>  // Missing wrapping {}
```

✅ **Correct**
```typescript
{condition && (
  <div>Content</div>
)}
```

## Prevention Checklist
- [ ] Every `{` has matching `}`
- [ ] Every `(` has matching `)`
- [ ] JavaScript expressions in JSX are properly closed
- [ ] Map functions have complete syntax: `{array.map(() => ())}`
- [ ] Conditional rendering is properly wrapped

## Debugging Steps
1. **Check bracket matching**: Use editor bracket highlighting
2. **Validate map syntax**: Ensure `{array.map(() => ())}` pattern
3. **Test incremental changes**: Comment out sections to isolate errors
4. **Use linter**: ESLint catches most JSX syntax errors

## Common Locations
- Array mapping: `{items.map()}`
- Conditional rendering: `{condition && <Component />}`
- Dynamic content: `{variable}`
- Event handlers: `onClick={() => {}}`

## Reason
JSX is transpiled to JavaScript function calls, so proper syntax is critical for successful compilation.