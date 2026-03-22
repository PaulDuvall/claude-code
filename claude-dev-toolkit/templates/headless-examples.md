# Headless Mode Patterns for Claude Code

Copy-paste patterns for running Claude Code non-interactively in CI pipelines, cron jobs, and batch scripts.

## Quick Reference

```bash
# Basic headless invocation
claude -p "your prompt here" --output-format text

# With allowed tools
claude -p "run tests" --allowedTools "Bash(npm test)" --output-format text

# Print only (no tool use)
claude -p "explain this function" --output-format text

# JSON output for parsing
claude -p "list all TODO comments" --output-format json
```

## CI Pipeline Examples

### GitHub Actions: Code Review Bot

```yaml
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Review PR changes
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          DIFF=$(git diff origin/main...HEAD)
          claude -p "Review this diff for bugs, security issues, and style problems. Be concise. Diff: $DIFF" \
            --output-format text > review.txt
          cat review.txt

      - name: Post review comment
        if: always()
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          if [ -f review.txt ]; then
            gh pr comment ${{ github.event.pull_request.number }} \
              --body "$(cat review.txt)"
          fi
```

### GitHub Actions: Test Generation

```yaml
name: Generate Missing Tests
on:
  workflow_dispatch:
    inputs:
      target_path:
        description: 'Path to generate tests for'
        required: true
        default: 'src/'

jobs:
  generate-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: |
          npm install -g @anthropic-ai/claude-code
          npm ci

      - name: Generate tests
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p "Find files in ${{ inputs.target_path }} that lack test coverage and generate unit tests for them. Write tests to the appropriate test directory." \
            --allowedTools "Read,Write,Glob,Grep,Bash(npm test)" \
            --output-format text

      - name: Verify tests pass
        run: npm test

      - name: Create PR with tests
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          git checkout -b auto/generate-tests-$(date +%s)
          git add -A
          git diff --cached --quiet && exit 0
          git commit -m "test: add generated unit tests"
          git push -u origin HEAD
          gh pr create --title "test: add generated unit tests" \
            --body "Auto-generated tests for uncovered files in ${{ inputs.target_path }}"
```

### GitHub Actions: Security Scan

```yaml
name: Claude Security Audit
on:
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6am UTC
  workflow_dispatch:

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run security audit
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p "Scan this repository for security vulnerabilities: hardcoded secrets, SQL injection, XSS, insecure dependencies, and OWASP Top 10 issues. Output a markdown report." \
            --allowedTools "Read,Glob,Grep" \
            --output-format text > security-report.md

      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: security-report
          path: security-report.md
```

### GitLab CI: Documentation Generator

```yaml
generate-docs:
  stage: docs
  image: node:20
  variables:
    ANTHROPIC_API_KEY: $ANTHROPIC_API_KEY
  script:
    - npm install -g @anthropic-ai/claude-code
    - claude -p "Generate API documentation for all public functions in src/. Write output to docs/api.md" \
        --allowedTools "Read,Write,Glob,Grep" \
        --output-format text
    - git add docs/
    - git diff --cached --quiet || git commit -m "docs: auto-generate API documentation"
  only:
    - main
```

## Cron Job Patterns

### Daily Dependency Check

```bash
#!/bin/bash
# /etc/cron.d/claude-dependency-check
# 0 8 * * * /path/to/dependency-check.sh

set -euo pipefail

PROJECT_DIR="/path/to/project"
REPORT_DIR="/var/log/claude-reports"
DATE=$(date +%Y-%m-%d)

cd "$PROJECT_DIR"
mkdir -p "$REPORT_DIR"

claude -p "Check for outdated dependencies. List any with known vulnerabilities. Suggest safe upgrade paths." \
  --allowedTools "Read,Bash(npm outdated),Bash(npm audit)" \
  --output-format text > "$REPORT_DIR/deps-$DATE.txt"

# Alert if vulnerabilities found
if grep -qi "vulnerab" "$REPORT_DIR/deps-$DATE.txt"; then
  echo "Vulnerabilities found - see $REPORT_DIR/deps-$DATE.txt"
  # Add notification: email, Slack webhook, etc.
fi
```

### Weekly Code Quality Report

```bash
#!/bin/bash
# Run weekly: 0 9 * * 1 /path/to/quality-report.sh

set -euo pipefail

PROJECT_DIR="/path/to/project"
cd "$PROJECT_DIR"

REPORT=$(claude -p "Analyze code quality: identify the top 5 areas needing improvement, functions over 20 lines, cyclomatic complexity hotspots, and test coverage gaps. Format as a brief markdown report." \
  --allowedTools "Read,Glob,Grep" \
  --output-format text)

echo "$REPORT" > quality-report.md
echo "$REPORT"
```

### Nightly Test Health Monitor

