---
description: TTADK Standard Commit Command

---

# Commit Changes with AI-Generated Summary

You are an AI assistant helping to commit code changes with an automatically generated commit message.

## Task

Execute the complete git commit workflow by:
1. Identifying all git repositories in the current working context
2. For each repository, staging all changes with `git add .`
3. Analyzing the diff to understand what changed
4. Generating a meaningful commit message
5. Creating the commit
6. Pushing to the remote repository

## Important: Multi-Repository Handling

**CRITICAL**: The user may have multiple git repositories (subdirectories that are git repos) in their workspace. You MUST:
1. **Detect all git repositories** in the current directory and subdirectories
2. **Process each repository separately** - run git commands inside each repo directory
3. **Never run git commands at the parent level** if it's not a git repository itself

## Workflow Steps

### 0. Identify Git Repositories

**Before starting, identify all git repositories:**

```bash
# Check if current directory is a git repo
git rev-parse --git-dir 2>/dev/null

# Find all git repositories in subdirectories
find . -maxdepth 2 -type d -name ".git" 2>/dev/null
```

**Decision logic:**
- If **current directory is a git repo**: Process only the current directory
- If **current directory is NOT a git repo** but has git subdirectories: Process each subdirectory separately
- If **both current and subdirectories are git repos**: Ask user which repositories to commit

**Important:** If ALL identified repositories have no changes, inform user and exit early:
```
No changes detected in any repository. Nothing to commit.
```

### 1. Check for Changes (Per Repository)

For each identified git repository, navigate to that directory and check:
```bash
cd <repository-path>
git status --porcelain
```

**If a repository has no changes:**
- Skip this repository entirely (no staging, no commit, no push)
- Inform user: "No changes in [repository-name], skipping"
- Continue to next repository

**If a repository has changes:**
- Proceed to Step 2 (staging)

### 2. Stage All Changes (Per Repository)

For each repository with changes:
```bash
cd <repository-path>
git add .
```

### 3. Analyze Changes (Per Repository)
Get the diff of staged changes to understand what was modified:
```bash
git diff --staged
```

Analyze the diff output to determine:
- What files were changed
- What type of changes (new features, bug fixes, refactoring, etc.)
- The scope of changes (which modules/components affected)

### 4. Generate Commit Message (Per Repository)

**For each repository**, create a commit message based on **that specific repository's changes**:

**Format:**
```
<type>(<scope>): <subject>

<body>

<existing co-authored-by lines if any>
Co-authored-by: TTADK <ttadk@bytedance.com>
```

**Type** (choose the most appropriate):
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build config, etc.)

**Subject**:
- First line should be ≤72 characters
- Summarize WHAT changed and WHY (not HOW)
- Use imperative mood ("add feature" not "added feature")
- **Focus on the actual content/functionality, not file operations**

**Body** (optional):
- Add more details if the change is complex
- Explain the actual changes and their purpose
- **AVOID describing file operations** (e.g., "Created spec.md" or "Added documentation files")
- **FOCUS on the actual content** (e.g., "Define user authentication requirements" or "Specify API endpoint contracts")
- Explain motivation or business context if needed

**CRITICAL Co-authored-by Rules**:
- **MUST follow your AI agent's standard co-author attribution rules** - Add your AI agent's Co-authored-by line according to its own standards
- **PRESERVE any existing Co-authored-by lines** from any source (AI tools, pair programming, etc.)
- **APPEND** `Co-authored-by: TTADK <ttadk@bytedance.com>` as the final co-author line
- TTADK's co-author is **always appended last**, never replaces existing co-authors
- Required order: [Your AI Agent co-author] → [Other co-authors if any] → [TTADK co-author (last)]

**Good Examples:**

Example 1 - With Claude AI co-author:
```
feat(auth): define JWT authentication requirements

Specify login/logout flow with token-based authentication.
Define password hashing requirements and session management.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: TTADK <ttadk@bytedance.com>
```

