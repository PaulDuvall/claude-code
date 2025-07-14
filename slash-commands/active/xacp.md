---
description: Automate git workflow - stage, commit with smart messages, and push changes
tags: [git, commit, automation, workflow]
---

Automate the complete git workflow with intelligent commit message generation.

First, verify this is a git repository and check current status:
!git rev-parse --git-dir 2>/dev/null || echo "Not a git repository"
!git status --porcelain

Check if there are any changes to commit:
!git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ] && echo "No changes to commit" || echo "Changes detected"

If no changes are found, exit. Otherwise, stage all changes:
!git add .

Analyze the staged changes to generate an intelligent commit message:
!git diff --cached --stat
!git diff --cached --name-only | head -10

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

Execute the commit with generated message:
!git commit -m "Generated commit message based on changes" -m "📋 Change summary:
* List of changed files and modifications" -m "🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

Check remote configuration and push:
!git remote -v | grep origin || echo "No origin remote configured"
!git branch --show-current

Push to remote with upstream tracking:
!git push --follow-tags --set-upstream origin $(git branch --show-current) 2>/dev/null || git push --follow-tags 2>/dev/null || echo "Push failed - check remote configuration"

Report the commit hash and summary:
!git log -1 --oneline
!echo "✅ Successfully staged, committed, and pushed changes"

If any step fails, provide clear error messages with troubleshooting guidance.