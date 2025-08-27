# Claude Dev Toolkit - GitHub OIDC Tool Requirements Specification

## Document Information
- **Version:** 1.0.0
- **Date:** 2025-08-27
- **Component:** claude-dev-toolkit OIDC Command Integration
- **Status:** Draft
- **Purpose:** Enhance existing xoidc experimental command with comprehensive GitHub Actions OIDC setup
- **EARS Format:** This specification follows the Easy Approach to Requirements Syntax (EARS)

## Overview

THE SYSTEM SHALL enhance the existing experimental xoidc command in claude-dev-toolkit to provide comprehensive GitHub Actions OIDC configuration with AWS through the toolkit's CLI framework.

## Glossary
- **OIDC**: OpenID Connect - Authentication protocol for GitHub Actions to AWS
- **IAM**: AWS Identity and Access Management  
- **claude-dev-toolkit**: The npm package providing Claude Code development automation
- **gh CLI**: GitHub command-line interface tool
- **AWS CLI**: Amazon Web Services command-line interface tool
- **Subcommand**: Individual command within the claude-dev-toolkit CLI structure

## Dependencies and Integration Points

### Existing Integration
- **Current Command**: `/Users/paulduvall/Code/claude-code/claude-dev-toolkit/commands/experiments/xoidc.md`
- **CLI Framework**: Leverages existing `lib/base/base-command.js` and `lib/command-selector.js`
- **Validation System**: Integrates with `lib/validation-utils.js` and `lib/dependency-validator.js`
- **Hook System**: Utilizes security hooks from `hooks/pre-write-security.sh`

### Dependencies
- **Required Tools**: AWS CLI, GitHub CLI (validated via `lib/dependency-validator.js`)
- **Node.js**: 14+ (inherited from claude-dev-toolkit requirements)
- **Platform**: Unix-like systems (Linux/macOS) and Windows with WSL

## Functional Requirements - EARS Format

### Core Command Requirements

#### REQ-CMD-001: Enhanced OIDC Command Execution
**Priority:** High  
**WHEN** user runs `claude-dev-toolkit oidc [options]`  
**THE SYSTEM SHALL** execute comprehensive GitHub OIDC setup using the toolkit's CLI framework

**Rationale:** Upgrade experimental command to production-ready functionality  
**Acceptance Criteria:** 
- Command executes via toolkit CLI
- All operations use Node.js child_process through base-command.js
- Integrates with existing error handling and logging

#### REQ-CMD-002: Backward Compatibility  
**Priority:** High  
**WHEN** migrating from experimental xoidc command  
**THE SYSTEM SHALL** maintain all existing functionality while adding new features

**Rationale:** Preserve existing user workflows  
**Acceptance Criteria:** 
- All current xoidc.md parameters work
- New features are additive only
- Migration path documented

#### REQ-CMD-003: Repository Variable Configuration
**Priority:** High  
**WHEN** configuring GitHub repository  
**THE SYSTEM SHALL** set AWS_DEPLOYMENT_ROLE and AWS_REGION as repository variables using gh CLI

**Rationale:** These values are not sensitive and need to be accessible  
**Acceptance Criteria:** 
- Uses `gh variable set` command
- Variables are accessible to GitHub Actions workflows
- Error handling for GitHub API failures

### CLI Integration Requirements

#### REQ-CLI-001: Toolkit Command Structure
**Priority:** High  
**THE SYSTEM SHALL** implement as `claude-dev-toolkit oidc` subcommand following toolkit patterns

**Rationale:** Consistent with toolkit architecture  
**Acceptance Criteria:**
- Command registered in command-selector.js
- Follows base-command.js inheritance pattern
- Help text follows toolkit standards