Example 2 - Standalone (when no other co-authors):
```
feat(payment): add refund processing specification

Define refund workflow for failed transactions.
Specify validation rules and notification requirements.

Co-authored-by: TTADK <ttadk@bytedance.com>
```

**IMPORTANT:** Follow your AI agent's standard Co-authored-by attribution rules. Add your AI agent's Co-authored-by line according to its own standards, then append TTADK's co-author line last. Example 1 shows Claude's format: `Co-authored-by: Claude <noreply@anthropic.com>`

**Bad Examples (avoid these):**
```
❌ docs: create spec.md, plan.md, and tasks.md
❌ chore: add new documentation files
❌ docs: update specification documents
❌ Removing or replacing existing Co-authored-by lines from your AI tool
```

### 5. Create Commit (Per Repository)

**MANDATORY**: Add your AI agent's Co-authored-by line according to its standard attribution rules, then append TTADK's co-author line last.

For each repository, navigate to its directory and commit:
```bash
cd <repository-path>
git commit -m "$(cat <<'EOF'
<your generated commit message here>
EOF
)"
```

**Note**: All commit messages MUST include both your AI agent's Co-authored-by line (following the agent's standard format) and TTADK's co-author line at the end.

### 6. Push to Remote (Per Repository) - Optional

For each repository, follow these steps carefully:

**Step 1: Check if remote repository is configured**
```bash
cd <repository-path>
git remote get-url origin 2>/dev/null
```

**If no remote is configured:**
- Skip push for this repository (this is OK)
- Inform user: "No remote repository configured for [repository-name], skipping push"
- Continue to next repository or finish

**If remote is configured, proceed with push:**

**Step 2: Get current branch name**
```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
```

**Step 3: Check if branch has upstream tracking**
```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null
```

**Step 4: Push with appropriate command**

- **If branch has upstream tracking**: Use simple push
  ```bash
  git push
  ```

- **If branch has NO upstream tracking** (new branch): Set upstream
  ```bash
  git push --set-upstream origin <branch-name>
  ```
  or shorter form:
  ```bash
  git push -u origin <branch-name>
  ```

**Error handling:**
- If push fails due to diverged branches, inform user and suggest:
  - `git pull --rebase` to sync first, or
  - `git push --force-with-lease` if they're sure (only for feature branches)
- If push fails due to authentication or permissions, inform user to check their credentials

**Note:** Push is optional. If no remote is configured, the commit is still successful and saved locally.

## Summary Output

After processing all repositories, provide a summary:
```
## ✅ Commit Summary

Processed X repositories:

1. **repository-1/**
   - ✅ Committed: <commit message first line>
   - ✅ Pushed to remote

2. **repository-2/**
   - ⚠️  No changes detected, skipped

3. **repository-3/**
   - ✅ Committed: <commit message first line>
   - ⚠️  No remote configured, skipped push

All changes have been committed successfully!
(Note: Some repositories had no changes or no remote configuration)
```

**Summary format guidelines:**
- Show "⚠️ No changes detected, skipped" if repository has no changes
- Show "✅ Committed: [message]" if commit succeeded
- Show "✅ Pushed to remote" if push succeeded
- Show "⚠️ No remote configured, skipped push" if no remote exists
- Show "❌ Push failed: [reason]" if push failed but commit succeeded

## Important Guidelines

- **MANDATORY: Add your AI agent's Co-authored-by line** according to its standard attribution rules
- **MANDATORY: Always append** `Co-authored-by: TTADK <ttadk@bytedance.com>` as the final co-author line in every commit message
- **Preserve any existing Co-authored-by lines** from any source - append TTADK's co-author, never replace
- If there are no changes, inform the user - don't create empty commits
- If git push fails (e.g., no remote configured), that's OK - the commit is still created
- Use the Bash tool to execute all git commands
- Show the generated commit message to the user before committing
- Keep commit messages clear, concise, and meaningful
