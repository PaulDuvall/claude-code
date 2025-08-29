# OIDC TDD Implementation Plan

## Overview

This document outlines a Test-Driven Development (TDD) approach for implementing the claude-dev-toolkit OIDC command as specified in `specs/claude-dev-toolkit-oidc-requirements.md`. The plan follows a bottom-up approach, building foundational infrastructure first, then layering on features using the Red-Green-Refactor cycle.

## Implementation Philosophy

- **One requirement at a time**: Implement and fully test each requirement before moving to the next
- **Red-Green-Refactor**: Write failing tests first, implement minimal code to pass, then refactor
- **Integration checkpoints**: Test actual command functionality after each phase
- **Dependency-driven ordering**: Build prerequisites before dependent features

## Recommended Implementation Order

### Phase 1: Foundation Infrastructure
**Goal**: Establish basic command structure and error handling

1. **REQ-CLI-001**: Toolkit Command Structure
   - Register command in command-selector.js
   - Extend base-command.js pattern
   - Implement help text system

2. **REQ-DEP-001**: Tool Availability Checks
   - Validate AWS CLI installation and version
   - Validate GitHub CLI installation and auth
   - Check Git repository with GitHub remote
   - Verify Node.js compatibility

3. **REQ-ERR-001**: Toolkit Error Framework Integration
   - Use lib/error-handler-utils.js
   - Implement structured error objects
   - Add contextual error messages
   - Include recovery suggestions

4. **REQ-CLI-002**: Argument Processing (Basic)
   - Implement core argument parsing
   - Add validation through validation-utils.js
   - Support essential flags: --help, --dry-run, --verbose

**Phase 1 Rationale**: Without these foundations, you cannot test any OIDC functionality. Command structure enables testing, dependency validation prevents runtime failures, error handling provides debugging capability.

### Phase 2: Core Detection System
**Goal**: Enable auto-detection of project context

5. **REQ-DETECT-001**: Git Repository Detection
   - Auto-detect GitHub org/repo from git remote
   - Support SSH and HTTPS git remotes
   - Handle multiple remotes (prefer 'origin')
   - Clear errors for missing Git/GitHub setup

6. **REQ-DETECT-002**: AWS Configuration Detection
   - Read from AWS CLI config files
   - Check AWS_DEFAULT_REGION environment variable
   - Default to us-east-1 when no config found
   - Validate region exists

7. **REQ-CLI-003**: Zero Configuration Mode
   - Combine git detection + AWS detection
   - Use standard policy template by default
   - Auto-generate role names
   - Enable `claude-dev-toolkit oidc` with no args

**Phase 2 Rationale**: Auto-detection enables the zero-config experience that makes the tool user-friendly. All subsequent features depend on being able to detect the project context.

### Phase 3: Basic OIDC Implementation
**Goal**: Core OIDC provider and IAM role creation

8. **REQ-POLICY-001**: Built-in Policy Templates
   - Embed minimal, standard, and full templates
   - Add JSON validation for all templates
   - Implement template selection logic

9. **REQ-CMD-001**: OIDC Command Execution (Basic Flow)
   - Create GitHub OIDC provider in AWS
   - Generate IAM role with trust policy
   - Attach permission policies
   - Basic success/failure handling

10. **REQ-OUT-003**: Dry-run Mode Output
    - Display all operations without executing
    - Show AWS CLI commands that would run
    - Display generated IAM policies
    - Provide operation summary

**Phase 3 Rationale**: Now you have a working OIDC setup with safety (dry-run) testing. This core functionality can be thoroughly tested before adding complexity.

### Phase 4: Advanced Policy Management
**Goal**: Flexible policy customization

11. **REQ-POLICY-002**: Policy File Support
    - Read custom IAM policy from JSON file
    - Validate JSON syntax and IAM structure
    - Handle file existence and readability
    - Provide clear error messages

12. **REQ-POLICY-005**: Policy Directory Support
    - Load multiple JSON files from directory
    - Merge policies into comprehensive policy
    - Exclude example files (-example.json)
    - Validate each file independently

13. **REQ-POLICY-006**: Trust Policy Scoping
    - Support --branch and --tag flags
    - Generate StringEquals conditions
    - Validate branch/tag name formats
    - Default to repository-wide access

**Phase 4 Rationale**: Build advanced policy features on top of working basic system. Each feature is independent and can be tested separately.

### Phase 5: GitHub Integration
**Goal**: Complete the GitHub-AWS connection

14. **REQ-CMD-002**: Repository Variable Configuration
    - Set AWS_DEPLOYMENT_ROLE and AWS_REGION variables
    - Use `gh variable set` command
    - Handle GitHub API failures gracefully

15. **REQ-DETECT-003**: Existing Resource Detection
    - Check for existing GitHub OIDC provider
    - Detect existing IAM roles with same name
    - Update rather than recreate resources
    - Report existing resource status

16. **REQ-ERR-002**: Partial Failure Recovery
    - Handle AWS success + GitHub failure scenarios
    - Display role ARN for manual setup
    - Provide exact `gh` CLI commands
    - Offer retry options

**Phase 5 Rationale**: GitHub integration completes the OIDC setup. Error recovery is critical here since this involves multiple external services.

### Phase 6: Advanced Features
**Goal**: Additional functionality and deployment options

17. **REQ-POLICY-003**: Policy URL Support
    - Fetch IAM policies from HTTPS URLs
    - Validate certificates and response size
    - JSON validation of fetched content
    - Security-focused URL handling

18. **REQ-POLICY-004**: Service Addition
    - Add AWS service permissions dynamically
    - Support common services (s3, lambda, rds)
    - Merge with base template
    - Handle repeated --add-service flags

