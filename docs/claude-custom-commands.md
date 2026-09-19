# Claude Custom Commands Reference

> **Source of truth for command descriptions:** `slash-commands/active/*.md` and
> `slash-commands/experiments/*.md`. The Command Index below is generated from
> their frontmatter; this document adds extended usage and workflow guidance.
>
> **Scope:** the 45 commands in this repository (17 active, 28 experimental).
> Earlier versions of this guide documented a 62-command set. The 23 commands
> that were dropped in the npm consolidation -- among them `/xred`, `/xgreen`,
> `/xcommit`, `/xgenerate`, `/xsetup`, `/xanalyze`, `/xvalidate`,
> `/xmonitoring`, `/xobservable` and `/xsandbox` -- are gone from this project
> and from this document. Where one of them named a workflow step, the step now
> uses the command that does the job here (`/xtdd` covers Red and Green;
> `/xgit` covers commit).

This document describes custom Claude commands for development projects
implementing SpecDriven AI methodology, with machine-readable specifications,
authority levels, dual coverage tracking, and TDD workflows.

## Core Concepts

### Command Structure
- **Project-scoped**: `.claude/commands/` (available to all team members)
  - Access with: `/project:command_name` or `/x<command>`
  - Subdirectories create namespaces: `/project:category:command`
- **User-scoped**: `~/.claude/commands/` (available across all projects)
  - Access with: `/user:command_name`

### Command Categories