#### REQ-CLI-002: Argument Processing
**Priority:** High  
**THE SYSTEM SHALL** accept command arguments via toolkit's argument parser:
```
claude-dev-toolkit oidc [options]
  --github-org <org>      GitHub organization (auto-detected from git remote)
  --github-repo <repo>    GitHub repository (auto-detected from git remote)  
  --role-name <name>      Custom IAM role name (default: github-actions-{org}-{repo})
  --region <region>       AWS region (default: from AWS config or us-east-1)
  --template <name>       Policy template (minimal|standard|full|custom)
  --policy-file <path>    Custom policy JSON file
  --policy-url <url>      Policy from HTTPS URL
  --add-service <service> Add AWS service permissions (repeatable)
  --dry-run              Preview changes without execution
  --verbose              Detailed output
  --quiet                Minimal output  
  --help                 Show command help
```

**Rationale:** Comprehensive configuration options with sensible defaults  
**Acceptance Criteria:**
- All options functional
- Argument validation through validation-utils.js
- Auto-detection of GitHub org/repo from git remote

#### REQ-CLI-003: Zero Configuration Mode
**Priority:** High  
**WHEN** user runs `claude-dev-toolkit oidc` with no arguments  
**THE SYSTEM SHALL** auto-detect all required parameters and use sensible defaults

**Rationale:** Maximum ease of use  
**Acceptance Criteria:**
- GitHub org/repo detected from git remote
- AWS region from AWS CLI config or defaults to us-east-1
- Standard policy template used by default
- Role name auto-generated

### Policy Management Requirements

#### REQ-POLICY-001: Built-in Policy Templates
**Priority:** High  
**THE SYSTEM SHALL** provide built-in IAM policy templates:
- **minimal**: S3 and CloudFormation basic permissions
- **standard**: Common deployment services (default template)  
- **full**: Administrative permissions with wildcards
- **custom**: User-provided policy file or URL

**Rationale:** Cover common use cases without requiring IAM expertise  
**Acceptance Criteria:**
- Templates embedded in command code
- JSON validation for all templates
- Template selection via --template option

#### REQ-POLICY-002: Policy File Support
**Priority:** High  
**WHEN** --policy-file option provided  
**THE SYSTEM SHALL** read, validate, and apply custom IAM policy from specified JSON file

**Rationale:** Support for custom organizational policies  
**Acceptance Criteria:**
- JSON syntax validation
- IAM policy structure validation  
- File existence and readability checks
- Clear error messages for invalid policies

#### REQ-POLICY-003: Policy URL Support
**Priority:** Medium  
**WHEN** --policy-url option provided  
**THE SYSTEM SHALL** fetch IAM policy from HTTPS URL with security validation

**Rationale:** Centralized organizational policy management  
**Acceptance Criteria:**
- Only HTTPS URLs accepted
- Certificate validation
- Response size limits
- JSON validation of fetched content

#### REQ-POLICY-004: Service Addition
**Priority:** Medium  
**WHEN** --add-service option used  
**THE SYSTEM SHALL** dynamically add AWS service permissions to the base template

**Rationale:** Easy customization without full policy specification  
**Acceptance Criteria:**
- Supports common AWS services (s3, lambda, rds, etc.)
- Service name validation
- Permission merging with base template
- Multiple services supported via repeated option

### Auto-Detection Requirements

#### REQ-DETECT-001: Git Repository Detection
**Priority:** High  
**THE SYSTEM SHALL** auto-detect GitHub organization and repository from current directory's git remote

**Rationale:** Eliminate manual parameter entry  
**Acceptance Criteria:**
- Supports both SSH and HTTPS git remotes
- Parses GitHub URLs correctly
- Handles multiple remotes (prefers 'origin')
- Clear error if not in Git repository or no GitHub remote

#### REQ-DETECT-002: AWS Configuration Detection  
**Priority:** Medium  
**THE SYSTEM SHALL** detect AWS region from AWS CLI configuration or environment

**Rationale:** Use existing AWS setup  
**Acceptance Criteria:**
- Reads from AWS CLI config files
- Checks AWS_DEFAULT_REGION environment variable
- Defaults to us-east-1 if no configuration found
- Validates region exists