19. **REQ-DEPLOY-001**: CloudFormation Deployment Option
    - Generate CloudFormation templates
    - Support stack lifecycle management
    - Use consistent naming conventions
    - Handle stack dependencies

### Phase 7: Production Polish
**Goal**: Security, user experience, and operational features

20. **REQ-HOOK-001**: Pre-execution Security Validation
    - Trigger hooks/pre-write-security.sh
    - Validate overly permissive policies
    - Check GitHub token scopes
    - Abort on security failures

21. **REQ-OUT-001**: Progress Indication
    - Display emoji progress indicators
    - Support quiet and verbose modes
    - Show progress for long operations

22. **REQ-OUT-002**: Comprehensive Success Report
    - Display complete configuration summary
    - Provide copy-pasteable values
    - Include example GitHub Actions workflow
    - Link to documentation

23. **REQ-DEPLOY-002**: Rollback Capability
    - Track created resources via tags
    - Remove IAM roles, policies, OIDC providers
    - Remove GitHub repository variables
    - Graceful partial rollback handling

**Phase 7 Rationale**: These features enhance security, usability, and maintainability but aren't required for basic functionality.

## TDD Red-Green-Refactor Workflow

For each requirement, follow this strict cycle:

### Red Phase: Write Failing Test
```bash
# Example for REQ-CLI-001
describe('REQ-CLI-001: Toolkit Command Structure', () => {
  it('should register oidc command in command selector', () => {
    // This test should FAIL initially
    expect(commandSelector.hasCommand('oidc')).toBe(true);
  });
});

# Run test - should fail
npm test -- --grep "REQ-CLI-001"
```

### Green Phase: Minimal Implementation
```bash
# Write just enough code to make test pass
# Focus on making it work, not making it perfect

# Run test - should pass
npm test -- --grep "REQ-CLI-001"
```

### Refactor Phase: Clean Up
```bash
# Improve code quality without changing functionality
# Extract methods, improve naming, add comments

# Run ALL tests - should still pass
npm test
```

### Integration Check
```bash
# Test actual command functionality
claude-dev-toolkit oidc --help
claude-dev-toolkit oidc --dry-run
```

## Testing Strategy by Phase

### Phase 1 Testing
- **Mock Dependencies**: Mock toolkit framework, AWS CLI, GitHub CLI
- **Error Scenarios**: Test missing tools, invalid configurations
- **Integration**: Verify command registration and help text

### Phase 2 Testing  
- **Mock External Commands**: Mock `git remote`, AWS config file reads
- **Edge Cases**: Various git remote formats, missing AWS config
- **Auto-detection Logic**: Test different repository and AWS setups

### Phase 3 Testing
- **Mock AWS API Calls**: Mock IAM operations, OIDC provider creation
- **Policy Generation**: Test template selection and policy creation
- **Dry-run Validation**: Verify output accuracy without side effects

### Phase 4 Testing
- **File System Mocking**: Mock policy file reads, directory traversal
- **Validation Logic**: Test JSON parsing, IAM policy structure validation
- **Policy Merging**: Test combining multiple policies correctly

### Phase 5 Testing
- **GitHub API Mocking**: Mock `gh` CLI commands and responses
- **Failure Scenarios**: Test partial failures and recovery instructions
- **State Management**: Test detection and update of existing resources

### Phase 6 Testing
- **Network Mocking**: Mock HTTPS policy fetching
- **CloudFormation**: Mock stack operations and template generation
- **Service Integration**: Test dynamic permission addition

### Phase 7 Testing
- **Security Hooks**: Test hook integration and failure handling
- **User Experience**: Test progress indicators and output formatting
- **Rollback Operations**: Test resource cleanup and state tracking

## Implementation Dependencies

### Prerequisites for Each Phase:
- **Phase 2**: Requires Phase 1 (command structure for testing)
- **Phase 3**: Requires Phase 1 & 2 (error handling + auto-detection)
- **Phase 4**: Requires Phase 3 (basic policy system)
- **Phase 5**: Requires Phase 3 (working AWS OIDC setup)
- **Phase 6**: Requires Phase 4 (advanced policy features)
- **Phase 7**: Requires Phase 5 (complete core functionality)

### Critical Path:
CLI Structure → Detection → Basic OIDC → GitHub Integration → Advanced Features → Production Polish

## Key Implementation Questions

Before starting implementation, clarify:

1. **Testing Framework**: What testing framework does the toolkit use?
2. **Mocking Strategy**: How are external CLI tools currently mocked?
3. **Existing Patterns**: Which toolkit commands should be referenced for patterns?
4. **Error Standards**: What's the expected error object structure?
5. **CI Integration**: How should tests integrate with existing CI pipeline?

## Success Criteria

After each phase, these should work:
- **Phase 1**: `claude-dev-toolkit oidc --help`
- **Phase 2**: `claude-dev-toolkit oidc --dry-run` (with auto-detection)
- **Phase 3**: Full dry-run with policy generation
- **Phase 4**: Custom policy support in dry-run mode
- **Phase 5**: Complete OIDC setup (real execution)
- **Phase 6**: Advanced features functional
- **Phase 7**: Production-ready with all polish features

## Implementation Notes

- **Test Coverage**: Aim for 100% test coverage on each requirement before proceeding
- **Documentation**: Update command documentation as features are implemented  
- **Integration Testing**: After each phase, test with real repositories and AWS accounts
- **Performance**: Monitor command performance and optimize as needed
- **Security Review**: Conduct security review after Phase 5 and Phase 7

This plan ensures systematic, test-driven development that builds confidence at each step while maintaining the ability to debug and iterate quickly.