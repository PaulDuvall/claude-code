---
description: Establish and track quality, performance, and security baselines with regression detection
tags: [baseline, metrics, performance, quality, regression, thresholds]
---

# Baseline Management

Establish intelligent baselines for quality, performance, and security metrics. Detect regressions against baselines. Aligns with the Baseline Management pattern from ai-development-patterns.

## Usage Examples

**Capture current baseline:**
```
/xbaseline capture
```

**Compare current state against baseline:**
```
/xbaseline check
```

**Show baseline drift over time:**
```
/xbaseline drift
```

**Set custom thresholds:**
```
/xbaseline threshold --coverage 85 --complexity 8
```

**Help and options:**
```
/xbaseline help
/xbaseline --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

### Step 1: Detect Project Context

Examine project for measurable metrics:
!ls -la | grep -E "(pyproject.toml|package.json|go.mod|Cargo.toml)"
!find . -name ".coverage" -o -name "coverage.xml" -o -name "lcov.info" | head -5
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.go" | grep -v node_modules | wc -l

### Step 2: Execute Based on Mode

**Mode 1: Capture Baseline (argument: "capture")**
If $ARGUMENTS contains "capture":

Collect current metrics and save as baseline:

1. **Code Metrics**:
!find . -name "*.py" -not -path "*/node_modules/*" -not -path "*/__pycache__/*" | xargs wc -l 2>/dev/null | tail -1
!find . -name "*.py" -not -path "*/node_modules/*" | wc -l 2>/dev/null

   Measure:
   - Total lines of code
   - Number of source files
   - Average file length
   - Functions exceeding 25 lines
   - Cyclomatic complexity distribution

2. **Test Metrics**:
!python -m pytest --co -q 2>/dev/null | tail -1 || echo "Test count not available"
   - Number of tests
   - Test execution time
   - Coverage percentage

3. **Quality Metrics**:
!ruff check . --statistics 2>/dev/null | tail -5 || echo "No linter baseline"
   - Linting violations count
   - Type errors count
   - TODO/FIXME count
!grep -r "TODO\|FIXME\|HACK" . --include="*.py" --include="*.js" --include="*.ts" | wc -l 2>/dev/null

4. **Security Metrics**:
   - Known dependency vulnerabilities
   - Hardcoded secret patterns found
   - Dangerous code patterns count

5. **Dependency Metrics**:
   - Total dependency count
   - Outdated dependencies
   - Dependencies with known CVEs

Save baseline to `.baseline.json` in project root with timestamp.

**Mode 2: Check Against Baseline (argument: "check" or no arguments)**
If $ARGUMENTS is empty or contains "check":

Compare current state against saved baseline:

1. Read `.baseline.json` (if not found, suggest running `capture` first)
2. Collect current metrics using same methods
3. Compare each metric and flag regressions:

   - Coverage dropped below baseline
   - Lint violations increased
   - Complexity increased
   - New security issues introduced
   - Test count decreased (tests deleted?)

Report as:
- IMPROVED: Metric better than baseline
- STABLE: Metric within acceptable range
- REGRESSED: Metric worse than baseline (flag with details)

**Mode 3: Drift Analysis (argument: "drift")**
If $ARGUMENTS contains "drift":

Show how metrics have changed since baseline was captured:
- Read `.baseline.json` for historical reference
- Calculate delta for each metric
- Identify trends (improving, stable, degrading)
- Highlight areas needing attention

**Mode 4: Custom Thresholds (argument: "threshold")**
If $ARGUMENTS contains "threshold":

Override default thresholds. Parse remaining arguments for:
- `--coverage N` — minimum coverage percentage
- `--complexity N` — maximum cyclomatic complexity
- `--violations N` — maximum lint violations
- `--file-length N` — maximum file length

Save custom thresholds to `.baseline.json`.

## Baseline Report Format

```
## Baseline Report — [date]

| Metric | Baseline | Current | Status |
|--------|----------|---------|--------|
| Test coverage | 82% | 79% | REGRESSED |
| Lint violations | 12 | 8 | IMPROVED |
| Avg complexity | 4.2 | 4.5 | STABLE |
| File count | 45 | 48 | STABLE |
| TODO count | 8 | 15 | REGRESSED |

### Regressions Requiring Action
- Coverage dropped 3% — review recently added code without tests
- TODO count increased — schedule tech debt cleanup
```

Keep output focused on regressions and actionable improvements.