```bash
#!/bin/bash
# 0 2 * * * /path/to/test-health.sh

set -euo pipefail

PROJECT_DIR="/path/to/project"
cd "$PROJECT_DIR"

# Run tests and capture output
TEST_OUTPUT=$(npm test 2>&1) || true

# Analyze failures
if echo "$TEST_OUTPUT" | grep -q "FAIL"; then
  claude -p "These test results contain failures. Analyze the root cause of each failure and suggest fixes. Test output: $TEST_OUTPUT" \
    --allowedTools "Read,Glob,Grep" \
    --output-format text > /tmp/test-analysis.txt

  cat /tmp/test-analysis.txt
fi
```

## Batch Script Templates

### Batch Process Multiple Files

```bash
#!/bin/bash
# Process a batch of files with Claude Code
set -euo pipefail

TARGET_PATTERN="${1:-src/**/*.ts}"
ACTION="${2:-add JSDoc comments to all exported functions}"

# Find matching files
FILES=$(find . -path "./$TARGET_PATTERN" -type f 2>/dev/null | head -50)

if [ -z "$FILES" ]; then
  echo "No files matching: $TARGET_PATTERN"
  exit 1
fi

echo "Processing $(echo "$FILES" | wc -l) files..."

claude -p "For each file matching the pattern '$TARGET_PATTERN': $ACTION. Only modify files that need changes." \
  --allowedTools "Read,Edit,Glob,Grep" \
  --output-format text
```

### Multi-Project Batch Update

```bash
#!/bin/bash
# Apply the same change across multiple projects
set -euo pipefail

PROJECTS=(
  ~/Code/service-auth
  ~/Code/service-orders
  ~/Code/service-notifications
)
CHANGE="Update the logger import from 'old-logger' to '@company/logger' and adapt all call sites"
BRANCH="chore/update-logger"

for project in "${PROJECTS[@]}"; do
  echo "=== Processing: $project ==="
  cd "$project"

  git checkout main && git pull
  git checkout -b "$BRANCH" 2>/dev/null || git checkout "$BRANCH"

  claude -p "$CHANGE" \
    --allowedTools "Read,Edit,Glob,Grep,Bash(npm test)" \
    --output-format text

  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "chore: update logger import"
    echo "Changes committed in $project"
  else
    echo "No changes needed in $project"
  fi
done
```

### Migration Script with Validation

```bash
#!/bin/bash
# Migrate codebase patterns with pre/post validation
set -euo pipefail

MIGRATION="Convert all class components to functional components with hooks"
PRE_CHECK="Count all class components and functional components"
POST_CHECK="Verify no class components remain and all tests pass"

echo "=== Pre-migration assessment ==="
claude -p "$PRE_CHECK" \
  --allowedTools "Read,Glob,Grep" \
  --output-format text | tee /tmp/pre-migration.txt

echo ""
echo "=== Executing migration ==="
claude -p "$MIGRATION" \
  --allowedTools "Read,Edit,Glob,Grep" \
  --output-format text | tee /tmp/migration-log.txt

echo ""
echo "=== Post-migration validation ==="
claude -p "$POST_CHECK" \
  --allowedTools "Read,Glob,Grep,Bash(npm test)" \
  --output-format text | tee /tmp/post-migration.txt
```

## allowedTools Configuration

### Minimal (Read-Only Analysis)

```bash
claude -p "..." --allowedTools "Read,Glob,Grep"
```

### Standard Development

```bash
claude -p "..." --allowedTools "Read,Write,Edit,Glob,Grep,Bash(npm test),Bash(npm run lint)"
```

### Full Automation

```bash
claude -p "..." --allowedTools "Read,Write,Edit,Glob,Grep,Bash(npm *),Bash(git *)"
```

### Scoped Bash Access

```bash
# Only allow specific commands
claude -p "..." \
  --allowedTools "Read,Edit,Glob,Grep,Bash(npm test),Bash(npm run build),Bash(git status),Bash(git diff)"
```

## Settings File for Headless Environments

Create `.claude/settings.json` in your project for consistent headless configuration:

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Edit",
      "Write",
      "Glob",
      "Grep",
      "Bash(npm test)",
      "Bash(npm run lint)",
      "Bash(npm run build)"
    ],
    "deny": [
      "Bash(rm *)",
      "Bash(git push *)"
    ]
  }
}
```

## Environment Variables

```bash
# Required
export ANTHROPIC_API_KEY="sk-ant-..."

# Optional: control model
export CLAUDE_MODEL="claude-sonnet-4-20250514"

# Optional: set max tokens for output
export CLAUDE_MAX_TOKENS=4096
```

## Tips

- **Always use `--output-format text`** for piping output to files or other commands
- **Use `--output-format json`** when parsing results programmatically
- **Scope `--allowedTools`** to the minimum needed for the task
- **Set timeouts** in CI to prevent runaway sessions
- **Capture exit codes** — Claude Code returns non-zero on failure
- **Use `--print` / `-p`** flag for single-turn non-interactive mode
- **Store API keys in CI secrets**, never in scripts or config files