#### REQ-DETECT-003: Existing Resource Detection
**Priority:** High  
**WHEN** checking AWS resources  
**THE SYSTEM SHALL** detect existing OIDC providers and IAM roles to avoid conflicts

**Rationale:** Idempotent operations  
**Acceptance Criteria:**
- Checks for existing GitHub OIDC provider
- Detects existing role with same name
- Updates existing resources rather than failing
- Reports what resources already exist

### Security Hook Integration Requirements

#### REQ-HOOK-001: Pre-execution Security Validation
**Priority:** High  
**BEFORE** executing AWS or GitHub operations  
**THE SYSTEM SHALL** trigger security validation hooks from `hooks/pre-write-security.sh`

**Rationale:** Consistent security validation across toolkit  
**Acceptance Criteria:**
- IAM policy validation for overly permissive policies
- GitHub token scope validation
- AWS credential validation
- Abort on security hook failures

#### REQ-HOOK-002: Post-execution Logging
**Priority:** Medium  
**AFTER** successful OIDC setup  
**THE SYSTEM SHALL** log configuration details via `hooks/file-logger.sh`

**Rationale:** Audit trail for security configuration  
**Acceptance Criteria:**
- Logs role ARN created
- Logs policy template/file used
- Logs GitHub repository configured
- Timestamp and user information included

### Dependency Validation Requirements

#### REQ-DEP-001: Tool Availability Checks
**Priority:** High  
**BEFORE** execution  
**THE SYSTEM SHALL** validate required tools via `lib/dependency-validator.js`:
- AWS CLI installation and version
- GitHub CLI installation and authentication status
- Git repository with GitHub remote
- Node.js version compatibility

**Rationale:** Fail fast with actionable errors  
**Acceptance Criteria:**
- Clear error messages for missing tools
- Installation instructions for detected platform
- Version compatibility checks
- Authentication status validation

#### REQ-DEP-002: Credential Validation
**Priority:** High  
**WHEN** validating dependencies  
**THE SYSTEM SHALL** verify AWS and GitHub authentication without exposing credentials

**Rationale:** Confirm access without security risks  
**Acceptance Criteria:**
- AWS credentials validated via sts:GetCallerIdentity
- GitHub authentication validated via gh auth status
- No credential values logged or displayed
- Specific error messages for auth failures

### Error Handling Requirements

#### REQ-ERR-001: Toolkit Error Framework Integration
**Priority:** High  
**THE SYSTEM SHALL** use toolkit's error handling framework from `lib/error-handler-utils.js`

**Rationale:** Consistent error handling across toolkit  
**Acceptance Criteria:**
- Structured error objects with error codes
- Contextual error messages
- Recovery suggestions where applicable
- Error logging through toolkit framework

#### REQ-ERR-002: Partial Failure Recovery
**Priority:** High  
**IF** AWS setup succeeds but GitHub configuration fails  
**THEN** THE SYSTEM SHALL** provide manual recovery instructions

**Rationale:** Allow completion of partially successful operations  
**Acceptance Criteria:**
- Clear indication of what succeeded
- Role ARN displayed for manual GitHub setup
- Exact gh CLI commands provided
- Option to retry GitHub configuration only

#### REQ-ERR-003: Permission Error Handling  
**Priority:** High  
**IF** AWS or GitHub permission errors occur  
**THEN** THE SYSTEM SHALL** provide specific remediation steps

**Rationale:** Guide users to resolve access issues  
**Acceptance Criteria:**
- Identify specific missing permissions
- Provide AWS policy requirements
- GitHub token scope requirements
- Links to relevant documentation

### Output and Reporting Requirements

#### REQ-OUT-001: Progress Indication
**Priority:** Medium  
**WHILE** executing operations  
**THE SYSTEM SHALL** display progress using toolkit's output framework with emoji indicators:
- 🔍 Checking prerequisites
- ⚙️ Configuring AWS OIDC provider
- 🔐 Creating IAM role and policies
- 📝 Configuring GitHub repository
- ✅ Setup completed successfully
- ❌ Error occurred

