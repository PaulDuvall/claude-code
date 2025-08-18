---
description: Generate code templates, boilerplate, and standardized patterns for consistent development practices
tags: [templates, boilerplate, code-generation, patterns, scaffolding]
---

Generate templates and boilerplate code based on the arguments provided in $ARGUMENTS.

First, examine the current project structure to understand context:
!ls -la package.json requirements.txt setup.py pyproject.toml 2>/dev/null | head -3
!find . -name "*.template" -o -name "*.tmpl" -o -name "*template*" | head -5 2>/dev/null
!ls -la templates/ scaffolds/ generators/ 2>/dev/null || echo "No template directories found"
!git remote -v 2>/dev/null | head -1 || echo "No git remote configured"

Based on $ARGUMENTS, perform the appropriate template generation operation:

## 1. Code Template Generation

If generating code templates (--code, --component, --service, --model):
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | head -10
!ls -la src/ app/ lib/ components/ services/ models/ 2>/dev/null | head -5
!which python 2>/dev/null && python --version || echo "Python not available"
!which node 2>/dev/null && node --version || echo "Node.js not available"

Generate code templates:
- Class and function templates
- Component and service templates
- Data model and schema templates
- API controller and endpoint templates
- Module and package structures

## 2. Test Template Generation

If generating test templates (--test, --mock, --fixture, --spec-test):
!find . -name "*test*" -o -name "*spec*" | head -10 2>/dev/null
!ls -la tests/ test/ spec/ __tests__/ 2>/dev/null | head -3
!python -c "import pytest; print('pytest available')" 2>/dev/null || npm test --version 2>/dev/null || echo "No test framework detected"

Generate test templates:
- Unit and integration test templates
- Mock object and service templates
- Test fixture and data templates
- Assertion and expectation templates
- Specification-driven test templates

## 3. Project Structure Templates

If generating project templates (--project, --microservice, --api, --library):
!ls -la README.md LICENSE .gitignore 2>/dev/null | head -3
!find . -name "Dockerfile" -o -name "docker-compose.yml" | head -2
!ls -la .github/ .gitlab/ .circleci/ 2>/dev/null | head -2

Generate project structures:
- Complete project scaffolding
- Microservice architecture templates
- API and web service templates
- Library and package templates
- CLI application templates

## 4. Configuration Templates

If generating configuration templates (--config, --docker, --ci-cd, --infrastructure):
!find . -name "*.yml" -o -name "*.yaml" -o -name "*.json" | grep -E "(config|docker|ci|cd)" | head -5
!ls -la config/ configs/ .env* docker-compose.yml Dockerfile 2>/dev/null | head -5
!which docker 2>/dev/null && docker --version || echo "Docker not available"

Generate configuration templates:
- Application configuration files
- Docker and container templates
- CI/CD pipeline configurations
- Infrastructure as code templates
- Environment-specific configurations

## 5. Documentation Templates

If generating documentation templates (--docs, --readme, --api-docs, --architecture):
!find . -name "*.md" | head -10
!ls -la docs/ documentation/ README.md 2>/dev/null | head -3
!find . -name "openapi.yml" -o -name "swagger.yml" -o -name "api.yml" | head -2 2>/dev/null

Generate documentation templates:
- README and project documentation
- API documentation templates
- Architecture documentation
- User guides and tutorials
- Technical specifications

Think step by step about template generation requirements and provide:

1. **Template Analysis**:
   - Current project structure assessment
   - Language and framework detection
   - Existing template identification
   - Template requirements gathering

2. **Generation Strategy**:
   - Template type selection and customization
   - Variable substitution and parameterization
   - Best practice integration
   - Consistency and standardization

3. **Implementation Plan**:
   - Template creation and validation
   - Integration with existing codebase
   - Documentation and usage guidelines
   - Maintenance and update procedures

4. **Quality Assurance**:
   - Template testing and validation
   - Code quality and standard compliance
   - Reusability and maintainability
   - Team adoption and feedback

Generate comprehensive templates with proper structure, documentation, best practices, and customization options.

If no specific operation is provided, analyze current project structure and recommend appropriate template generation strategy based on detected languages, frameworks, and project patterns.

