# `/xrules` - Rules as Code

Define, validate, and enforce development rules and coding standards as executable code.

## Usage

```bash
/xrules --define <rule>      # Define new rule
/xrules --validate           # Check compliance
/xrules --enforce            # Apply rules
/xrules --report             # Generate report
/xrules --update <rule>      # Update rule
```

## Options

### `--define <rule>`
Define a new development rule with enforcement criteria.

**Examples:**
```bash
/xrules --define "max-function-length"
/xrules --define "naming-conventions"
/xrules --define "security-standards"
/xrules --define "test-coverage-minimum"
```

### `--validate`
Check compliance against all defined rules.

**Examples:**
```bash
/xrules --validate           # Check all rules
/xrules --validate --rule "max-function-length"
/xrules --validate --component auth
/xrules --validate --severity critical
```

### `--enforce`
Apply rules and automatically fix violations where possible.

**Examples:**
```bash
/xrules --enforce            # Enforce all rules
/xrules --enforce --rule "formatting"
/xrules --enforce --auto-fix
/xrules --enforce --dry-run
```

### `--report`
Generate compliance reports and rule violation summaries.

**Examples:**
```bash
/xrules --report             # Full compliance report
/xrules --report --rule "security-standards"
/xrules --report --format json
/xrules --report --trend
```

### `--update <rule>`
Update existing rule definitions and enforcement criteria.

**Examples:**
```bash
/xrules --update "max-function-length"
/xrules --update --threshold 50
/xrules --update --severity warning
/xrules --update --exception "legacy-code"
```

## Common Rules

### Code Quality Rules
- **max-function-length**: Limit function length to promote readability
- **cyclomatic-complexity**: Control code complexity metrics
- **naming-conventions**: Enforce consistent naming patterns
- **documentation-required**: Require documentation for public APIs

### Security Rules
- **no-hardcoded-secrets**: Prevent credential exposure
- **dependency-security**: Check for vulnerable dependencies
- **input-validation**: Ensure proper input sanitization
- **authentication-required**: Enforce authentication patterns

### Testing Rules
- **test-coverage-minimum**: Require minimum test coverage percentage
- **test-naming**: Enforce test naming conventions
- **specification-traceability**: Ensure tests link to specifications
- **mock-usage**: Control test isolation and mocking

### Architecture Rules
- **layer-dependencies**: Enforce architectural boundaries
- **module-coupling**: Limit coupling between modules
- **design-patterns**: Enforce specific design patterns
- **api-versioning**: Ensure proper API versioning

## Integration

- **Quality**: Works with `/xquality` for automated enforcement
- **Testing**: Integrates with `/xtest` for test rule validation
- **Security**: Coordinates with `/xsecurity` for security rules
- **Specifications**: Links to `/xspec` for traceability rules
- **Governance**: Supports `/xgovernance` compliance workflows

## Rule Definition Format

```yaml
rule:
  name: "max-function-length"
  description: "Functions should not exceed 50 lines"
  severity: "warning"
  enforcement: "automatic"
  criteria:
    max_lines: 50
    exclude_patterns:
      - "test_*"
      - "*_fixture"
  remediation: "Consider breaking large functions into smaller ones"
```

## Output

Rule compliance reports, violation summaries, and automated fixes.