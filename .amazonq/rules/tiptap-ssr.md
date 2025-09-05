# TipTap Editor SSR Rule

## Rule
When using TipTap editor with Next.js, always add `immediatelyRender: false` to prevent SSR hydration mismatches.

## Implementation
```typescript
const editor = useEditor({
  extensions: [...],
  content: '',
  immediatelyRender: false, // Required for Next.js SSR
});
```

## Reason
TipTap manipulates DOM directly and causes server/client rendering differences in Next.js SSR environment.