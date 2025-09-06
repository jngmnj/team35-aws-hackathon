# Auto Commit Logs Rule

## Rule
When creating work logs during PR workflow, ALWAYS include the log files in the same commit.

## Implementation
```bash
# After creating work log files
git add docs/log/YYYY-MM-DD-*.md
git add docs/task-list.md
git add .amazonq/rules/*.md
git commit -m "docs: [description]

- Updated documentation with actual progress
- Created work log: docs/log/[date-task].md
- [other changes]"
```

## File Inclusion Pattern
```
Always include in commit:
✅ Updated documentation files (docs/*.md)
✅ New work log files (docs/log/*.md)  
✅ New rule files (.amazonq/rules/*.md)
✅ Any code changes
✅ Configuration updates
```

## Commit Message Format
```
docs: [brief description]

- Updated [file] with [changes]
- Created work log: docs/log/[date-task].md
- [additional changes]

Files changed:
- [list of files]
```

## Never Leave Behind
- ❌ Don't create logs without committing them
- ❌ Don't commit docs without corresponding logs
- ❌ Don't create partial commits missing log files

## Reason
Ensures complete audit trail and prevents orphaned log files that don't match the actual commit history.