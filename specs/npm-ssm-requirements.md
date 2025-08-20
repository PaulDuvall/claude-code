# NPM Token Management via AWS SSM - Requirements Specification

## Document Information
- **Version:** 1.0.0
- **Date:** 2025-08-20
- **Author:** Paul Duvall
- **Status:** Draft
- **System:** NPM Token Storage and Access System

## Executive Summary
This specification defines requirements for securely storing NPM tokens in AWS Systems Manager Parameter Store and enabling GitHub Actions to access them via IAM roles with OIDC authentication, eliminating the need to store sensitive tokens in GitHub Secrets.

## Glossary

| Term | Definition |
|------|------------|
| **OIDC** | OpenID Connect - Authentication protocol for secure token exchange |
| **SSM** | AWS Systems Manager - Service for managing parameters and secrets |
| **NPM Token** | Authentication token for publishing packages to npm registry |
| **IAM Role** | AWS Identity and Access Management role for permissions |
| **STS** | AWS Security Token Service - Provides temporary security credentials |
| **GitHub Actions** | CI/CD platform for automating workflows |
| **Parameter Store** | AWS SSM feature for storing configuration data and secrets |
| **KMS** | AWS Key Management Service for encryption |

## Assumptions and Dependencies

### Assumptions
- AWS account is available and configured
- GitHub repository exists with Actions enabled
- NPM tokens are available for storage
- Python 3.x is installed for setup scripts
- AWS CLI is configured with appropriate permissions

### Dependencies
- GitHub OIDC Provider (token.actions.githubusercontent.com)
- AWS SSM Parameter Store service
- AWS KMS for parameter encryption
- GitHub CLI (gh) for automated secret configuration

## Functional Requirements

### Authentication and Authorization Requirements

#### REQ-AUTH-001: OIDC Provider Creation
**Priority:** High  
**Pattern:** Ubiquitous  
**THE SYSTEM SHALL** maintain a GitHub OIDC identity provider in AWS IAM with URL `https://token.actions.githubusercontent.com` and audience `sts.amazonaws.com`  
**Rationale:** Enables secure authentication between GitHub Actions and AWS without long-lived credentials  
**Acceptance Criteria:** 
- OIDC provider exists in AWS IAM
- Provider URL matches GitHub's token endpoint
- Thumbprint is configured correctly

#### REQ-AUTH-002: IAM Role Trust Policy
**Priority:** High  
**Pattern:** Ubiquitous  
**THE SYSTEM SHALL** enforce that the IAM role can only be assumed by the specific GitHub repository through OIDC authentication  
**Rationale:** Prevents unauthorized access from other repositories or sources  
**Acceptance Criteria:**
- Trust policy restricts to specific repo pattern
- No other principals can assume the role
- OIDC conditions are properly configured

#### REQ-AUTH-003: GitHub Actions OIDC Token Request
**Priority:** High  
**Pattern:** Event-Driven  
**WHEN** a GitHub Actions workflow runs with `id-token: write` permission  
**THE SYSTEM SHALL** request an OIDC token from GitHub and exchange it for AWS temporary credentials  
**Rationale:** Provides secure, temporary AWS access for the workflow  
**Acceptance Criteria:**
- Workflow successfully assumes IAM role
- Temporary credentials are obtained
- Session expires after configured duration

#### REQ-AUTH-004: Session Duration Limit
**Priority:** Medium  
**Pattern:** Ubiquitous  
**THE SYSTEM SHALL** limit IAM role session duration to a maximum of 1 hour by default  
**Rationale:** Minimizes exposure window if credentials are compromised  
**Acceptance Criteria:**
- Default session is 1 hour
- Can be configured up to 12 hours if needed
- Session expires automatically

### Secret Management Requirements

#### REQ-SEC-001: NPM Token Storage
**Priority:** High  
**Pattern:** Ubiquitous  
**THE SYSTEM SHALL** store NPM publishing tokens in AWS SSM Parameter Store as SecureString type with KMS encryption  
**Rationale:** Provides centralized, encrypted storage for sensitive tokens  
**Acceptance Criteria:**
- Token stored as SecureString parameter
- Parameter encrypted with KMS
- Parameter path follows naming convention

