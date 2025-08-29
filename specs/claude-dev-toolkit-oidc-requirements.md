# Claude Dev Toolkit - GitHub OIDC Tool Requirements Specification

## Document Information
- **Version:** 1.0.0
- **Date:** 2025-08-29
- **Component:** claude-dev-toolkit OIDC Command Integration
- **Status:** Draft
- **Purpose:** Create new OIDC command with comprehensive GitHub Actions OIDC setup for AWS integration
- **EARS Format:** This specification follows the Easy Approach to Requirements Syntax (EARS)

## Overview

THE SYSTEM SHALL create a new OIDC command in claude-dev-toolkit to provide comprehensive GitHub Actions OIDC configuration with AWS through the toolkit's CLI framework.

## Glossary
- **OIDC**: OpenID Connect - Authentication protocol for GitHub Actions to AWS
- **IAM**: AWS Identity and Access Management  
- **claude-dev-toolkit**: The npm package providing Claude Code development automation
- **gh CLI**: GitHub command-line interface tool
- **AWS CLI**: Amazon Web Services command-line interface tool
- **Subcommand**: Individual command within the claude-dev-toolkit CLI structure

## Dependencies and Integration Points

### Integration Points
- **CLI Framework**: Leverages existing `lib/base/base-command.js` and `lib/command-selector.js`
- **Validation System**: Integrates with `lib/validation-utils.js` and `lib/dependency-validator.js`
- **Hook System**: Utilizes security hooks from `hooks/pre-write-security.sh` and `hooks/lib/`
- **Error Handling**: Uses `lib/error-handler-utils.js` framework

### Dependencies
- **Required Tools**: AWS CLI, GitHub CLI (validated via `lib/dependency-validator.js`)
- **Node.js**: 14+ (inherited from claude-dev-toolkit requirements)
- **Platform**: Unix-like systems (Linux/macOS) and Windows with WSL

## Functional Requirements - EARS Format

### Core Command Requirements

#### REQ-CMD-001: OIDC Command Execution
**Priority:** High  
**WHEN** user runs `claude-dev-toolkit oidc [options]`  
**THE SYSTEM SHALL** execute comprehensive GitHub OIDC setup using the toolkit's CLI framework

**Rationale:** Provide production-ready OIDC functionality for GitHub Actions to AWS integration  
**Acceptance Criteria:** 
- Command executes via toolkit CLI
- All operations use Node.js child_process through base-command.js
- Integrates with existing error handling and logging

#### REQ-CMD-002: Repository Variable Configuration
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
  --policy-dir <path>     Directory containing policy JSON files to merge
  --policy-url <url>      Policy from HTTPS URL
  --add-service <service> Add AWS service permissions (repeatable)
  --branch <branch>       Restrict access to specific branch
  --tag <tag>            Restrict access to specific tag
  --deployment-method <method> Deployment method (cli|cloudformation)
  --rollback             Remove existing OIDC configuration
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

#### REQ-POLICY-005: Policy Directory Support
**Priority:** Medium  
**WHEN** --policy-dir option provided  
**THE SYSTEM SHALL** load and merge multiple policy files from a dedicated directory

**Rationale:** Support modular policy management for complex deployments  
**Acceptance Criteria:**
- Reads all JSON files from specified directory (non-recursive)
- Validates each policy file independently
- Merges policies into single comprehensive policy
- Excludes example files (ending with -example.json)
- Clear error reporting for invalid policy files

#### REQ-POLICY-006: Trust Policy Scoping
**Priority:** High  
**WHEN** --branch or --tag options provided  
**THE SYSTEM SHALL** create trust policies scoped to specific branches or tags

**Rationale:** Enhanced security through branch-specific access control  
**Acceptance Criteria:**
- Support --branch flag for branch-specific access
- Support --tag flag for tag-specific access
- Generate StringEquals conditions in trust policy
- Validate branch/tag name formats
- Default to repository-wide access if not specified

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

#### REQ-DETECT-004: CloudFormation Stack Detection
**Priority:** Medium  
**WHEN** using CloudFormation deployment mode  
**THE SYSTEM SHALL** detect existing CloudFormation stacks for OIDC resources

**Rationale:** Support infrastructure-as-code deployment patterns  
**Acceptance Criteria:**
- Check for existing stacks with standard naming convention
- Support stack updates rather than recreation
- Detect drift between stack and actual resources
- Handle stack rollback scenarios

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

### Deployment Requirements

#### REQ-DEPLOY-001: CloudFormation Deployment Option
**Priority:** Medium  
**WHEN** --deployment-method cloudformation option provided  
**THE SYSTEM SHALL** deploy OIDC configuration using CloudFormation stacks

**Rationale:** Support infrastructure-as-code best practices  
**Acceptance Criteria:**
- Generate CloudFormation templates for OIDC provider and IAM roles
- Support stack lifecycle management (create/update/delete)
- Use consistent stack naming convention
- Handle stack dependencies and rollback scenarios
- Integration with existing CloudFormation workflows

#### REQ-DEPLOY-002: Rollback Capability
**Priority:** Medium  
**WHEN** --rollback option provided  
**THE SYSTEM SHALL** remove previously created OIDC resources