**Rationale:** User feedback for long-running operations  
**Acceptance Criteria:**
- Clear visual progress indicators
- Estimated time remaining for long operations
- Ability to run in quiet mode
- Verbose mode shows detailed command output

#### REQ-OUT-002: Comprehensive Success Report
**Priority:** High  
**WHEN** setup completes successfully  
**THE SYSTEM SHALL** display complete configuration summary:
- Created IAM role ARN
- AWS region configured  
- Policy template/file used
- GitHub repository variables set
- Example GitHub Actions workflow snippet
- Next steps and documentation links

**Rationale:** Provide all information needed to use the configuration  
**Acceptance Criteria:**
- All key information displayed
- Copy-pasteable values (role ARN, etc.)
- Valid workflow YAML example
- Links to GitHub Actions OIDC documentation

#### REQ-OUT-003: Dry-run Mode Output
**Priority:** Medium  
**WHEN** --dry-run option used  
**THE SYSTEM SHALL** display all operations that would be performed without making changes

**Rationale:** Preview changes safely  
**Acceptance Criteria:**
- Shows AWS CLI commands that would execute
- Shows GitHub CLI commands that would execute  
- Displays generated IAM policies
- Indicates existing vs new resources
- No actual AWS or GitHub changes made

### Validation and Testing Requirements

#### REQ-TEST-001: Integration with Toolkit Test Suite
**Priority:** High  
**THE SYSTEM SHALL** include comprehensive tests in the `tests/` directory following toolkit patterns

**Rationale:** Maintain toolkit quality standards  
**Acceptance Criteria:**
- Unit tests for all command functions
- Integration tests with mocked AWS/GitHub APIs
- CLI argument parsing tests
- Error condition tests
- Tests follow existing naming conventions

#### REQ-TEST-002: Mock Service Integration
**Priority:** Medium  
**WHEN** running tests  
**THE SYSTEM SHALL** use mock AWS and GitHub services to avoid external dependencies

**Rationale:** Reliable, isolated testing  
**Acceptance Criteria:**
- Mock AWS IAM and STS services
- Mock GitHub CLI responses
- Test both success and failure scenarios
- No actual AWS or GitHub resources created in tests

#### REQ-TEST-003: Policy Validation Testing
**Priority:** High  
**THE SYSTEM SHALL** include tests for all policy templates and validation logic

**Rationale:** Ensure security policy correctness  
**Acceptance Criteria:**
- Validate all built-in policy templates
- Test policy merging with --add-service
- Test policy file and URL validation
- Test security hook integration

## Non-Functional Requirements

### Performance Requirements

#### REQ-PERF-001: Toolkit Performance Standards
**Priority:** Medium  
**THE SYSTEM SHALL** complete OIDC setup within 30 seconds under normal conditions

**Rationale:** Maintain toolkit responsiveness  
**Acceptance Criteria:**
- Command startup under 2 seconds
- AWS operations complete within 15 seconds
- GitHub operations complete within 10 seconds
- Progress indication for operations over 5 seconds

#### REQ-PERF-002: Resource Efficiency
**Priority:** Medium  
**THE SYSTEM SHALL** use minimal system resources during execution

**Rationale:** Run efficiently on development machines  
**Acceptance Criteria:**
- Memory usage under 100MB
- No persistent background processes
- Clean up temporary files
- Efficient API call patterns

### Maintainability Requirements

#### REQ-MAINT-001: Code Organization
**Priority:** High  
**THE SYSTEM SHALL** follow toolkit code organization patterns:
- Main command logic in `lib/oidc-command.js`
- Policy templates in `lib/oidc-policies/`
- Tests in `tests/test_oidc_command.js`
- Documentation in command markdown file

**Rationale:** Consistent with toolkit architecture  
**Acceptance Criteria:**
- Follows existing file naming conventions
- Uses established patterns for CLI commands
- Proper separation of concerns
- Clear module boundaries

