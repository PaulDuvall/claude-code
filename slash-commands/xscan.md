# `/xscan` - Repository Scanning Command

Comprehensive repository scanning for patterns, security issues, compliance violations, and code quality problems.

## Purpose
Advanced repository scanning capabilities for finding specific patterns, security vulnerabilities, compliance issues, and infrastructure components.

## Options

### Pattern Scanning
```bash
/xscan --patterns <regex>     # Scan for specific patterns using regex
/xscan --text <string>        # Search for specific text strings
/xscan --files <pattern>      # Find files matching pattern
/xscan --extensions <ext>     # Scan files by extension
/xscan --keywords <terms>     # Search for specific keywords
```

### Security Scanning
```bash
/xscan --secrets              # Scan for hardcoded secrets and credentials
/xscan --vulnerabilities      # Scan for known vulnerabilities
/xscan --sensitive-data       # Scan for sensitive data patterns
/xscan --api-keys             # Scan for exposed API keys
/xscan --passwords            # Scan for hardcoded passwords
```

### Infrastructure Scanning
```bash
/xscan --roles                # Find IAM roles and policies
/xscan --iac-files            # Find Infrastructure as Code files
/xscan --docker               # Scan Docker files and configurations
/xscan --kubernetes           # Scan Kubernetes manifests
/xscan --terraform            # Scan Terraform configurations
```

### Compliance Scanning
```bash
/xscan --compliance <standard> # Scan for compliance violations
/xscan --license              # Scan for license compliance issues
/xscan --copyright            # Check copyright compliance
/xscan --gdpr                 # Scan for GDPR compliance issues
/xscan --pii                  # Scan for personally identifiable information
```

### Code Quality Scanning
```bash
/xscan --code-smells          # Scan for code smell patterns
/xscan --todo-comments        # Find TODO and FIXME comments
/xscan --deprecated           # Find deprecated code usage
/xscan --duplicate            # Find duplicate code blocks
/xscan --complexity           # Scan for overly complex code
```

### Dependency Scanning
```bash
/xscan --dependencies         # Scan project dependencies
/xscan --outdated             # Find outdated dependencies
/xscan --licenses             # Scan dependency licenses
/xscan --security-advisories  # Check for security advisories
/xscan --package-vulnerabilities # Scan for vulnerable packages
```

### Configuration Scanning
```bash
/xscan --config-files         # Find configuration files
/xscan --env-files            # Scan environment files
/xscan --database-configs     # Find database configurations
/xscan --api-configs          # Scan API configurations
/xscan --deployment-configs   # Find deployment configurations
```

Think step by step about scanning requirements and provide:

1. **Scan Strategy**:
   - Repository structure and scope analysis
   - Scanning pattern selection and prioritization
   - Performance and efficiency considerations
   - False positive mitigation strategies

2. **Security Assessment**:
   - Vulnerability identification and classification
   - Risk assessment and impact analysis
   - Security configuration evaluation
   - Compliance gap identification

3. **Analysis Framework**:
   - Pattern matching and search optimization
   - Multi-dimensional scanning approach
   - Result correlation and validation
   - Trend analysis and historical comparison

4. **Reporting and Remediation**:
   - Comprehensive finding documentation
   - Prioritized remediation recommendations
   - Compliance mapping and validation
   - Continuous monitoring setup

Generate comprehensive scanning analysis with pattern detection, security assessment, compliance validation, and remediation guidance.

If no specific operation is provided, perform comprehensive repository health scan and recommend scanning strategy based on detected languages, frameworks, and security requirements.