**Rationale:** Allow cleanup of OIDC configurations  
**Acceptance Criteria:**
- Track created resources in local state or tags
- Remove IAM roles, policies, and OIDC providers
- Remove GitHub repository variables
- Confirm deletion before proceeding
- Handle partial rollback scenarios gracefully

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
- Ability to run in quiet mode
- Verbose mode shows detailed command output
- Progress indication for operations over 5 seconds

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
**Priority:** High  
**WHEN** --dry-run option used  
**THE SYSTEM SHALL** display all operations that would be performed without making changes

**Rationale:** Preview changes safely and allow validation before execution  
**Acceptance Criteria:**
- Shows AWS CLI commands that would execute
- Shows GitHub CLI commands that would execute  
- Displays generated IAM policies in full
- Shows merged policy content when using --policy-dir
- Indicates existing vs new resources
- Lists all AWS resources that would be created/updated
- Shows GitHub repository variables that would be set
- Provides clear summary of all planned operations
- No actual AWS or GitHub changes made
- Returns appropriate exit code for validation results

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
- No persistent background processes
- Clean up temporary files
- Efficient API call patterns
- Minimal memory footprint during execution

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

#### REQ-DOC-002: Inline Code Documentation
**Priority:** Low  
**THE SYSTEM SHALL** include clear comments for complex functions and integration points

**Rationale:** Code maintainability and developer reference  
**Acceptance Criteria:**
- Complex functions have explanatory comments
- Integration points clearly documented
- Configuration options documented in code
- Security-related code clearly commented


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

# Use modular policy directory
claude-dev-toolkit oidc --policy-dir ./policies/

# Branch-specific OIDC configuration
claude-dev-toolkit oidc --branch main --template minimal

# CloudFormation deployment with rollback capability
claude-dev-toolkit oidc --deployment-method cloudformation --rollback

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
| REQ-CMD-002 | Repository Variables | test_oidc_github.js | High | Event-Driven |
| REQ-CLI-001 | Command Structure | test_oidc_cli.js | High | Ubiquitous |
| REQ-CLI-002 | Argument Processing | test_oidc_cli.js | High | Ubiquitous |
| REQ-CLI-003 | Zero Config Mode | test_oidc_cli.js | High | Event-Driven |
| REQ-POLICY-001 | Policy Templates | test_oidc_policies.js | High | Ubiquitous |
| REQ-POLICY-002 | Policy File Support | test_oidc_policies.js | High | Event-Driven |
| REQ-POLICY-003 | Policy URL Support | test_oidc_policies.js | Medium | Event-Driven |
| REQ-POLICY-004 | Service Addition | test_oidc_policies.js | Medium | Event-Driven |
| REQ-POLICY-005 | Policy Directory | test_oidc_policies.js | Medium | Event-Driven |
| REQ-POLICY-006 | Trust Policy Scoping | test_oidc_security.js | High | Event-Driven |
| REQ-DETECT-001 | Git Detection | test_oidc_detection.js | High | Event-Driven |
| REQ-DETECT-002 | AWS Config Detection | test_oidc_detection.js | Medium | Event-Driven |
| REQ-DETECT-003 | Resource Detection | test_oidc_detection.js | High | Event-Driven |
| REQ-DETECT-004 | CloudFormation Detection | test_oidc_cloudformation.js | Medium | Event-Driven |
| REQ-DEPLOY-001 | CloudFormation Deployment | test_oidc_cloudformation.js | Medium | Event-Driven |
| REQ-DEPLOY-002 | Rollback Capability | test_oidc_rollback.js | Medium | Event-Driven |
| REQ-HOOK-001 | Security Hooks | test_oidc_security.js | High | Event-Driven |
| REQ-HOOK-002 | Post-execution Logging | test_oidc_hooks.js | Medium | Event-Driven |
| REQ-ERR-001 | Error Framework | test_oidc_errors.js | High | Unwanted |
| REQ-ERR-002 | Partial Failure Recovery | test_oidc_errors.js | High | Unwanted |
| REQ-ERR-003 | Permission Errors | test_oidc_errors.js | High | Unwanted |
| REQ-OUT-001 | Progress Display | test_oidc_output.js | Medium | State-Driven |
| REQ-OUT-002 | Success Report | test_oidc_output.js | High | Event-Driven |
| REQ-OUT-003 | Dry-run Output | test_oidc_output.js | High | Event-Driven |
| REQ-SEC-001 | Credential Security | test_oidc_security.js | Critical | Ubiquitous |
| REQ-SEC-002 | Least Privilege | test_oidc_security.js | High | Ubiquitous |
| REQ-SEC-003 | Secure Communication | test_oidc_security.js | High | Event-Driven |

## Implementation Phases

### Phase 1: Core Command Implementation (Week 1-2)
- Implement basic CLI integration with toolkit framework
- Add auto-detection capabilities
- Basic policy templates
- Core OIDC provider and IAM role creation

### Phase 2: Advanced Features (Week 3-4)  
- Policy URL support and validation
- Service addition capabilities
- Comprehensive error handling
- Security hook integration

### Phase 3: Testing and Documentation (Week 5-6)
- Complete test suite implementation
- Documentation and help system
- Performance optimization
- User acceptance testing

### Phase 4: Production Release (Week 7-8)
- Final validation and security review
- Release preparation and deployment
- NPM package publication
- Documentation finalization

## Change Log
- **v1.0.0** (2025-08-29): Initial comprehensive specification for claude-dev-toolkit OIDC command

---

This specification defines the creation of a new OIDC command for comprehensive GitHub Actions OIDC setup integrated with the claude-dev-toolkit architecture, providing robust automation while maintaining security and following toolkit development patterns.