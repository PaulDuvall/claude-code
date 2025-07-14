---
description: Manage project configuration files, environment variables, and application settings
tags: [configuration, environment, validation, schema, security]
---

Manage configuration files and settings based on the arguments provided in $ARGUMENTS.

First, examine the project structure for configuration files:
!ls -la | grep -E "(config|env|\.yml|\.yaml|\.json|\.toml)"
!find . -maxdepth 2 -name "*.yml" -o -name "*.yaml" -o -name "*.json" -o -name "*.toml" -o -name ".env*" | head -10

Based on $ARGUMENTS, perform the appropriate configuration operation:

## 1. Configuration File Validation

If validating configuration (--validate):
!python -c "import yaml; print('YAML parser available')" 2>/dev/null || echo "Install PyYAML: pip install pyyaml"
!python -c "import json; print('JSON parser available')" 2>/dev/null

Validate configuration files:
@config.yml 2>/dev/null || @config.yaml 2>/dev/null || @config.json 2>/dev/null || echo "No standard config file found"

Check for:
- Valid syntax (YAML/JSON/TOML)
- Required fields present
- Correct data types
- Security issues (exposed secrets)

## 2. Schema Operations

If working with schemas (--schema, --schema-validate):
!pip list | grep pydantic 2>/dev/null || echo "Install Pydantic: pip install pydantic"

For Python projects with Pydantic:
!find . -name "*.py" -exec grep -l "BaseModel\|pydantic" {} \; | head -5

Validate configuration against schema:
- Type checking
- Constraint validation
- Required field verification
- Default value application

## 3. Environment Management

If managing environments (--env, --dev, --staging, --production):
!ls -la .env* 2>/dev/null || echo "No environment files found"
!printenv | grep -E "(NODE_ENV|ENVIRONMENT|ENV)" || echo "No environment variables set"

Manage environment-specific configurations:
- Development settings
- Staging configurations
- Production parameters
- Local overrides

## 4. Template Generation

If generating templates (--template, --generate):
Create configuration templates based on project type:
!ls package.json 2>/dev/null && echo "Node.js project detected" || echo "Not a Node.js project"
!ls requirements.txt setup.py pyproject.toml 2>/dev/null && echo "Python project detected" || echo "Not a Python project"

Generate appropriate configuration templates for the detected project type.

## 5. Format Conversion

If converting formats (--convert):
!python -c "import yaml, json, toml" 2>/dev/null || echo "Install required parsers: pip install pyyaml toml"

Convert between formats:
- YAML to JSON
- JSON to TOML
- Environment variables to YAML
- Configuration normalization

## 6. Security and Secrets

If managing secrets (--secrets, --encrypt):
!grep -r "password\|secret\|key" . --include="*.yml" --include="*.yaml" --include="*.json" | grep -v "example\|template" | head -5

Check for:
- Hardcoded secrets
- Unencrypted sensitive data
- Proper secret management
- Environment variable usage

Recommend:
- Use environment variables for secrets
- Implement proper secret management
- Encrypt sensitive configuration data
- Use vault services for production

Think step by step about configuration management best practices and provide:
- Current configuration status
- Security recommendations
- Environment setup guidance
- Schema validation results
- Format conversion options

Report configuration health and suggest improvements for better configuration management.