#### REQ-SEC-002: Token Retrieval
**Priority:** High  
**Pattern:** Event-Driven  
**WHEN** the GitHub Actions workflow needs to access NPM tokens  
**THE SYSTEM SHALL** retrieve the NPM token from SSM Parameter Store with decryption  
**Rationale:** Enables secure access to tokens during workflow execution  
**Acceptance Criteria:**
- Token retrieved successfully
- Decryption occurs automatically
- Token not exposed in logs

#### REQ-SEC-003: Token Isolation
**Priority:** High  
**Pattern:** Unwanted Behavior  
**IF** the NPM token is retrieved from SSM  
**THEN THE SYSTEM SHALL** ensure the token is never printed in logs or exposed in workflow outputs  
**Rationale:** Prevents accidental exposure of sensitive credentials  
**Acceptance Criteria:**
- Token masked in all outputs
- Environment variable not visible in logs
- No plain text exposure

#### REQ-SEC-004: Parameter Access Control
**Priority:** High  
**Pattern:** State-Driven  
**WHILE** the IAM role is active  
**THE SYSTEM SHALL** only allow access to specific SSM parameters containing NPM tokens  
**Rationale:** Implements least privilege principle  
**Acceptance Criteria:**
- Role can only access `/npm/*` parameters
- Cannot access other SSM parameters
- KMS decrypt permission limited to specific keys

### Setup and Configuration Requirements

#### REQ-SETUP-001: Automated Repository Detection
**Priority:** Medium  
**Pattern:** Event-Driven  
**WHEN** the setup script is executed  
**THE SYSTEM SHALL** automatically detect the GitHub repository from the git remote configuration  
**Rationale:** Reduces manual configuration and potential errors  
**Acceptance Criteria:**
- Script detects repository from git remote
- Handles both SSH and HTTPS URLs
- Validates repository format

#### REQ-SETUP-002: OIDC Provider Idempotency
**Priority:** High  
**Pattern:** Event-Driven  
**WHEN** the setup script attempts to create an OIDC provider  
**IF** the provider already exists  
**THEN THE SYSTEM SHALL** use the existing provider without error  
**Rationale:** Allows script to be run multiple times safely  
**Acceptance Criteria:**
- No error if provider exists
- Existing provider ARN returned
- No duplicate providers created

#### REQ-SETUP-003: IAM Role Creation
**Priority:** High  
**Pattern:** Event-Driven  
**WHEN** the setup script runs  
**THE SYSTEM SHALL** create an IAM role with SSM and KMS permissions for the detected repository  
**Rationale:** Provides necessary AWS permissions for NPM token access  
**Acceptance Criteria:**
- Role created with correct name pattern
- Trust policy configured for repository
- SSM and KMS policies attached

#### REQ-SETUP-004: GitHub Secret Configuration Output
**Priority:** High  
**Pattern:** Event-Driven  
**WHEN** the setup completes successfully  
**THE SYSTEM SHALL** output GitHub CLI commands to configure required secrets  
**Rationale:** Enables automated GitHub configuration  
**Acceptance Criteria:**
- Outputs `gh secret set` commands
- Includes AWS_DEPLOYMENT_ROLE value
- Includes AWS_REGION value
- Commands are executable

#### REQ-SETUP-005: Secret Automation Support
**Priority:** Medium  
**Pattern:** Optional Feature  
**WHERE** the GitHub CLI is available  
**THE SYSTEM SHALL** allow piping setup output directly to bash for automatic secret configuration  
**Rationale:** Provides fully automated setup option  
**Acceptance Criteria:**
- Output parseable by shell
- Commands execute successfully when piped
- Secrets created in GitHub


### Error Handling Requirements

#### REQ-ERR-001: Git Remote Detection Failure
**Priority:** High  
**Pattern:** Unwanted Behavior  
**IF** the setup script cannot detect a GitHub repository from git remote  
**THEN THE SYSTEM SHALL** display an error message and exit with non-zero status  
**Rationale:** Prevents misconfiguration  
**Acceptance Criteria:**
- Clear error message displayed
- Suggests corrective action
- Exit code indicates failure

#### REQ-ERR-002: AWS Authentication Failure
**Priority:** High  
**Pattern:** Unwanted Behavior  
**IF** AWS credentials are not configured or invalid  
**THEN THE SYSTEM SHALL** display authentication error and setup instructions  
**Rationale:** Guides user to resolve authentication issues  
**Acceptance Criteria:**
- Specific error about AWS auth
- Instructions for aws configure
- Exits gracefully

