---
description: Run code quality checks and fixes (defaults to all checks)
tags: [quality, formatting, linting, type-checking]
---

# Code Quality Analysis

Run comprehensive code quality analysis with smart defaults. No parameters needed for basic usage.

## Usage Examples

**Basic usage (runs all checks):**
```
/xquality
```

**Quick fix common issues:**
```
/xquality fix
```

**Generate detailed report:**
```
/xquality report
```

## Implementation

First, examine the project structure and available tools:
!ls -la | grep -E "(pyproject.toml|setup.py|requirements.txt|package.json|composer.json|go.mod)"
!python -c "import ruff" 2>/dev/null && echo "✓ Ruff available" || echo "⚠ Ruff not available"
!python -c "import mypy" 2>/dev/null && echo "✓ MyPy available" || echo "⚠ MyPy not available"

Determine what to do based on $ARGUMENTS (default to comprehensive analysis if no arguments):

**Mode 1: Default Analysis (no arguments or "check")**
If $ARGUMENTS is empty or contains "check":
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | head -10

Run comprehensive quality analysis:
1. **Format Check**: Verify code formatting consistency
2. **Lint Analysis**: Check for bugs, style issues, and best practices  
3. **Type Safety**: Validate type annotations and consistency
4. **Code Metrics**: Calculate complexity and maintainability scores

!ruff check . --statistics 2>/dev/null || echo "Ruff not available - install with: pip install ruff"
!ruff format . --check 2>/dev/null || echo "Formatting check skipped"
!python -c "import mypy" && mypy . --ignore-missing-imports 2>/dev/null || echo "MyPy not available - install with: pip install mypy"

**Mode 2: Quick Fix (argument: "fix")**
If $ARGUMENTS contains "fix":
!ruff check . --fix-only 2>/dev/null && echo "✓ Auto-fixed linting issues" || echo "No auto-fixable issues found"
!ruff format . 2>/dev/null && echo "✓ Applied code formatting" || echo "No formatting changes needed"

Apply automated improvements:
- Fix common linting violations automatically
- Apply consistent code formatting
- Organize imports and remove unused ones
- Report what was changed

**Mode 3: Detailed Report (argument: "report")**
If $ARGUMENTS contains "report":
!find . -name "*.py" | wc -l
!grep -r "TODO\|FIXME\|XXX" . --include="*.py" --include="*.js" --include="*.ts" | wc -l 2>/dev/null || echo "0"

Generate comprehensive metrics:
- Total lines of code and file counts
- Technical debt indicators (TODOs, FIXMEs)
- Quality score and recommendations
- Comparison to industry standards

## Analysis and Reporting

Think step by step about the code quality findings and provide:

1. **Quality Summary**: Overall assessment with clear pass/fail status
2. **Critical Issues**: Problems that need immediate attention
3. **Quick Wins**: Easy fixes that provide high impact
4. **Next Steps**: Prioritized action items for improvement

Generate a clear, actionable quality report showing:
- ✅ What's working well
- ⚠️ What needs attention  
- 🔧 What can be auto-fixed
- 📈 Improvement recommendations

Keep the output focused and actionable, avoiding overwhelming technical details unless specifically requested with "report" argument.