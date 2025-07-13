# /xacp — Add • Commit • Push with detailed description

Automates the complete git workflow: stages all changes, generates a Conventional Commits message, commits, and pushes to the current branch.

## What it does:
1. **Stages** all changes with `git add .`
2. **Analyzes** changes to generate smart commit messages
3. **Commits** with Conventional Commits format (feat:, fix:, docs:, etc.)
4. **Pushes** to remote with upstream tracking

## Smart commit message generation:
- Detects commit type based on file patterns and content
- Creates detailed bullet-point summaries of changes
- Follows Conventional Commits specification
- Keeps summary under 50 characters

## Usage:
```
/xacp
```

No arguments needed - it handles everything automatically!

---

#!/bin/bash

# Custom Claude Code slash‑command that stages everything, generates a Conventional Commits message
# covering all changes since the last push, commits, and then pushes to the current branch's upstream.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[ACP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ACP]${NC} $1"
}

print_error() {
    echo -e "${RED}[ACP]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Check if there are any changes to stage
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    print_warning "No changes to commit"
    exit 0
fi

print_status "Staging all changes..."

# Stage everything
git add .

# Check if anything was actually staged
if git diff --cached --quiet; then
    print_warning "No changes staged for commit"
    exit 0
fi

print_status "Inspecting staged changes..."

# Get file-level summary
STAT_OUTPUT=$(git diff --cached --stat)
echo "$STAT_OUTPUT"
echo

# Get detailed diff (limited for readability)
DIFF_OUTPUT=$(git diff --cached --color=never | head -100)

# Get context of commits not yet pushed
UNPUSHED_COMMITS=$(git log --oneline --graph @{u}.. 2>/dev/null || git log --oneline -5)

print_status "Generating Conventional Commits message..."

# Analyze changes to determine commit type and generate message
COMMIT_TYPE="chore"
COMMIT_SCOPE=""
COMMIT_DESCRIPTION=""
COMMIT_BODY=""

# Count different types of changes
NEW_FILES=$(echo "$STAT_OUTPUT" | grep -c "create mode" || echo "0")
MODIFIED_FILES=$(echo "$STAT_OUTPUT" | grep -c "file changed\|files changed" || echo "0")
DELETED_FILES=$(echo "$STAT_OUTPUT" | grep -c "delete mode" || echo "0")

# Analyze file patterns to determine commit type
if echo "$STAT_OUTPUT" | grep -q "\.md\|README\|CHANGELOG\|LICENSE\|\.txt"; then
    COMMIT_TYPE="docs"
elif echo "$STAT_OUTPUT" | grep -q "test\|spec\|\.test\.\|\.spec\."; then
    COMMIT_TYPE="test"
elif echo "$STAT_OUTPUT" | grep -q "package\.json\|yarn\.lock\|package-lock\.json\|Cargo\.toml\|requirements\.txt\|go\.mod"; then
    COMMIT_TYPE="chore"
elif [ "$NEW_FILES" -gt 0 ] && echo "$DIFF_OUTPUT" | grep -q "^+.*function\|^+.*class\|^+.*def \|^+.*fn \|^+.*export"; then
    COMMIT_TYPE="feat"
elif echo "$DIFF_OUTPUT" | grep -q "fix\|bug\|error\|issue"; then
    COMMIT_TYPE="fix"
elif echo "$DIFF_OUTPUT" | grep -q "refactor\|rename\|move"; then
    COMMIT_TYPE="refactor"
else
    # Default logic based on change patterns
    if [ "${NEW_FILES:-0}" -gt 0 ]; then
        COMMIT_TYPE="feat"
    elif [ "${DELETED_FILES:-0}" -gt 0 ]; then
        COMMIT_TYPE="refactor"
    fi
fi

# Generate commit description based on changes
if [ "${NEW_FILES:-0}" -gt 0 ] && [ "${MODIFIED_FILES:-0}" -gt 0 ]; then
    COMMIT_DESCRIPTION="add new files and update existing code"
elif [ "${NEW_FILES:-0}" -gt 0 ]; then
    COMMIT_DESCRIPTION="add new functionality"
elif [ "${DELETED_FILES:-0}" -gt 0 ]; then
    COMMIT_DESCRIPTION="remove unused code"
elif [ "${MODIFIED_FILES:-0}" -gt 0 ]; then
    COMMIT_DESCRIPTION="update existing functionality"
else
    COMMIT_DESCRIPTION="update project files"
fi

# Generate detailed commit body
COMMIT_BODY=""
while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*([^[:space:]]+)[[:space:]]+\|[[:space:]]*([0-9]+)[[:space:]]*[\+\-]+ ]]; then
        filename="${BASH_REMATCH[1]}"
        changes="${BASH_REMATCH[2]}"
        if [ -n "$COMMIT_BODY" ]; then
            COMMIT_BODY="$COMMIT_BODY"$'\n'
        fi
        COMMIT_BODY="$COMMIT_BODY* $filename: $changes changes"
    fi
done <<< "$(echo "$STAT_OUTPUT" | grep -v "^ [0-9]")"

# Create final commit message
COMMIT_SUMMARY="$COMMIT_TYPE: $COMMIT_DESCRIPTION"

# Ensure summary is under 50 characters
if [ ${#COMMIT_SUMMARY} -gt 50 ]; then
    COMMIT_SUMMARY="${COMMIT_SUMMARY:0:47}..."
fi

print_status "Commit message:"
echo "Summary: $COMMIT_SUMMARY"
if [ -n "$COMMIT_BODY" ]; then
    echo "Details:"
    echo "$COMMIT_BODY"
fi
echo

print_status "Committing changes..."

# Create commit with proper message format
if [ -n "$COMMIT_BODY" ]; then
    git commit -m "$COMMIT_SUMMARY" -m "$COMMIT_BODY" -m "Generated with [Claude Code](https://claude.ai/code)" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
else
    git commit -m "$COMMIT_SUMMARY" -m "Generated with [Claude Code](https://claude.ai/code)" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
fi

# Get the commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)
BRANCH_NAME=$(git branch --show-current)

print_status "Pushing to remote..."

# Check if remote exists
if ! git remote -v | grep -q origin; then
    print_error "No 'origin' remote configured"
    exit 1
fi

# Check current branch tracking
TRACKING_BRANCH=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")

# Push with upstream tracking (verbose for debugging)
print_status "Attempting push with upstream tracking..."
if git push --follow-tags --set-upstream origin "$BRANCH_NAME"; then
    REMOTE_URL=$(git remote get-url --push origin 2>/dev/null || echo "unknown")
    print_status "✅ Pushed $COMMIT_HASH to $BRANCH_NAME → $REMOTE_URL"
    echo "Commit: $COMMIT_SUMMARY"
elif git push --follow-tags; then
    REMOTE_URL=$(git remote get-url --push origin 2>/dev/null || echo "unknown")
    print_status "✅ Pushed $COMMIT_HASH to $BRANCH_NAME → $REMOTE_URL"
    echo "Commit: $COMMIT_SUMMARY"
else
    print_error "Failed to push changes"
    print_error "Branch: $BRANCH_NAME"
    print_error "Tracking: $TRACKING_BRANCH"
    git status --porcelain
    exit 1
fi