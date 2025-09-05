# JSX Structure Rule

## Rule
Never define functions or variables inside JSX return statement. All function definitions must be placed before the return statement.

## Wrong ❌
```typescript
export default function Component() {
  return (
    <div>
      const handleClick = () => { // ERROR: Function definition inside JSX
        // code
      };
      <button onClick={handleClick}>Click</button>
    </div>
  );
}
```

## Correct ✅
```typescript
export default function Component() {
  const handleClick = () => { // Function definition BEFORE return
    // code
  };

  return (
    <div>
      <button onClick={handleClick}>Click</button>
    </div>
  );
}
```

## Reason
JSX parser expects only JSX elements and expressions inside return statement, not JavaScript declarations.