#### REQ-MAINT-002: Configuration Management
**Priority:** Medium  
**THE SYSTEM SHALL** support configuration via toolkit's config system

**Rationale:** Consistent configuration across toolkit  
**Acceptance Criteria:**
- Default settings configurable
- User preferences stored in toolkit config
- Environment variable support
- Configuration validation

### Documentation Requirements

#### REQ-DOC-001: Command Documentation  
**Priority:** High  
**THE SYSTEM SHALL** provide comprehensive documentation following toolkit standards:
- Enhanced markdown file in `commands/experiments/` or `commands/active/`
- Usage examples for all major scenarios
- Integration with toolkit help system
- Troubleshooting section

**Rationale:** User guidance and reference  
**Acceptance Criteria:**
- All options documented with examples
- Common workflows explained
- Error scenarios and solutions covered
- Links to external documentation

#### REQ-DOC-002: API Documentation
**Priority:** Medium  
**THE SYSTEM SHALL** include JSDoc comments for all public functions and classes

**Rationale:** Developer reference and maintainability  
**Acceptance Criteria:**
- All public methods documented
- Parameter and return types specified
- Usage examples in complex functions
- Integration points clearly documented

### Migration Requirements

#### REQ-MIG-001: Experimental to Active Migration Path
**Priority:** High  
**THE SYSTEM SHALL** provide clear migration from experimental xoidc to enhanced production command

**Rationale:** Smooth transition for existing users  
**Acceptance Criteria:**
- Migration documentation provided
- Compatibility mode during transition
- Clear timeline for deprecation
- User communication plan

#### REQ-MIG-002: Configuration Migration
**Priority:** Medium  
**IF** users have existing OIDC configurations  
**THE SYSTEM SHALL** detect and migrate existing setups where possible

**Rationale:** Minimize user setup work  
**Acceptance Criteria:**
- Detect existing IAM roles and OIDC providers
- Preserve existing configurations
- Update rather than recreate resources
- Clear indication of what was migrated

## Security Requirements

#### REQ-SEC-001: Credential Handling
**Priority:** Critical  
**THE SYSTEM SHALL** never store, log, or display AWS or GitHub credentials

**Rationale:** Security best practice  
**Acceptance Criteria:**
- Relies on AWS and GitHub CLI authentication
- No credential caching or persistence
- Audit logs exclude sensitive data
- Memory cleanup of sensitive operations

#### REQ-SEC-002: Least Privilege IAM Policies
**Priority:** High  
**THE SYSTEM SHALL** create IAM roles with minimal required permissions

**Rationale:** Security principle of least privilege  
**Acceptance Criteria:**
- Repository-specific trust policy conditions
- No wildcard permissions in default templates
- Security hook validation of policies
- Warning for overly permissive custom policies

#### REQ-SEC-003: Secure Communication
**Priority:** High  
**WHEN** fetching policies from URLs  
**THE SYSTEM SHALL** use HTTPS only with certificate validation

**Rationale:** Secure policy transmission  
**Acceptance Criteria:**
- Only HTTPS URLs accepted
- Certificate chain validation
- Timeout and size limits
- No HTTP redirect following

## Quality Assurance

### Exit Code Standards
- **0**: Success
- **1**: General error (configuration, validation, etc.)
- **2**: Missing prerequisites (tools, authentication)  
- **3**: AWS or GitHub API errors
- **4**: Security validation failures

### Logging Standards
- **Info**: Progress updates, configuration summary
- **Warn**: Non-fatal issues, security recommendations
- **Error**: Failures requiring user action
- **Debug**: Detailed operation information (verbose mode)

## Example Usage Scenarios