**Core Development Workflow**
- [Specification Management](#specification-management)
- [TDD Cycle Management](#tdd-cycle-management)
- [Testing & Quality](#testing--quality)
- [Commit & Version Control](#commit--version-control)

**Advanced Development**
- [AWS/IAM Development](#awsiam-development)
- [Architecture & Design](#architecture--design)
- [Performance & Optimization](#performance--optimization)
- [Security & Compliance](#security--compliance)
- [CI/CD Pipeline Management](#cicd-pipeline-management)

**Product & Release Management**
- [Product Management](#product-management)
- [Release Management](#release-management)
- [Database Management](#database-management)
- [API Management](#api-management)
- [Analytics & Business Intelligence](#analytics--business-intelligence)

**AI-Assisted Development**
- [AI Readiness & Maturity](#ai-readiness--maturity)
- [Task Planning & Decomposition](#task-planning--decomposition)
- [Observable Development](#observable-development)
- [AI-Assisted Generation](#ai-assisted-generation)

**Operations & Management**
- [Incident Management](#incident-management)
- [Infrastructure Management](#infrastructure-management)
- [User Experience](#user-experience)
- [Project Management](#project-management)
- [Knowledge Management](#knowledge-management)
- [Environment & Configuration](#environment--configuration)
- [Documentation & Reporting](#documentation--reporting)
- [Debugging & Analysis](#debugging--analysis)
- [Governance & Rules](#governance--rules)
- [Evaluation & Assessment](#evaluation--assessment)
- [Development Metrics](#development-metrics)
- [Traceability Analysis](#traceability-analysis)
- [Workflow Management](#workflow-management)

## Quick Reference

### Most Common Commands
| Task | Command | Example |
|------|---------|---------|
| Explore before changing | `/xexplore <topic>` | `/xexplore auth flow` |
| Write a specification | `/xspec --feature <name>` | `/xspec --feature user-auth` |
| Run a full TDD cycle | `/xtdd --component <name>` | `/xtdd --component AuthService` |
| Run tests | `/xtest` | `/xtest --coverage` |
| Check quality | `/xquality` | `/xquality --fix` |
| Scan for vulnerabilities | `/xsecurity` | `/xsecurity --report` |
| Verify claims and references | `/xverify` | `/xverify` |
| Stage, commit, and push | `/xgit` | `/xgit` |
| Find the right command | `/xhelp <task>` | `/xhelp deploy to staging` |

### Essential Development Workflow
```bash
/xexplore <topic>            # 1. Understand the code before changing it
/xspec --feature <name>      # 2. Capture the requirement
/xtdd --component <name>     # 3. Red -> Green -> Refactor
/xquality                    # 4. Lint, types, formatting
/xsecurity                   # 5. Vulnerability and secret scan
/xgit                        # 6. Commit with a generated message
```

`/xtdd` runs the full Red-Green-Refactor-Commit cycle. This repository has no
separate `/xred` or `/xgreen` command; the phases live inside `/xtdd`.


## Command Index

All 45 commands in this repository, generated from the `description` field of
each command's frontmatter. `active` commands are production-ready and install
by default; `experimental` commands install with `--experiments` or `--all`.

Commands whose "Details" column reads *source* work, but have no extended
usage section in this guide yet -- their own file is the reference.

| Command | Description | Status | Details |
|---------|-------------|--------|---------|
| `/xact` | Local GitHub Actions testing with nektos/act for rapid development feedback | experimental | [source](../slash-commands/experiments/xact.md) |
| `/xapi` | Design, implement, test, and document APIs with comprehensive automation and best practices | experimental | [Advanced Development](#advanced-development) |
| `/xarchitecture` | Design, analyze, and evolve system architecture using Domain-Driven Design, 12-Factor App, and proven patterns | active | [Advanced Development](#advanced-development) |
| `/xatomic` | Break complex tasks into 4-8 hour atomic units for efficient development workflow | experimental | [AI-Assisted Development](#ai-assisted-development) |
| `/xaws` | AWS integration for credentials, services, and IAM testing with moto mocking | experimental | [Advanced Development](#advanced-development) |
| `/xbaseline` | Establish and track quality, performance, and security baselines with regression detection | experimental | [source](../slash-commands/experiments/xbaseline.md) |
| `/xchoice` | Generate multiple implementation options with trade-off analysis for informed decision-making | experimental | [source](../slash-commands/experiments/xchoice.md) |
| `/xcompliance` | Check project compliance with standards and generate audit documentation | experimental | [Advanced Development](#advanced-development) |
| `/xconfig` | Manage project configuration files, environment variables, and application settings | active | [Project Management](#project-management) |
| `/xcontinue` | Continue an execution plan from where it left off across sessions | active | [source](../slash-commands/active/xcontinue.md) |
| `/xcoverage` | Comprehensive dual coverage analysis for code and specifications | experimental | [Core Development Workflow](#core-development-workflow) |
| `/xdb` | Comprehensive database management, migrations, and performance operations | experimental | [Advanced Development](#advanced-development) |
| `/xdebug` | Interactive debugging support with error analysis and fix suggestions - integrates with Debug Specialist sub-agent for complex issues | active | [Project Management](#project-management) |
| `/xdevcontainer` | Set up Anthropic's official devcontainer for running Claude Code with --dangerously-skip-permissions safely | experimental | [source](../slash-commands/experiments/xdevcontainer.md) |
| `/xdocs` | Generate and maintain comprehensive documentation from code | active | [Project Management](#project-management) |
| `/xexplore` | Explore a codebase topic before making changes (read-only) | active | [source](../slash-commands/active/xexplore.md) |
| `/xgit` | Automate git workflow - stage, commit with smart messages, and push to specified branch | active | [Core Development Workflow](#core-development-workflow) |
| `/xgovernance` | Comprehensive development governance framework for policies, audits, and compliance | experimental | [Project Management](#project-management) |
| `/xhelp` | Command navigator that recommends the right slash commands for your task | active | [source](../slash-commands/active/xhelp.md) |
| `/xiac` | Comprehensive Infrastructure as Code management with focus on AWS IAM, Terraform, CloudFormation, and infrastructure validation | experimental | [Advanced Development](#advanced-development) |
| `/ximagespec` | Generate specifications and code from visual artifacts — diagrams, mockups, and screenshots | experimental | [source](../slash-commands/experiments/ximagespec.md) |
| `/xincident` | Incident response automation, post-mortem analysis, and system reliability improvement through SpecDriven AI methodology | experimental | [Advanced Development](#advanced-development) |
| `/xinfra` | Manage infrastructure operations, container orchestration, cloud resources, and deployment automation | experimental | [Advanced Development](#advanced-development) |
| `/xknowledge` | Manage organizational knowledge, facilitate team onboarding, and create training materials with SpecDriven AI methodology | experimental | [Advanced Development](#advanced-development) |
| `/xmaturity` | Assess and improve team's development maturity with actionable insights | experimental | [AI-Assisted Development](#ai-assisted-development) |
| `/xmetrics` | Advanced metrics collection and analysis for development process optimization and SpecDriven AI insights | experimental | [Operations & Management (Extended)](#operations--management-extended) |
| `/xmultirepo` | Coordinate changes across multiple repositories with parallel agent orchestration | experimental | [source](../slash-commands/experiments/xmultirepo.md) |
| `/xnew` | Initialize a new project with comprehensive CLAUDE.md and specification framework | experimental | [source](../slash-commands/experiments/xnew.md) |
| `/xoidc` | Automate AWS OIDC role creation for GitHub Actions with local policy discovery | experimental | [source](../slash-commands/experiments/xoidc.md) |
| `/xpipeline` | Advanced CI/CD pipeline configuration, build automation, deployment orchestration, and optimization | active | [Advanced Development](#advanced-development) |
| `/xplanning` | AI-assisted project planning with roadmaps, estimation, and risk analysis | experimental | [AI-Assisted Development](#ai-assisted-development) |
| `/xpolicy` | Generate, validate, and test IAM policies with automated policy creation and best practices enforcement | experimental | [Advanced Development](#advanced-development) |
| `/xproduct` | Product management and strategic planning tools for feature development and product lifecycle management | experimental | [Advanced Development](#advanced-development) |
| `/xquality` | Run code quality checks with maturity-aware thresholds and centralized-rules integration | active | [Core Development Workflow](#core-development-workflow) |
| `/xrefactor` | Interactive refactoring assistant based on Martin Fowler's catalog and project-specific rules for code smell detection | active | [Advanced Development](#advanced-development) |
| `/xrelease` | Comprehensive release management with planning, coordination, deployment automation, and monitoring | active | [Advanced Development](#advanced-development) |
| `/xrisk` | Comprehensive risk assessment and mitigation across technical, security, and operational domains | experimental | [Project Management](#project-management) |
| `/xsecurity` | Run security scans via AWS Automated Security Helper (ASH) with maturity-aware thresholds and centralized-rules integration | active | [Advanced Development](#advanced-development) |
| `/xspec` | Machine-readable specifications with unique identifiers and authority levels for precise AI code generation | active | [Core Development Workflow](#core-development-workflow) |
| `/xstakeholder-updates` | Generate stakeholder update emails from recently completed tasks in any supported issue tracker | experimental | [source](../slash-commands/experiments/xstakeholder-updates.md) |
| `/xtdd` | Complete Test-Driven Development workflow automation with Red-Green-Refactor-Commit cycle | active | [Core Development Workflow](#core-development-workflow) |
| `/xtest` | Run tests with smart defaults, maturity-aware thresholds, and centralized-rules integration | active | [Core Development Workflow](#core-development-workflow) |
| `/xtrace` | Comprehensive traceability tracking and analysis for SpecDriven AI development with end-to-end requirement tracking | experimental | [Operations & Management (Extended)](#operations--management-extended) |
| `/xux` | User experience optimization, frontend testing, and accessibility compliance with SpecDriven AI methodology integration | experimental | [Advanced Development](#advanced-development) |
| `/xverify` | Verify references before taking action — catch fabricated URLs, placeholder IDs, and unverified claims | active | [source](../slash-commands/active/xverify.md) |

---

## Core Development Workflow

### Specification Management

#### `/xspec` - SpecDriven AI Development
Machine-readable specifications with unique identifiers and authority levels for precise AI code generation.

```bash
# Core SpecDriven AI Operations
/xspec --read <spec-id>      # Read specification by ID (e.g., cli1a)
/xspec --find <keyword>      # Find specifications containing keyword
/xspec --trace <spec-id>     # Show traceability to tests/code
/xspec --validate            # Validate specification compliance and format
/xspec --new <component>     # Create new specification with proper ID format
/xspec --authority <level>   # Filter by authority level (system, platform, developer)
/xspec --coverage            # Show specification coverage metrics

# AI Generation Workflow
/xspec --generate-test <id>  # Generate tests from specification
/xspec --ai-implement <id>   # Generate AI implementation from specification  
/xspec --execute <spec-id>   # Execute tests for specification
/xspec --commit <spec-id>    # Commit with spec traceability

# Quality & Validation
/xspec --machine-readable    # Validate machine-readable format compliance
/xspec --dual-coverage       # Check both code and specification coverage
/xspec --gaps                # Identify specifications without tests
```

**SpecDriven AI Format:**
- **Specifications**: `{#identifier authority=level}` for AI code generation
- **Authority levels**: `system` > `platform` > `developer`
- **Traceability**: Every test links to specific specification ID
- **Dual Coverage**: Both code coverage and specification coverage tracked

### TDD Cycle Management

#### `/xtdd` - Run Complete TDD Workflow
Automate the full Red-Green-Refactor-Commit cycle for any feature.

```bash
/xtdd --red <spec-id>        # Start: write failing test
/xtdd --green                # Implement minimal passing code
/xtdd --refactor             # Improve code, keep tests green
/xtdd --commit <spec-id>     # Commit with spec reference
```

### Testing & Quality

#### `/xtest` - Test Execution
```bash
/xtest --spec                # Run specification tests
/xtest --unit                # Run unit tests
/xtest --integration         # Run integration tests with mocks
/xtest --coverage            # Run with coverage report
/xtest --component <name>    # Run component-specific tests
```

#### `/xquality` - Code Quality Checks
```bash
/xquality --mypy             # Type checking
/xquality --ruff             # Linting
/xquality --format           # Auto-format code
/xquality --all              # Run all quality checks
```

#### `/xcoverage` - Dual Coverage Analysis (SpecDriven AI)
```bash
/xcoverage --html            # Generate HTML report for code coverage
/xcoverage --missing         # Show uncovered lines
/xcoverage --spec <spec-id>  # Check coverage for specific requirement
/xcoverage --dual            # Show both code and specification coverage
/xcoverage --authority <level> # Coverage by authority level (system/platform/developer)
/xcoverage --gaps            # Identify specifications without tests
/xcoverage --metrics         # Comprehensive coverage metrics dashboard
```

**Dual Coverage Metrics:**
- **Code Coverage**: Percentage of code lines executed by tests
- **Specification Coverage**: Percentage of specifications with corresponding tests
- **Authority Coverage**: Coverage breakdown by authority level
- **Traceability Coverage**: Percentage of tests linked to specifications

### Commit & Version Control

#### `/xgit` - Git Workflow Automation
Automates the complete git workflow: stages all changes, generates smart commit messages, commits, and pushes.

```bash
/xgit                        # Stage all, commit with smart message, push
```

**Features:**
- **Smart commit type detection**: Analyzes file patterns to determine commit type (feat, fix, docs, etc.)
- **Conventional Commits format**: Generates proper commit messages with type and description
- **Automatic push**: Pushes to remote with upstream tracking
- **Error handling**: Clear feedback and troubleshooting information

**Enhanced SpecDriven AI Format:**
```
feat: implement [requirement] via TDD (^cli1a)

- Add failing test for [specific behavior]
- Implement minimal code to pass test
- Authority: developer
- Specification Coverage: 95%
- Code Coverage: 87%

Implements: specs/specifications/cli-interface.md#{#cli1a authority=developer}
```

---

## Advanced Development

### AWS/IAM Development

#### `/xiac` - Infrastructure as Code Operations
```bash
/xiac --scan <path>          # Scan for IAM roles
/xiac --terraform            # Work with Terraform files
/xiac --cloudformation       # Work with CloudFormation
/xiac --validate             # Validate IAM definitions
```

#### `/xpolicy` - Policy Generation
```bash
/xpolicy --generate <role>   # Generate IAM policy
/xpolicy --test <policy>     # Test policy generation
/xpolicy --validate <policy> # Validate policy syntax
/xpolicy --template          # Work with templates
```

#### `/xaws` - AWS Integration
```bash
/xaws --mock                 # Set up moto mocking
/xaws --credentials          # Check credential config
/xaws --regions              # Work with regions
/xaws --test-iam             # Test IAM interactions
```

### Architecture & Design

#### `/xarchitecture` - Architecture Analysis
```bash
/xarchitecture --analyze     # Analyze current architecture
/xarchitecture --design <component> # Design new component
/xarchitecture --patterns    # Suggest patterns
/xarchitecture --validate    # Check compliance
/xarchitecture --evolve      # Guide evolution
```

#### `/xrefactor` - Code Refactoring Guidance
```bash
/xrefactor --analyze <file>   # Detect code smells and anti-patterns
/xrefactor --suggest <smell>  # Get refactoring suggestions for specific smell
/xrefactor --apply <technique> # Apply specific refactoring technique
/xrefactor --validate <file>  # Validate refactoring maintains behavior
/xrefactor --metrics <component> # Check complexity and quality metrics
```

### Performance & Optimization

### Security & Compliance

#### `/xsecurity` - Security Analysis
```bash
/xsecurity --scan            # Run vulnerability scan
/xsecurity --secrets         # Check for exposed secrets
/xsecurity --dependencies    # Analyze dependencies
/xsecurity --policies        # Validate policies
/xsecurity --report          # Generate report
```

#### `/xcompliance` - Compliance Management
```bash
/xcompliance --standards <type> # Check standards
/xcompliance --regulations   # Validate regulations
/xcompliance --audit-trail   # Generate audit trail
/xcompliance --gap-analysis  # Find compliance gaps
```

### Product Management

#### `/xproduct` - Product Management & Strategy
```bash
/xproduct --backlog           # Manage product backlog with priorities
/xproduct --stories           # Create and manage user stories
/xproduct --features          # Feature flag management
/xproduct --feedback          # Integrate user feedback
/xproduct --metrics           # Track product KPIs
/xproduct --roadmap           # Product roadmap planning
```

### Release Management

#### `/xrelease` - Release Management & Coordination
```bash
/xrelease --plan <version>    # Plan release with dependencies
/xrelease --notes <version>   # Generate release notes from commits
/xrelease --rollback <version> # Automated rollback procedures
/xrelease --hotfix <issue>    # Emergency hotfix workflow
/xrelease --approve <version> # Release approval workflow
/xrelease --monitor <release> # Post-release monitoring
```

### Database Management

#### `/xdb` - Database Management & Operations
```bash
/xdb --schema <design>        # Database schema management
/xdb --migrate <version>      # Database migration handling
/xdb --seed <environment>     # Data seeding and fixtures
/xdb --performance           # Database performance tuning
/xdb --backup <database>     # Backup and restore procedures
/xdb --test <schema>         # Database testing automation
```

### API Management

#### `/xapi` - API Design & Management
```bash
/xapi --design <spec>         # API design and specification
/xapi --version <api>         # API versioning management
/xapi --mock <endpoint>       # API mocking and testing
/xapi --docs <api>           # API documentation generation
/xapi --analytics <api>      # API usage analytics
/xapi --security <endpoint>  # API security testing
```

### Analytics & Business Intelligence

### CI/CD Pipeline Management

#### `/xpipeline` - CI/CD Pipeline Management
```bash
/xpipeline --init <platform>  # Initialize pipeline (github, gitlab, generic)
/xpipeline --validate         # Validate pipeline best practices
/xpipeline --optimize         # Optimize pipeline performance
/xpipeline --security         # Security scan pipeline
/xpipeline --deploy <env>     # Deploy to environment
/xpipeline --monitor          # DORA metrics and pipeline health
/xpipeline --rollback <env>   # Rollback deployment
/xpipeline --stage <name>     # Add pipeline stage
/xpipeline --artifact         # Configure artifact management
/xpipeline --deploy-stage     # Configure deployment stage
```

### Incident Management

#### `/xincident` - Incident Response & Management
```bash
/xincident --respond <alert>  # Incident response automation
/xincident --postmortem <id>  # Post-mortem analysis
/xincident --communicate <team> # Incident communication
/xincident --escalate <level> # Escalation procedures
/xincident --recover <system> # Recovery automation
/xincident --lessons <incident> # Lessons learned capture
```

### Infrastructure Management

#### `/xinfra` - Infrastructure & Operations
```bash
/xinfra --containers          # Container orchestration
/xinfra --networking          # Network configuration
/xinfra --scaling             # Auto-scaling management
/xinfra --cost                # Cost optimization
/xinfra --disaster-recovery   # Disaster recovery procedures
/xinfra --capacity            # Capacity planning
```

### User Experience

#### `/xux` - User Experience & Frontend
```bash
/xux --test <journey>         # User journey testing
/xux --accessibility          # Accessibility compliance
/xux --performance            # Frontend performance
/xux --regression             # Visual regression testing
/xux --analytics              # User behavior tracking
/xux --optimization           # UX optimization suggestions
```

### Project Management

### Knowledge Management

#### `/xknowledge` - Knowledge & Team Management
```bash
/xknowledge --capture <domain> # Knowledge capture
/xknowledge --onboard <role>   # Team onboarding
/xknowledge --training <skill> # Training material generation
/xknowledge --assess <competency> # Skills assessment
/xknowledge --documentation   # Best practices documentation
/xknowledge --transfer        # Knowledge transfer procedures
```

---

## AI-Assisted Development

### AI Readiness & Maturity

#### `/xmaturity` - Development Maturity
```bash
/xmaturity --level           # Check maturity level
/xmaturity --metrics         # View dashboard
/xmaturity --progress        # Track progress
/xmaturity --benchmark       # Compare standards
```

### Task Planning & Decomposition

#### `/xatomic` - Atomic Task Decomposition
Breaks complex tasks into 4-8 hour units.

```bash
/xatomic --decompose <task>  # Break down task
/xatomic --estimate          # Estimate time
/xatomic --dependencies      # Analyze dependencies
/xatomic --parallel          # Find parallel tasks
/xatomic --validate          # Check atomicity
```

#### `/xplanning` - AI-Assisted Planning
```bash
/xplanning --roadmap         # Generate roadmap
/xplanning --prioritize      # Prioritize tasks
/xplanning --estimate        # Effort estimation
/xplanning --resources       # Plan allocation
/xplanning --risks           # Identify risks
```

### Observable Development

### AI-Assisted Generation

## Project Management

### Environment & Configuration

#### `/xconfig` - Configuration Management
```bash
/xconfig --schema            # Work with Pydantic schemas
/xconfig --validate <file>   # Validate configuration
/xconfig --template          # Generate template
```

### Documentation & Reporting

#### `/xdocs` - Documentation Management
```bash
/xdocs --spec <component>    # Generate from specs
/xdocs --api                 # Generate API docs
/xdocs --coverage            # Generate coverage docs
```

### Debugging & Analysis

#### `/xdebug` - Debugging Assistance
```bash
/xdebug --trace <error>      # Trace to specification
/xdebug --logs               # Analyze logs
/xdebug --policy <role>      # Debug policy generation
```

### Governance & Rules

#### `/xgovernance` - Development Governance
```bash
/xgovernance --policy <type> # Manage policies
/xgovernance --audit         # Run audit
/xgovernance --compliance    # Check compliance
/xgovernance --controls      # Manage controls
```

#### `/xrisk` - Risk Assessment
```bash
/xrisk --assess              # Run assessment
/xrisk --identify            # Find risks
/xrisk --mitigate <risk>     # Get mitigations
/xrisk --monitor             # Monitor levels
/xrisk --report              # Generate report
```

---

## Operations & Management (Extended)

### Evaluation & Assessment

### Development Metrics

#### `/xmetrics` - Comprehensive Development Metrics
Advanced metrics collection and analysis for development process optimization and SpecDriven AI insights.

```bash
/xmetrics --dashboard        # View comprehensive metrics dashboard
/xmetrics --coverage         # Detailed coverage analysis
/xmetrics --velocity         # Team velocity and productivity metrics
/xmetrics --quality          # Code quality trend analysis
/xmetrics --spec <spec-id>   # Specification-specific metrics
```

**SpecDriven AI Metrics:**
- **Dual Coverage**: Code and specification coverage tracking
- **Authority Coverage**: Coverage by authority level (system/platform/developer)
- **Implementation Rate**: Specifications with complete implementations
- **Traceability Coverage**: Tests linked to specifications

### Traceability Analysis

#### `/xtrace` - SpecDriven AI Traceability Analysis
Comprehensive traceability tracking and analysis for SpecDriven AI development with end-to-end requirement tracking.

```bash
/xtrace --spec <spec-id>     # Trace specification to implementation
/xtrace --test <test-name>   # Trace test to specifications
/xtrace --code <file>        # Trace code to requirements
/xtrace --coverage           # Traceability coverage analysis
/xtrace --gaps               # Identify traceability gaps
```

**Traceability Features:**
- **Forward Tracing**: Specification → Tests → Code → Commits
- **Backward Tracing**: Code → Tests → Specifications → Requirements
- **Authority Tracking**: Authority level propagation through chain
- **Gap Identification**: Missing links in traceability chain

### Workflow Management

## Workflow Examples

### Complete Feature Development

**Prerequisites:** Repository checked out, tests runnable

#### Phase 1: Understand and plan
```bash
# Read the relevant code before changing it (read-only)
/xexplore authentication
# Expected: Map of the files, entry points, and tests that touch auth

# Break the work into 4-8 hour units
/xatomic --decompose "implement user authentication"
# Expected: Atomic tasks with acceptance criteria and dependencies

# Sequence them
/xplanning --roadmap
# Expected: Prioritized task list with effort estimates
```

#### Phase 2: Specify and build
```bash
# Capture the requirement as a machine-readable spec
/xspec --feature user-auth
# Expected: Spec file with an ID and authority level

# Run the Red-Green-Refactor-Commit cycle
/xtdd --component AuthService
# Expected: Failing test, minimal implementation, refactor, commit
```

#### Phase 3: Gate and commit
```bash
# Lint, types, formatting
/xquality --fix
# Expected: All quality checks pass

# Smell and duplication pass
/xrefactor --smell
# Expected: Candidates listed with Fowler refactorings named

# Vulnerability and secret scan
/xsecurity --report
# Expected: Findings by severity, or a clean report

# Catch fabricated references before they ship
/xverify
# Expected: No unverified URLs, IDs, or claims

# Stage, generate a message, push
/xgit
# Expected: Commit pushed to the current branch
```

**Success criteria:** tests pass, quality and security gates pass, feature
traceable to its specification.

### Security and Compliance Workflow

**Prerequisites:** Codebase ready for security assessment

#### Phase 1: Security Assessment
```bash
# Comprehensive security scan
/xsecurity --scan
# Expected: Vulnerability report with severity levels

# Check for exposed secrets
/xsecurity --secrets
# Expected: No secrets found, or flagged items for review

# Analyze dependencies for vulnerabilities
/xsecurity --dependencies
# Expected: Dependency security report
```

#### Phase 2: Compliance Validation
```bash
# Validate against security standards
/xcompliance --standards "security"
# Expected: Compliance checklist with pass/fail status

# Perform risk assessment
/xrisk --assess
# Expected: Risk register with mitigation recommendations

# Run governance audit
/xgovernance --audit
# Expected: Governance compliance report
```

#### Phase 3: Documentation and Reporting
```bash
# Generate comprehensive security report
/xsecurity --report
# Expected: Executive summary with actionable recommendations

# Create audit trail for compliance
/xcompliance --audit-trail
# Expected: Timestamped compliance evidence
```

**Troubleshooting:**
- If vulnerabilities found: Use `/xsecurity --mitigate <vulnerability>` for guidance
- If compliance gaps: Use `/xcompliance --gap-analysis` for detailed findings

### TDD Micro-Cycle (Recommended Daily Practice)

**Prerequisites:** Active feature branch, specification available

`/xtdd` drives the whole cycle. There is no separate `/xred` or `/xgreen`
command in this repository -- the phases are flags on `/xtdd`.

```bash
# 1. Read the requirement
/xspec --read cli1a
# Expected: Requirement with acceptance criteria

# 2. Red -- write the failing test
/xtdd --red ContactForm
# Expected: Test that fails for the right reason

# 3. Confirm the failure
/xtest
# Expected: One failing test, everything else green

# 4. Green -- minimal implementation
/xtdd --green
# Expected: Test passes with the simplest code that works

# 5. Refactor while staying green
/xquality --fix
/xrefactor --smell
# Expected: Clean code, tests still passing

# 6. Commit
/xgit
# Expected: Commit with a message generated from the diff
```

**Cycle time:** 15-30 minutes.

### Development Maturity Assessment

**Prerequisites:** Project structure established

```bash
# Where the team is today
/xmaturity --level
# Expected: Maturity level 1-5 with the criteria for the next one

# Detailed assessment with evidence
/xmaturity --assess
# Expected: Per-area findings (testing, CI/CD, quality tooling, docs)

# What to do about it
/xmaturity --roadmap
# Expected: Prioritized improvements toward the next level

# Track movement over time
/xmaturity --progress
# Expected: Progress against previously identified gaps
```

Narrow it to one area with `/xmaturity --testing` or `/xmaturity --ci-cd`.

**Success metric:** maturity level 3+, no critical gaps outstanding.

### SpecDriven AI Complete Workflow

**Prerequisites:** Feature requirements defined, test environment ready

#### Phase 1: SpecDriven AI Development
```bash
# Create machine-readable specification
/xspec --new user-authentication
# Expected: Specification file with proper ID format {#auth1a authority=developer}

# Generate tests from specification
/xspec --generate-test auth1a
# Expected: Test file created in specs/tests/ with proper traceability

# Execute failing tests to confirm gap
/xspec --execute auth1a
# Expected: Tests fail as expected, proving requirement gap
```

#### Phase 2: AI Implementation
```bash
# Generate AI implementation from specification
/xspec --ai-implement auth1a
# Expected: Implementation that satisfies specification requirements

# Validate implementation against specification
/xspec --validate auth1a
# Expected: All specification requirements met

# Check dual coverage
/xspec --dual-coverage
# Expected: Both code and specification coverage tracked
```

#### Phase 3: Commit with Traceability
```bash
# Commit with complete traceability
/xspec --commit auth1a
# Expected: Commit message includes specification reference and coverage metrics
```

**Success Criteria:** Tests pass, specification coverage 100%, traceability maintained

### CI/CD Pipeline Development Workflow

**Prerequisites:** Repository structure established, deployment targets defined

#### Phase 1: Pipeline Design
```bash
# Initialize pipeline for specific platform
/xpipeline --init github-actions
# Expected: Basic pipeline configuration files

# Create build and test stages
/xpipeline --stage build
/xpipeline --test-stage
# Expected: Configured stages with proper dependencies

# Configure artifact management
/xpipeline --artifact
# Expected: Artifact storage and versioning setup
```

#### Phase 2: Security and Compliance
```bash
# Scan pipeline for security issues
/xpipeline --security
# Expected: Security analysis of pipeline configuration

# Validate against CI/CD best practices
/xpipeline --validate
# Expected: Compliance check against documented standards

# Optimize pipeline performance
/xpipeline --optimize
# Expected: Performance improvements identified
```

#### Phase 3: Deployment and Monitoring
```bash
# Deploy to staging environment
/xpipeline --deploy staging
# Expected: Successful deployment with validation

# Generate deployment report
/xpipeline --monitor
# Expected: Deployment summary with success metrics
```

**Success Criteria:** Pipeline deploys successfully, security validated, performance optimized

## SpecDriven AI Best Practices

1. **Start with machine-readable specifications**: Always use `/xspec --read` with proper authority levels before development
2. **Follow TDD discipline**: Use `/xtdd` commands for all changes with specification traceability
3. **Maintain dual coverage**: Track both code coverage and specification coverage using `/xcoverage --dual`
4. **Validate continuously**: Run `/xquality --all` and `/xspec --validate` before committing
5. **Ensure traceability**: Every test must link to a specific specification ID with authority level
6. **Measure the process**: Use `/xmetrics` for development metrics and `/xtrace` for specification-to-test traceability
7. **Secure by default**: Run `/xsecurity --scan` regularly
8. **Plan strategically**: Use `/xplanning` for complex planning with specification references
9. **Authority-driven development**: Respect specification authority levels (system > platform > developer)
10. **Precise specifications lead to precise implementation**: Write detailed, testable specifications

## Troubleshooting

### Common Issues and Solutions

#### Command Not Found
**Symptom:** a `/x...` command is not recognized
**Solutions:**
1. Confirm the name appears in the Command Index above -- 23 commands documented
   in older versions of this guide (`/xred`, `/xgreen`, `/xcommit`, `/xgenerate`,
   `/xsetup`, `/xanalyze`, `/xvalidate`, `/xmonitoring` and others) were dropped
   from this project and no longer exist here.
2. Check that the commands are installed: `claude-commands list`
3. Install them: `claude-commands install --active` (or `--all` for experiments)
4. Experimental commands are not installed by default -- check the Status column

#### Specification Not Found
**Symptom:** `/xspec --read <id>` returns "specification not found"
**Solutions:**
1. Check that the `specs/` directory exists and contains the spec
2. Verify the footnote ID format matches `^[a-z]{3}[0-9][a-z]`
3. Use `/xtrace` to locate specifications and their linked tests
4. Confirm the file actually contains the footnote reference

#### Quality Checks Fail
**Symptom:** `/xquality` reports errors
**Common causes:**
- **Type errors**: check annotations and imports
- **Formatting**: `/xquality --fix` auto-fixes what it can
- **Missing tooling**: install the linters the project expects

**Resolution:**
```bash
/xquality                 # See everything
/xquality --fix           # Auto-fix what is mechanical
/xrefactor --smell        # Structural problems the linter will not catch
```

#### TDD Cycle Breaks
**Symptom:** tests pass unexpectedly, or fail for the wrong reason
**Diagnosis:**
1. Isolate with `/xtest` on the affected component
2. Check test isolation -- shared state between tests is the usual cause
3. For AWS code, verify mocks with `/xaws --mock`

**Recovery:**
```bash
/xdebug                   # Analyze the error and suggest fixes
/xtest --coverage         # Find what is not actually covered
/xtrace                   # Verify spec-to-test links
```

#### Security Scan Failures
**Symptom:** `/xsecurity` reports vulnerabilities
**Response protocol:**
1. **Critical**: stop, fix immediately
2. **High**: fix before the next commit
3. **Medium/Low**: schedule

**Remediation:**
```bash
/xsecurity --dependencies    # Dependency advisories
/xsecurity --report          # Full report by severity
/xrisk                       # Risk assessment and mitigation options
```

See [ASH tiered security integration](ash-integration.md) for how the scan
tiers fit together and what runs where.

#### Environment and Configuration Problems
**Symptom:** commands behave inconsistently across machines
**Solutions:**
1. Check the toolkit installation: `claude-commands verify`
2. Inspect configuration with `/xconfig`
3. Re-apply a settings template: `claude-commands config --template basic`
4. Reinstall the command set: `claude-commands install --active`

#### Claims That Do Not Check Out
**Symptom:** a command cites a URL, ID, or file that does not exist
**Solution:** run `/xverify` over the file or directory. It exists for exactly
this -- catching fabricated references before they reach a commit.

### Getting Help

1. **Which command do I want?** `/xhelp <what you are trying to do>`
2. **Command help**: most commands support `--help`
3. **Read before changing**: `/xexplore <topic>` is read-only and safe to run first
4. **Integration issues**: see Integration Points below

## Integration Points

- **Environment**: Commands integrate with `./setup.sh`
- **Testing**: Uses `pytest` configurations
- **Quality**: Integrates with `mypy` and `ruff`
- **Coverage**: Uses `pytest-cov` configuration
- **Specifications**: Reads from `specs/specifications/*.md`
- **Tests**: Executes from `specs/tests/`

## Command Naming Convention

All commands follow the `/x<category>` pattern for consistency:
- `/x` prefix indicates extended custom commands
- Category name follows immediately
- Options use `--` prefix
- Arguments follow options

This unified approach ensures commands are discoverable, consistent, and easy to remember.