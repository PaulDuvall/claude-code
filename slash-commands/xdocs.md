---
description: Generate and maintain comprehensive documentation from code
tags: [documentation, generation, maintenance]
---

Generate and maintain documentation from code, keeping it in sync with implementation.

Parse documentation options from $ARGUMENTS (--generate, --api, --readme, --check, or specific module/file).

## 1. Analyze Current Documentation

Check existing documentation:
!find . -name "*.md" | grep -v node_modules | head -20
!test -f README.md && echo "README exists" || echo "No README.md found"
!find . -name "*.py" -exec grep -l '"""' {} \; | wc -l

## 2. Generate Documentation

Based on the arguments and project type, generate appropriate documentation.

For Python projects, extract docstrings:
!python -c "import ast; import os; [print(f'{f}: {len([n for n in ast.walk(ast.parse(open(f).read())) if isinstance(n, ast.FunctionDef) and ast.get_docstring(n)])} documented functions') for f in os.listdir('.') if f.endswith('.py')]" 2>/dev/null

For JavaScript/TypeScript projects:
!grep -E "^(export |const |function |class )" *.js *.ts 2>/dev/null | head -20

## 3. API Documentation

If --api flag is present, analyze API endpoints:
!grep -r -E "@(app|router)\.(get|post|put|delete|patch)" . --include="*.py" 2>/dev/null | head -20
!grep -r -E "(app|router)\.(get|post|put|delete|patch)" . --include="*.js" 2>/dev/null | head -20

## 4. Check Documentation Coverage

Count undocumented functions:
!find . -name "*.py" -exec grep -E "^def |^class " {} \; | wc -l
!find . -name "*.py" -exec grep -A1 -E "^def |^class " {} \; | grep '"""' | wc -l

Think step by step about documentation needs and:

1. Identify what documentation is missing
2. Generate appropriate documentation based on code analysis
3. Create templates for missing documentation
4. Ensure examples are included where helpful

Generate documentation in this format:

For README.md:
```markdown
# Project Name

Brief description of what this project does.

## Installation

```bash
# Installation commands based on package.json or requirements.txt
```

## Usage

```python
# Example usage based on main entry points
```

## API Reference

### [Function/Class Name]
[Description from docstring or inferred from code]

**Parameters:**
- `param_name` (type): Description

**Returns:**
- type: Description

**Example:**
```python
# Example usage
```

## Contributing

See CONTRIBUTING.md for details.

## License

[License information]
```

For API documentation:
```markdown
# API Documentation

## Endpoints

### GET /endpoint
Description of what this endpoint does.

**Parameters:**
- `param` (query/path/body): Description

**Response:**
```json
{
  "field": "example"
}
```

**Example:**
```bash
curl -X GET http://localhost:8000/endpoint
```
```

If --check flag is present, generate a documentation coverage report:
```
📚 DOCUMENTATION COVERAGE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Coverage: X%

✅ DOCUMENTED (X/Y)
─────────────────
✓ module.py: X/Y functions
✓ api.py: X/Y endpoints

❌ MISSING DOCUMENTATION (X/Y)
─────────────────────────────
✗ utils.py: functionName (line X)
✗ models.py: ClassName (line X)

🔧 QUICK FIXES
────────────
1. Add docstring to functionName in utils.py
2. Document ClassName in models.py
3. Create API documentation for /endpoint

📝 TEMPLATES TO ADD
────────────────
- README.md sections: Usage, Examples
- API.md: Missing endpoint documentation
- CONTRIBUTING.md: Development setup
```

If --generate flag with specific file, create documentation for that file.
If --update flag, update existing documentation to match code changes.