#### REQ-ERR-003: SSM Parameter Not Found
**Priority:** High  
**Pattern:** Unwanted Behavior  
**IF** the NPM token parameter does not exist in SSM  
**THEN THE SYSTEM SHALL** fail the workflow with a clear error message  
**Rationale:** Prevents silent failures in token retrieval  
**Acceptance Criteria:**
- Workflow fails explicitly
- Error indicates missing parameter
- Suggests parameter path to create

## Non-Functional Requirements

### Performance Requirements

#### REQ-PERF-001: Setup Script Execution Time
**Priority:** Low  
**Pattern:** Ubiquitous  
**THE SYSTEM SHALL** complete the setup script execution within 30 seconds  
**Rationale:** Ensures reasonable user experience during setup  
**Acceptance Criteria:**
- Setup completes in under 30 seconds
- Progress indicators shown
- No unnecessary delays

#### REQ-PERF-002: Token Retrieval Time
**Priority:** Medium  
**Pattern:** Event-Driven  
**WHEN** retrieving the NPM token from SSM  
**THE SYSTEM SHALL** complete the operation within 2 seconds  
**Rationale:** Minimizes workflow execution time  
**Acceptance Criteria:**
- SSM API call completes quickly
- No retry delays under normal conditions
- Timeout configured appropriately

### Security Requirements

#### REQ-NSEC-001: Encryption at Rest
**Priority:** High  
**Pattern:** Ubiquitous  
**THE SYSTEM SHALL** ensure all sensitive parameters are encrypted at rest using AWS KMS  
**Rationale:** Protects tokens from unauthorized access  
**Acceptance Criteria:**
- SecureString type enforced
- KMS key specified or default used
- Encryption verified

#### REQ-NSEC-002: Audit Logging
**Priority:** Medium  
**Pattern:** Ubiquitous  
**THE SYSTEM SHALL** ensure all token access is logged in AWS CloudTrail  
**Rationale:** Provides audit trail for security compliance  
**Acceptance Criteria:**
- SSM parameter access logged
- Role assumption logged
- Timestamps and identities captured

#### REQ-NSEC-003: Least Privilege
**Priority:** High  
**Pattern:** Ubiquitous  
**THE SYSTEM SHALL** grant only the minimum required permissions for NPM token access operations  
**Rationale:** Reduces security attack surface  
**Acceptance Criteria:**
- Only SSM GetParameter allowed
- Only specific parameter paths accessible
- No unnecessary AWS permissions

### Maintainability Requirements

#### REQ-MAIN-001: Token Rotation
**Priority:** Medium  
**Pattern:** Event-Driven  
**WHEN** an NPM token needs to be rotated  
**THE SYSTEM SHALL** allow updating the SSM parameter without modifying workflows  
**Rationale:** Simplifies credential management  
**Acceptance Criteria:**
- Parameter can be updated independently
- No workflow changes required
- Publishing continues working

#### REQ-MAIN-002: Multi-Repository Support
**Priority:** Low  
**Pattern:** Optional Feature  
**WHERE** multiple repositories need NPM token access  
**THE SYSTEM SHALL** support running the setup script for each repository independently  
**Rationale:** Enables scaling across projects  
**Acceptance Criteria:**
- Each repo gets unique IAM role
- Roles don't conflict
- Parameters can be shared or separated

## Traceability Matrix

