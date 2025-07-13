---
description: Comprehensive code quality analysis with automated formatting, linting, and type checking
tags: [quality, formatting, linting, type-checking, mypy, ruff, standards]
---

Execute comprehensive code quality checks and improvements based on the arguments provided in $ARGUMENTS.

First, examine the project structure and quality tools:
!ls -la | grep -E "(pyproject.toml|setup.py|requirements.txt|package.json)"
!python -c "import ruff" 2>/dev/null && echo "Ruff available" || echo "Ruff not available"
!python -c "import mypy" 2>/dev/null && echo "MyPy available" || echo "MyPy not available"

Based on $ARGUMENTS, perform the appropriate quality operation:

## 1. Type Checking Analysis

If running type checking (--mypy):
!find . -name "*.py" | head -10
!python -c "import mypy; print('MyPy available')" 2>/dev/null || echo "Install with: pip install mypy"

Execute comprehensive type checking:
- Analyze type annotations across codebase
- Check for type consistency and errors
- Report missing type annotations
- Validate generic types and protocols
- Generate type coverage metrics

## 2. Code Linting and Style

If running linting (--ruff):
!python -c "import ruff; print('Ruff available')" 2>/dev/null || echo "Install with: pip install ruff"
!ruff check . --statistics 2>/dev/null || echo "No ruff configuration found"

Execute comprehensive linting:
- Check code style and formatting
- Identify potential bugs and issues
- Validate import organization
- Analyze code complexity
- Report style violations

## 3. Code Formatting

If formatting code (--format):
!ruff format . --check 2>/dev/null && echo "Code properly formatted" || echo "Formatting needed"
!python -c "import black" 2>/dev/null && echo "Black available" || echo "Using ruff format"

Apply automated formatting:
- Standardize code formatting
- Fix import sorting and organization
- Apply consistent indentation and spacing
- Normalize string quotes and syntax
- Generate formatting report

## 4. Comprehensive Quality Analysis

If running all checks (--all):
!find . -name "*.py" -exec wc -l {} \; | awk '{sum+=$1} END {print "Total Python lines:", sum}'
!python -c "import ast, os; print('AST analysis available')" 2>/dev/null || echo "Basic analysis mode"

Execute complete quality pipeline:
- Run formatting checks and fixes
- Perform comprehensive linting
- Execute type checking analysis
- Generate quality metrics
- Report overall quality score

## 5. Quality Metrics and Reporting

If generating reports (--report, --metrics):
!find . -name "*.py" | wc -l
!grep -r "TODO\|FIXME\|XXX" . --include="*.py" | wc -l 2>/dev/null || echo "0"

Generate comprehensive quality metrics:
- Code coverage analysis
- Type coverage percentage
- Linting issue density
- Code complexity measurements
- Technical debt indicators

## 6. Quality Baseline and Trends

If establishing baseline (--baseline, --trend):
!ls -la .quality-baseline.json 2>/dev/null || echo "No existing baseline"
!date +%Y-%m-%d

Track quality over time:
- Establish quality baseline metrics
- Compare current state to baseline
- Track quality trend improvements
- Identify quality regressions
- Generate progress reports

## 7. Configuration Management

If checking configuration (--config):
!find . -name "pyproject.toml" -o -name "ruff.toml" -o -name "mypy.ini" | head -5
!ruff --version 2>/dev/null || echo "Ruff not installed"
!mypy --version 2>/dev/null || echo "MyPy not installed"

Manage quality tool configuration:
- Validate configuration files
- Check tool versions and compatibility
- Display current configuration settings
- Recommend configuration improvements
- Ensure consistent tool setup

## 8. Automated Quality Fixes

If applying fixes (--fix):
!ruff check . --fix-only 2>/dev/null || echo "No auto-fixable issues"
!ruff format . 2>/dev/null || echo "No formatting needed"

Apply automated quality improvements:
- Auto-fix linting violations
- Apply consistent code formatting
- Organize and sort imports
- Remove unused imports and variables
- Generate fix summary report

Think step by step about code quality requirements and provide:

1. **Quality Assessment**:
   - Current quality metrics and scores
   - Type coverage analysis
   - Linting issue categorization
   - Code complexity evaluation

2. **Issue Analysis**:
   - Critical quality issues requiring attention
   - Auto-fixable vs manual issues
   - Technical debt indicators
   - Performance impact assessment

3. **Improvement Recommendations**:
   - Priority order for quality fixes
   - Tool configuration optimizations
   - Code refactoring suggestions
   - Quality process improvements

4. **Quality Metrics Report**:
   - Overall quality score
   - Trend analysis and progress
   - Comparison to quality baselines
   - Team quality performance

Generate comprehensive quality report with actionable recommendations for improving code quality, maintainability, and team development standards.