---
description: Auto-generate code, tests, and documentation from specifications using AI
tags: [generation, ai, code, tests, documentation, automation]
---

Generate code, tests, and documentation based on the arguments provided in $ARGUMENTS.

First, examine the project structure and identify generation targets:
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | head -10
!ls -la specs/ 2>/dev/null || echo "No specs directory found"
!find specs/specifications/ -name "*.md" 2>/dev/null | head -5 || echo "No specifications found"

Based on $ARGUMENTS, perform the appropriate code generation:

## 1. Generate Tests from Specifications

If generating tests (--test):
!find specs/specifications/ -name "*.md" -exec grep -l "$spec_id" {} \; 2>/dev/null || echo "Specification not found"
@specs/specifications/$specification_file 2>/dev/null || echo "Unable to read specification"

Generate test file:
- Extract requirements from specification
- Create test cases covering all scenarios
- Include proper traceability links to specification ID
- Follow testing framework conventions (pytest, jest, etc.)
- Add assertion patterns based on specification authority

## 2. Generate Implementation Code

If generating code (--code):
!find . -name "*test*" | grep "$test_name" | head -1
@$test_file 2>/dev/null || echo "Test file not found"

Generate minimal implementation:
- Analyze test requirements and assertions
- Create minimal code to satisfy all tests
- Follow project coding standards
- Include proper error handling
- Add docstrings and type hints

## 3. Generate Schema Definitions

If generating schema (--schema):
!find . -name "*.py" -exec grep -l "$model_name" {} \; | head -3
!python -c "import inspect; print('Python inspection available')" 2>/dev/null || echo "Python not available"

Generate Pydantic schema:
- Extract field definitions from existing models
- Add proper type annotations
- Include validation rules
- Add field descriptions and examples
- Handle relationships and dependencies

## 4. Generate Documentation

If generating documentation (--docs):
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | xargs grep -l "$component" | head -5
!python -c "import ast; print('AST parsing available')" 2>/dev/null || echo "AST parsing not available"

Generate component documentation:
- Extract docstrings and comments
- Generate API reference documentation
- Create usage examples
- Add parameter and return type documentation
- Include integration examples

## 5. Generate Configuration Files

If generating config (--config):
!ls -la | grep -E "(config|env|yml|yaml|json|toml)"
!find . -name "*.example" -o -name "*.template" | head -3

Generate configuration:
- Create environment-specific config files
- Add validation schemas
- Include default values and examples
- Add documentation comments
- Handle sensitive data properly

## 6. Template-Based Generation

Check for existing templates:
!find . -name "*template*" -o -name "*scaffold*" | head -5
!ls -la templates/ 2>/dev/null || echo "No templates directory"

Use templates when available:
- Load appropriate template for generation type
- Replace placeholders with actual values
- Customize based on project structure
- Maintain consistent formatting

Think step by step about the generation requirements and:

1. **Analyze Input**:
   - Understand the specification or test requirements
   - Identify the target output format and structure
   - Determine dependencies and relationships

2. **Generate Content**:
   - Create minimal, focused implementation
   - Follow established patterns and conventions
   - Include proper error handling and validation
   - Add comprehensive documentation

3. **Ensure Quality**:
   - Validate generated code syntax
   - Check compliance with project standards
   - Verify traceability links are maintained
   - Test generated code functionality

4. **Integration**:
   - Place generated files in appropriate locations
   - Update imports and dependencies
   - Integrate with existing codebase
   - Maintain project structure consistency

Generate high-quality, well-documented code that follows SpecDriven AI principles and integrates seamlessly with the existing project structure.