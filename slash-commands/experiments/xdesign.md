---
description: Apply design patterns and architectural principles to improve code quality
tags: [design-patterns, architecture, solid, refactoring, best-practices]
---

Analyze code structure and apply design patterns based on the arguments provided in $ARGUMENTS.

First, examine the project structure and identify current patterns:
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.java" | head -15
!ls -la src/ app/ lib/ 2>/dev/null || echo "No standard source directories found"

Based on $ARGUMENTS, perform the appropriate design analysis:

## 1. Pattern Analysis and Suggestions

If analyzing patterns (--patterns, --analyze):
!grep -r "class" . --include="*.py" --include="*.js" --include="*.ts" | head -10
!grep -r "interface\|abstract" . --include="*.py" --include="*.js" --include="*.ts" | head -5

Analyze current code for:
- Existing design patterns
- Anti-patterns and code smells
- Opportunities for pattern application
- Architectural structure

## 2. SOLID Principles Assessment

If checking SOLID principles (--solid, --principles):
!find . -name "*.py" -exec grep -l "class" {} \; | head -5
!python -c "import ast; print('Analyzing class structures...')" 2>/dev/null || echo "Python AST analysis not available"

Check for:
- Single Responsibility Principle violations
- Open/Closed Principle compliance
- Liskov Substitution Principle adherence
- Interface Segregation implementation
- Dependency Inversion usage

## 3. Code Quality Analysis

If checking DRY violations (--dry):
!grep -r "def\|function" . --include="*.py" --include="*.js" | cut -d: -f2 | sort | uniq -c | sort -nr | head -10
!find . -name "*.py" -exec grep -l "copy\|duplicate" {} \; 2>/dev/null

Identify:
- Duplicated code blocks
- Similar functions/methods
- Copy-paste patterns
- Refactoring opportunities

## 4. Coupling and Cohesion Analysis

If analyzing coupling (--coupling):
!find . -name "*.py" -exec grep -c "import" {} \; | sort -nr | head -10
!grep -r "from.*import" . --include="*.py" | wc -l

Evaluate:
- Module dependencies
- Import complexity
- Circular dependencies
- Cohesion within modules

## 5. Refactoring Suggestions

If providing refactoring guidance (--refactor):
!find . -name "*.py" -exec wc -l {} \; | awk '$1 > 100 {print $2 ": " $1 " lines (consider refactoring)"}'
!grep -r "def" . --include="*.py" | wc -l | xargs echo "Total functions:"

Suggest:
- Extract method opportunities
- Class decomposition
- Interface extraction
- Dependency injection improvements

## 6. Specific Pattern Implementation

If implementing specific patterns (--factory, --observer, --strategy):
@src/ 2>/dev/null || @app/ 2>/dev/null || echo "No source directory to analyze"

Pattern suggestions based on context:
- Factory patterns for object creation
- Observer patterns for event handling
- Strategy patterns for algorithm selection
- Repository patterns for data access
- Decorator patterns for feature extension

## 7. Architecture Pattern Assessment

If checking architecture patterns (--mvc, --repository):
!find . -name "*model*" -o -name "*view*" -o -name "*controller*" | head -10
!find . -name "*repository*" -o -name "*service*" -o -name "*dao*" | head -5

Assess current architecture:
- MVC pattern implementation
- Layer separation
- Service layer design
- Data access patterns

## 8. Best Practices Review

If reviewing best practices (--best-practices, --clean-code):
!python -m flake8 . 2>/dev/null | head -10 || echo "No Python linting available"
!eslint . 2>/dev/null | head -10 || echo "No JavaScript linting available"

Review:
- Naming conventions
- Function/method length
- Class responsibilities
- Code complexity
- Documentation quality

Think step by step about design improvements and provide:
- Current design pattern usage
- Anti-pattern identification
- SOLID principle compliance
- Refactoring recommendations
- Architecture improvement suggestions
- Implementation guidance for suggested patterns

Generate a comprehensive design analysis with actionable recommendations for code quality improvement.

