# Documentation Workflow Rules

## Rule 1: Mandatory Documentation Context Check
Before answering any request, ALWAYS check the entire @docs context to understand:
- Current project state and architecture
- Existing implementations and patterns
- Previous decisions and constraints
- Related documentation that might be affected

## Rule 2: Documentation Update After Work
After completing ANY task or making changes:
1. Update relevant documentation in @docs to reflect changes
2. Ensure documentation accuracy and consistency
3. Add new documentation if new features/components are created

## Rule 3: Work Log Documentation
After completing any task, create a summary entry in `docs/log/` with:
- Date and brief task description as filename (YYYY-MM-DD-task-summary.md)
- What was changed/implemented
- Key decisions made
- Files affected
- Any important notes for future reference

## Implementation
```
docs/log/
├── 2024-01-15-auth-system-setup.md
├── 2024-01-16-document-crud-api.md
└── 2024-01-17-frontend-components.md
```

## Reason
Maintains project documentation accuracy and provides audit trail of all changes for team collaboration and future maintenance.