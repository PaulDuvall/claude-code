---
description: Interactive refactoring assistant based on Martin Fowler's catalog and project-specific rules for code smell detection
tags: [refactoring, code-smells, quality, patterns, analysis]
---

Analyze code for refactoring opportunities based on the arguments provided in $ARGUMENTS.

## Usage Examples

**Basic refactoring analysis:**
```
/xrefactor
```

**Detect code smells:**
```
/xrefactor --smell
```

**Find duplicate code:**
```
/xrefactor --duplicates
```

**Help and options:**
```
/xrefactor --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

First, examine the project structure for Python files to analyze:
!find . -name "*.py" -type f | grep -v __pycache__ | head -20
!ls -la src/ app/ lib/ 2>/dev/null || echo "No standard Python directories found"
!python --version 2>/dev/null || echo "Python not available"

Based on $ARGUMENTS, perform the appropriate refactoring analysis:

## 1. Code Smell Detection

If analyzing code smells (--smell, --analyze, --detect):
!find . -name "*.py" | xargs wc -l | sort -nr | head -10
!python -c "import ast; print('AST analysis available')" 2>/dev/null || echo "Python AST not available"
!grep -r "def " . --include="*.py" | wc -l
!grep -r "class " . --include="*.py" | wc -l

Detect common code smells:
- Long methods and large classes
- Duplicate code patterns
- Complex conditional logic
- Missing error handling
- Hardcoded configuration values

## 2. Bloater Detection

If detecting bloaters (--bloaters, --long-methods, --large-classes):
!python -c "
import ast
import os
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.py'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r') as f:
                    tree = ast.parse(f.read())
                    for node in ast.walk(tree):
                        if isinstance(node, ast.FunctionDef):
                            if hasattr(node, 'end_lineno') and node.end_lineno - node.lineno > 20:
                                print(f'Long method: {node.name} in {filepath} ({node.end_lineno - node.lineno} lines)')
            except: pass
" 2>/dev/null || echo "Python AST analysis not available"

Analyze bloater patterns:
- Methods longer than 20-30 lines
- Classes with more than 200 lines
- Parameter lists with more than 3-4 parameters
- Data classes with too many fields
- Large conditional expressions

## 3. Change Preventer Detection

If detecting change preventers (--change-preventers, --coupling):
!grep -r "import " . --include="*.py" | wc -l
!python -c "
import ast
import os
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.py'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r') as f:
                    content = f.read()
                    if content.count('if ') > 10:
                        print(f'High conditional complexity in {filepath}')
            except: pass
" 2>/dev/null

Identify change preventers:
- Divergent change patterns
- Shotgun surgery indicators
- Parallel inheritance hierarchies
- Refused bequest patterns
- Alternative classes with different interfaces

## 4. Dispensable Code Detection

If detecting dispensables (--dispensables, --dead-code, --duplicates):
!grep -r "TODO\|FIXME\|XXX" . --include="*.py" | wc -l
!find . -name "*.py" -exec grep -l "^#.*unused\|^#.*deprecated" {} \; | wc -l
!python -c "
import ast
import os
from collections import defaultdict

class_methods = defaultdict(list)
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.py'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r') as f:
                    tree = ast.parse(f.read())
                    for node in ast.walk(tree):
                        if isinstance(node, ast.ClassDef):
                            methods = [n.name for n in node.body if isinstance(n, ast.FunctionDef)]
                            if len(methods) < 2:
                                print(f'Potential lazy class: {node.name} in {filepath}')
            except: pass
" 2>/dev/null

Find dispensable code:
- Dead code and unused variables
- Duplicate code blocks
- Lazy classes with minimal functionality
- Data classes without behavior
- Comments and temporary fields

## 5. Coupler Detection

If detecting couplers (--couplers, --dependencies):
!find . -name "*.py" | xargs grep -l "\.[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_]" | head -10
!python -c "
import ast
import os
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.py'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r') as f:
                    content = f.read()
                    # Look for feature envy patterns (lots of method calls on other objects)
                    if content.count('.') > len(content.split('\n')) * 0.3:
                        print(f'Potential feature envy in {filepath}')
            except: pass
" 2>/dev/null

Detect coupling issues:
- Feature envy patterns
- Inappropriate intimacy between classes
- Message chains and law of Demeter violations
- Middle man classes
- Temporary field usage

Think step by step about refactoring opportunities and provide:

1. **Code Smell Analysis**:
   - Identified code smells and their severity
   - Location and context of problematic code
   - Impact assessment on maintainability
   - Priority ranking for refactoring

2. **Refactoring Strategy**:
   - Recommended refactoring techniques
   - Step-by-step refactoring approach
   - Risk assessment and mitigation
   - Testing strategy during refactoring

3. **Implementation Plan**:
   - Prioritized refactoring tasks
   - Dependencies between refactoring steps
   - Timeline and effort estimation
   - Team coordination requirements

4. **Quality Improvements**:
   - Expected code quality improvements
   - Maintainability and readability gains
   - Performance impact assessment
   - Long-term technical debt reduction

Generate comprehensive refactoring analysis with smell detection, improvement recommendations, implementation guidance, and quality metrics.

If no specific operation is provided, perform comprehensive code smell detection and recommend refactoring priorities based on Martin Fowler's refactoring catalog and current code analysis.