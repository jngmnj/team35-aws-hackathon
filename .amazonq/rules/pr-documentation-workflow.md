# PR Documentation Workflow Rule

## Rule
When user requests PR creation or code review, ALWAYS:
1. Check actual code implementation status
2. Update @docs to reflect real progress
3. Create work log entry
4. Generate PR with accurate documentation

## Workflow Steps

### Step 1: Code Analysis
```
1. Read relevant code files to assess actual implementation
2. Compare with current @docs status
3. Identify gaps between documentation and reality
```

### Step 2: Documentation Update
```
1. Update docs/task-list.md with real progress percentages
2. Update docs/frontend-guide.md or docs/backend-guide.md as needed
3. Fix any outdated status indicators (❌ → ✅ or ⏳)
```

### Step 3: Work Log Creation
```
Create docs/log/YYYY-MM-DD-[task-description].md with:
- What was actually implemented
- Progress updates made to documentation
- Files affected
- Next steps
```

### Step 4: Commit All Changes Including Logs
```
Commit all files including:
- Updated documentation files
- New work log files
- Any code changes
- New rule files
```

### Step 5: PR Generation
```
Create PR with:
- Accurate title reflecting real changes
- Description including documentation updates
- Reference to work log entry
- Updated progress status
- All log files included in commit
```

## Implementation Pattern

### Before PR Creation:
```typescript
// 1. Analyze code
const actualProgress = analyzeCodeImplementation();

// 2. Update docs
updateTaskList(actualProgress);
updateGuides(actualProgress);

// 3. Create log
const workLogFile = createWorkLog(actualProgress, changesDescription);

// 4. Commit all changes including logs
git.add([...codeFiles, ...docFiles, workLogFile]);
git.commit("docs: [description] with work logs");

// 5. Generate PR
createPR({
  title: "feat: [actual implementation]",
  description: `
## Changes
- [actual changes made]

## Documentation Updates
- Updated task-list.md progress: [old%] → [new%]
- Created work log: docs/log/[date-task].md

## Status
- Phase X: [new completion %]
  `,
  files: [...codeFiles, ...docFiles, workLogFile]
});
```

## Trigger Conditions
- User says "create PR" or "make PR"
- User says "code review" or "review code"
- User mentions "pull request"
- User asks to "commit changes"

## Documentation Accuracy Rules
- Never assume progress - always verify with actual code
- Update percentages based on real implementation
- Mark tasks as ✅ only if fully functional
- Use ⏳ for partial implementation
- Use ❌ for not started

## Example Response Pattern
```
코드를 확인해서 실제 진행상황을 파악하고 문서를 업데이트한 후 PR을 생성하겠습니다.

[Code analysis results]
[Documentation updates made]
[Work log created]
[PR generated with accurate information]
```

## Reason
Ensures documentation always reflects actual implementation status and provides accurate project tracking for team collaboration.