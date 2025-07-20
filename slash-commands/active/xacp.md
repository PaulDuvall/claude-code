---
description: Automate git workflow - stage, commit with smart messages, and push to specified branch
tags: [git, commit, automation, workflow, branching]
---

Automate the complete git workflow with intelligent commit message generation and branch management.

## Usage Examples

**Basic automated workflow:**
```
/xacp
```

**Push to specific branch:**
```
/xacp --branch feature-123
```

**Create new branch and push:**
```
/xacp --create-branch fix-bug
```

**Custom commit message:**
```
/xacp --message "Custom commit"
```

**Help and options:**
```
/xacp --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

First, verify this is a git repository and check current status:
!git rev-parse --git-dir 2>/dev/null || echo "Not a git repository"
!git status --porcelain

Parse arguments to determine branch operations and custom messages:
Based on $ARGUMENTS, extract:
- **Target branch**: `--branch <branch-name>` or current branch if not specified
- **Branch creation**: `--create-branch <branch-name>` to create and switch to new branch
- **Custom message**: `--message "<message>"` to override automatic commit message generation
- **Force push**: `--force` to enable force push (use with caution)

Check if there are any changes to commit:
!git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ] && echo "No changes to commit" || echo "Changes detected"

If no changes are found, exit. Otherwise, stage all changes:
!git add .

## Branch Management

Handle branch operations based on arguments:

**If creating new branch (--create-branch):**
!git checkout -b "${TARGET_BRANCH}" 2>/dev/null || echo "Branch creation failed"
!echo "Created and switched to new branch: ${TARGET_BRANCH}"

**If switching to existing branch (--branch):**
!git checkout "${TARGET_BRANCH}" 2>/dev/null || echo "Branch switch failed - branch may not exist"
!echo "Switched to branch: ${TARGET_BRANCH}"

**Current branch status:**
!git branch --show-current

## Commit Message Generation

Analyze the staged changes to generate an intelligent commit message:
!git diff --cached --stat
!git diff --cached --name-only | head -10

**If custom message provided (--message):**
Use the provided custom commit message directly.

**Otherwise, generate intelligent commit message:**
Think step by step about the changes to determine the appropriate commit type:
- Check for documentation files (.md, README, docs/) → docs
- Check for test files (test/, spec/, .test., .spec.) → test 
- Check for dependency files (package.json, requirements.txt) → chore
- Check for new functionality (new files with functions/classes) → feat
- Check for bug fixes (fix, bug, error in diff) → fix
- Check for refactoring (refactor, rename, move) → refactor
- Default for new files → feat
- Default for modifications → chore

Generate commit message following Conventional Commits format:
- type: description (under 50 chars)
- Include file change summary in body
- Add standard Claude Code footer

Execute the commit with generated or custom message:
!git commit -m "Generated commit message based on changes" -m "📋 Change summary:
* List of changed files and modifications" -m "🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

## Remote Push Operations

Check remote configuration and current branch:
!git remote -v | grep origin || echo "No origin remote configured"
!git branch --show-current

**Determine target branch for push:**
- Use `--branch <branch-name>` if specified
- Use `--create-branch <branch-name>` if creating new branch
- Default to current branch

**Push to remote with upstream tracking:**

**If force push requested (--force):**
!git push --force-with-lease origin ${TARGET_BRANCH} 2>/dev/null || echo "Force push failed - check remote configuration and conflicts"

**Standard push operation:**
!git push --follow-tags --set-upstream origin ${TARGET_BRANCH} 2>/dev/null || git push --follow-tags 2>/dev/null || echo "Push failed - check remote configuration"

**If new branch creation:**
!echo "New branch '${TARGET_BRANCH}' has been created and pushed to remote"

**Report results:**
!git log -1 --oneline
!echo "✅ Successfully staged, committed, and pushed changes to branch: $(git branch --show-current)"

## Error Handling and Guidance

If any step fails, provide clear error messages with troubleshooting guidance:

**Branch Issues:**
- Branch doesn't exist: Suggest using `--create-branch` instead of `--branch`
- Branch already exists: Confirm if you want to switch to existing branch
- No upstream: Automatically set upstream tracking on first push

**Push Issues:**
- Remote conflicts: Suggest `--force` flag if appropriate, or manual conflict resolution
- Authentication: Check git credentials and remote configuration
- Network issues: Retry or check internet connection

**Validation:**
- Ensure all staged changes are committed
- Verify remote branch tracking is properly configured
- Confirm successful push with remote branch status