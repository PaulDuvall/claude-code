---
description: Comprehensive code analysis for quality, patterns, and issue identification
tags: [analysis, quality, refactoring]
---

Analyze the codebase for quality issues, patterns, and improvements.

First, examine the project structure:
!find . -type f -name "*.py" -o -name "*.js" -o -name "*.ts" | grep -v node_modules | grep -v __pycache__ | head -20

Based on the file structure and the arguments provided ($ARGUMENTS), perform the following analysis:

1. **Code Structure Analysis**:
   - Identify architectural patterns and anti-patterns
   - Check for circular dependencies
   - Analyze module coupling and cohesion
   - Look for code duplication

2. **Quality Metrics**:
   - Calculate cyclomatic complexity for functions
   - Check type annotation coverage
   - Identify functions longer than 50 lines
   - Find classes with more than 10 methods

3. **Security Issues**:
   - Look for hardcoded credentials or API keys
   - Check for SQL injection vulnerabilities
   - Identify missing input validation
   - Find exposed sensitive data

4. **Performance Concerns**:
   - Identify N+1 query patterns
   - Find inefficient loops or algorithms
   - Check for missing database indexes
   - Look for synchronous operations that could be async

For Python projects, run:
!python -m pylint **/*.py --output-format=json 2>/dev/null || echo "Pylint not available"
!python -m mypy . --ignore-missing-imports 2>/dev/null || echo "Mypy not available"

For JavaScript/TypeScript projects, run:
!npx eslint . --format json 2>/dev/null || echo "ESLint not available"

Think step by step about the analysis results and provide:
- A quality score (0-10) with justification
- Top 5 issues to fix with specific file locations
- Concrete recommendations for each issue
- Quick wins that can be implemented immediately

If specific analysis options were provided in $ARGUMENTS (like --security, --performance, --types), focus the analysis on those areas.

Generate a summary report in this format:
```
📊 Code Analysis Report
━━━━━━━━━━━━━━━━━━━━━
Quality Score: X/10

🔴 Critical Issues:
- [Issue description] at file:line

🟡 Warnings:
- [Issue description] at file:line

💡 Recommendations:
1. [Specific actionable recommendation]
2. [Specific actionable recommendation]

⚡ Quick Wins:
- [Easy fix with high impact]
```