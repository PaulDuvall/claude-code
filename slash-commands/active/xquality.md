---
description: Run code quality checks with maturity-aware thresholds and centralized-rules integration
tags: [quality, formatting, linting, type-checking, complexity, duplication]
---

# Code Quality Analysis

Run comprehensive code quality analysis aligned to centralized-rules standards. No parameters needed for basic usage.

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

**Check complexity metrics:**
```
/xquality complexity
```

**Help and options:**
```
/xquality help
/xquality --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

### Step 1: Detect Project Context

Examine project structure, language, and available tools:
!ls -la | grep -E "(pyproject.toml|setup.py|requirements.txt|package.json|composer.json|go.mod|Cargo.toml)"
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.go" | grep -v node_modules | head -10

Detect available quality tools:
!python -c "import ruff" 2>/dev/null && echo "Ruff available" || echo "Ruff not available"
!python -c "import mypy" 2>/dev/null && echo "MyPy available" || echo "MyPy not available"
!which eslint 2>/dev/null && echo "ESLint available" || echo "ESLint not available"

### Step 2: Apply Maturity-Aware Thresholds

Per centralized-rules/base/code-quality, apply thresholds based on project maturity:

| Practice | MVP/POC | Pre-Production | Production |
|----------|---------|----------------|------------|
| Linting | Recommended | Required | Required |
| Auto-formatting | Recommended | Required | Required |
| Type checking | Optional | Recommended | Required |
| Complexity limits | Optional | Recommended | Required |
| Duplication detection | Optional | Recommended | Required |
| Pre-commit hooks | Optional | Recommended | Required |

Core thresholds (centralized-rules standard):
- **Function length**: 20-25 lines max
- **File length**: 300-500 lines max
- **Cyclomatic complexity**: < 10 per function
- **Test coverage**: 80%+ (production)

### Step 3: Execute Based on Mode

**Mode 1: Default Analysis (no arguments or "check")**
If $ARGUMENTS is empty or contains "check":

Run comprehensive quality analysis:

1. **Format Check**: Verify code formatting consistency
!ruff format . --check 2>/dev/null || npx prettier --check "**/*.{js,ts}" 2>/dev/null || echo "No formatter configured"

2. **Lint Analysis**: Check for bugs, style issues, best practices
!ruff check . --statistics 2>/dev/null || npx eslint . --format compact 2>/dev/null || echo "No linter configured"

3. **Type Safety**: Validate type annotations
!mypy . --ignore-missing-imports 2>/dev/null || npx tsc --noEmit 2>/dev/null || echo "No type checker configured"

4. **Naming Conventions** (per centralized-rules):
   - Functions use verb phrases (`calculate_total`, `validate_email`)
   - Booleans use `is_`, `has_`, `should_` prefixes
   - Follow language-specific conventions

**Mode 2: Quick Fix (argument: "fix")**
If $ARGUMENTS contains "fix":

Apply automated improvements:
!ruff check . --fix-only 2>/dev/null && echo "Auto-fixed linting issues"
!ruff format . 2>/dev/null && echo "Applied code formatting"
!npx eslint . --fix 2>/dev/null || echo "No JS/TS auto-fix needed"

Report what was changed.

**Mode 3: Complexity Analysis (argument: "complexity")**
If $ARGUMENTS contains "complexity":

Measure function and file complexity against centralized-rules thresholds:

!find . -name "*.py" -not -path "*/node_modules/*" -not -path "*/__pycache__/*" | head -20

For each source file, analyze:
- **Cyclomatic complexity**: Flag functions > 10
- **Function length**: Flag functions > 25 lines
- **File length**: Flag files > 500 lines
- **Nesting depth**: Flag nesting > 3 levels

Suggest refactoring triggers (per centralized-rules):
- Function/file exceeds size limits -> Extract Method/Class
- Duplicated code exists -> Extract shared function
- Missing error handling -> Add specific exception handling
- Unclear naming -> Rename to verb phrases

**Mode 4: Detailed Report (argument: "report")**
If $ARGUMENTS contains "report":

Generate comprehensive metrics:
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | grep -v node_modules | wc -l
!grep -r "TODO\|FIXME\|XXX\|HACK" . --include="*.py" --include="*.js" --include="*.ts" | wc -l 2>/dev/null || echo "0"
!find . -name "*.py" -not -path "*/node_modules/*" | xargs wc -l 2>/dev/null | tail -1

Report:
- Total lines of code and file counts
- Technical debt indicators (TODOs, FIXMEs, HACKs)
- Functions exceeding complexity threshold
- Files exceeding length threshold
- Unused code (dead imports, unreachable paths)
- Quality score vs centralized-rules maturity level

## Analysis and Reporting

Apply centralized-rules code review checklist:
- [ ] Functions appropriately sized (<=25 lines)
- [ ] No duplicated code
- [ ] Proper error handling (specific exceptions)
- [ ] Clear, descriptive names (verb phrases for functions)
- [ ] Documentation complete (public APIs)
- [ ] Type safety enforced
- [ ] No unused code (imports, variables, dead paths)
- [ ] Follows language conventions
- [ ] Cyclomatic complexity < 10

Provide:
1. **Quality Summary**: Overall assessment with maturity-appropriate pass/fail
2. **Critical Issues**: Problems that violate centralized-rules standards
3. **Quick Wins**: Easy fixes with high impact
4. **Refactoring Triggers**: Functions/files that exceed thresholds
5. **Next Steps**: Prioritized action items

Keep output focused and actionable.