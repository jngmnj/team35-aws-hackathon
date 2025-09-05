# UI Component Dependencies Rule

## Rule
Before using UI components, always verify they exist in the components/ui directory. Create missing components immediately.

## Problem Pattern
Import errors like "Module not found: Can't resolve '@/components/ui/label'" occur when components don't exist.

## Prevention Steps

### 1. Check Existing Components
```bash
ls code/src/components/ui/
```

### 2. Common Missing Components
- `label.tsx` - Form labels
- `textarea.tsx` - Multi-line text input
- `select.tsx` - Dropdown selection
- `checkbox.tsx` - Checkbox input
- `radio.tsx` - Radio button input

### 3. Create Missing Components Immediately
```typescript
// label.tsx
import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
```

### 4. Standard UI Component Pattern
```typescript
// Always follow this pattern for UI components
import * as React from "react";

export interface ComponentProps extends React.HTMLAttributes<HTMLElement> {}

const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, ...props }, ref) => (
    <element
      ref={ref}
      className={`base-styles ${className || ''}`}
      {...props}
    />
  )
);
Component.displayName = "Component";

export { Component };
```

## Verification Checklist
- [ ] Check if component exists before importing
- [ ] Create missing components with proper TypeScript types
- [ ] Use forwardRef pattern for DOM elements
- [ ] Include proper Tailwind CSS classes
- [ ] Export component with proper name

## Common Missing Components List
- `label.tsx` - Form field labels
- `textarea.tsx` - Multi-line text areas
- `checkbox.tsx` - Checkbox inputs
- `radio.tsx` - Radio button inputs
- `switch.tsx` - Toggle switches
- `slider.tsx` - Range sliders
- `progress.tsx` - Progress bars
- `badge.tsx` - Status badges
- `avatar.tsx` - User avatars
- `tooltip.tsx` - Hover tooltips

## Reason
Prevents build failures and ensures consistent UI component availability across the application.