```bash
# Basic setup with auto-detection
claude-dev-toolkit oidc

# Custom role name and region  
claude-dev-toolkit oidc --role-name deploy-prod --region eu-west-1

# Minimal permissions template
claude-dev-toolkit oidc --template minimal

# Add specific AWS services to standard template
claude-dev-toolkit oidc --add-service lambda --add-service rds

# Use custom policy file
claude-dev-toolkit oidc --policy-file ./deploy-policy.json

# Use organizational policy URL
claude-dev-toolkit oidc --policy-url https://company.example/policies/github-deploy.json

# Preview changes without executing
claude-dev-toolkit oidc --dry-run --verbose

# Quiet mode for CI/CD integration
claude-dev-toolkit oidc --quiet --template standard
```

## Policy Template Definitions

### Minimal Template
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
      "s3:PutObject", 
      "s3:DeleteObject",
      "s3:ListBucket",
      "cloudformation:DescribeStacks",
      "cloudformation:CreateStack", 
      "cloudformation:UpdateStack",
      "cloudformation:DeleteStack",
      "sts:GetCallerIdentity"
    ],
    "Resource": "*"
  }]
}
```

### Standard Template (Default)
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "cloudformation:*",
      "s3:*",
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability", 
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecs:RegisterTaskDefinition",
      "ecs:UpdateService", 
      "ecs:DescribeServices",
      "lambda:CreateFunction",
      "lambda:UpdateFunctionCode",
      "lambda:UpdateFunctionConfiguration",
      "lambda:GetFunction",
      "lambda:InvokeFunction",
      "apigateway:*",
      "iam:PassRole",
      "iam:GetRole",
      "logs:CreateLogGroup",
      "logs:CreateLogStream", 
      "logs:PutLogEvents",
      "sts:GetCallerIdentity"
    ],
    "Resource": "*"
  }]
}
```

### Full Template
```json
{
  "Version": "2012-10-17", 
  "Statement": [{
    "Effect": "Allow",
    "Action": "*",
    "Resource": "*"
  }]
}
```

## Traceability Matrix

| Requirement ID | Component | Test File | Priority | EARS Pattern |
|---------------|-----------|-----------|----------|--------------|
| REQ-CMD-001 | CLI Integration | test_oidc_command.js | High | Event-Driven |
| REQ-CMD-002 | Compatibility | test_oidc_migration.js | High | State-Driven |  
| REQ-CLI-001 | Command Structure | test_oidc_cli.js | High | Ubiquitous |
| REQ-POLICY-001 | Templates | test_oidc_policies.js | High | Ubiquitous |
| REQ-DETECT-001 | Auto-detection | test_oidc_detection.js | High | Event-Driven |
| REQ-HOOK-001 | Security Hooks | test_oidc_security.js | High | Event-Driven |
| REQ-ERR-001 | Error Handling | test_oidc_errors.js | High | Unwanted |
| REQ-OUT-001 | Progress Display | test_oidc_output.js | Medium | State-Driven |
| REQ-SEC-001 | Credential Security | test_oidc_security.js | Critical | Ubiquitous |
| REQ-TEST-001 | Test Integration | test_oidc_*.js | High | Ubiquitous |

## Implementation Phases

### Phase 1: Core Command Enhancement (Week 1-2)
- Migrate experimental xoidc to enhanced command structure
- Implement basic CLI integration with toolkit framework
- Add auto-detection capabilities
- Basic policy templates

### Phase 2: Advanced Features (Week 3-4)  
- Policy URL support and validation
- Service addition capabilities
- Comprehensive error handling
- Security hook integration

### Phase 3: Testing and Documentation (Week 5-6)
- Complete test suite implementation
- Documentation and help system
- Migration tools and guides
- Performance optimization

### Phase 4: Production Release (Week 7-8)
- Move from experiments to active commands
- Final validation and security review
- User acceptance testing  
- Release preparation and deployment

## Change Log
- **v1.0.0** (2025-08-27): Initial comprehensive specification for claude-dev-toolkit integration

---

This specification defines the enhancement of the experimental xoidc command into a comprehensive GitHub Actions OIDC setup tool integrated with the claude-dev-toolkit architecture, providing robust automation while maintaining security and following toolkit development patterns.