| Requirement ID | Source | Priority | Implementation | Test Coverage | Status |
|---------------|--------|----------|----------------|---------------|---------|
| REQ-AUTH-001 | Security Policy | High | setup-github-actions-aws.py | TC-AUTH-001-01 | Implemented |
| REQ-AUTH-002 | Security Policy | High | setup-github-actions-aws.py | TC-AUTH-002-01 | Implemented |
| REQ-AUTH-003 | Architecture | High | npm-publish.yml | TC-AUTH-003-01 | Implemented |
| REQ-AUTH-004 | Security Policy | Medium | IAM Role Config | TC-AUTH-004-01 | Implemented |
| REQ-SEC-001 | Security Policy | High | Manual/Script | TC-SEC-001-01 | Planned |
| REQ-SEC-002 | Architecture | High | npm-publish.yml | TC-SEC-002-01 | Implemented |
| REQ-SEC-003 | Security Policy | High | npm-publish.yml | TC-SEC-003-01 | Implemented |
| REQ-SEC-004 | Security Policy | High | IAM Policy | TC-SEC-004-01 | Implemented |
| REQ-SETUP-001 | User Experience | Medium | setup-github-actions-aws.py | TC-SETUP-001-01 | Implemented |
| REQ-SETUP-002 | Architecture | High | setup-github-actions-aws.py | TC-SETUP-002-01 | Implemented |
| REQ-SETUP-003 | Architecture | High | setup-github-actions-aws.py | TC-SETUP-003-01 | Implemented |
| REQ-SETUP-004 | User Experience | High | setup-github-actions-aws.py | TC-SETUP-004-01 | Implemented |
| REQ-SETUP-005 | User Experience | Medium | Documentation | TC-SETUP-005-01 | Implemented |
| REQ-ERR-001 | User Experience | High | setup-github-actions-aws.py | TC-ERR-001-01 | Implemented |
| REQ-ERR-002 | User Experience | High | setup-github-actions-aws.py | TC-ERR-002-01 | Implemented |
| REQ-ERR-003 | User Experience | High | workflow.yml | TC-ERR-003-01 | Planned |
| REQ-PERF-001 | Performance | Low | setup-github-actions-aws.py | TC-PERF-001-01 | Not Started |
| REQ-PERF-002 | Performance | Medium | npm-publish.yml | TC-PERF-002-01 | Not Started |
| REQ-NSEC-001 | Security Policy | High | SSM Config | TC-NSEC-001-01 | Implemented |
| REQ-NSEC-002 | Compliance | Medium | AWS Config | TC-NSEC-002-01 | Automatic |
| REQ-NSEC-003 | Security Policy | High | IAM Policy | TC-NSEC-003-01 | Implemented |
| REQ-MAIN-001 | Operations | Medium | Architecture | TC-MAIN-001-01 | Implemented |
| REQ-MAIN-002 | Scalability | Low | Architecture | TC-MAIN-002-01 | Implemented |

## Test Scenarios

### Authentication Tests
- **TC-AUTH-001-01**: Verify OIDC provider creation
- **TC-AUTH-002-01**: Verify trust policy restrictions
- **TC-AUTH-003-01**: Test OIDC token exchange
- **TC-AUTH-004-01**: Verify session duration limits

### Secret Management Tests
- **TC-SEC-001-01**: Test NPM token storage in SSM
- **TC-SEC-002-01**: Test token retrieval and decryption
- **TC-SEC-003-01**: Verify token masking in logs
- **TC-SEC-004-01**: Test parameter access restrictions

### Setup Tests
- **TC-SETUP-001-01**: Test repository auto-detection
- **TC-SETUP-002-01**: Test idempotent OIDC creation
- **TC-SETUP-003-01**: Verify IAM role creation
- **TC-SETUP-004-01**: Test GitHub CLI output generation
- **TC-SETUP-005-01**: Test automated secret configuration


### Error Handling Tests
- **TC-ERR-001-01**: Test git remote detection failure
- **TC-ERR-002-01**: Test AWS auth failure handling
- **TC-ERR-003-01**: Test missing SSM parameter error

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2024-12-19 | DevOps Team | Initial specification |

## Appendix A: Implementation Files

### Core Implementation
- `scripts/setup-github-actions-aws.py` - Setup script for OIDC and IAM
- GitHub Actions workflow (implementation varies)

### Configuration Files
- IAM Trust Policy (generated)
- IAM Permission Policy (generated)
- SSM Parameter configuration

## Appendix B: Security Considerations

### Token Lifecycle
1. NPM token generated in npm registry
2. Token stored in SSM Parameter Store (encrypted)
3. Token retrieved by GitHub Actions (via OIDC)
4. Token made available to workflow
5. Token never persisted in GitHub
6. Token rotated periodically

### Attack Surface Analysis
- **GitHub Compromise**: Limited to specific repository
- **AWS Compromise**: Requires role assumption
- **Token Exposure**: Encrypted at rest, masked in logs
- **Network**: TLS for all communications
- **Audit**: Full CloudTrail logging

---

*This specification defines the complete requirements for implementing secure NPM token storage and access using AWS SSM and GitHub Actions OIDC authentication, following the EARS format for clarity and testability.*