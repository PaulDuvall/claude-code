# Claude Custom Commands Reference

This document describes custom Claude commands for development projects implementing SpecDriven AI methodology. All commands support machine-readable specifications with authority levels, dual coverage tracking, and Test-Driven Development workflows.

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

## Quick Reference

### Most Common Commands
| Task | Command | Example |
|------|---------|---------|
| Read specification | `/xspec --read <id>` | `/xspec --read cli1a` |
| Start TDD cycle | `/xtdd --red <spec-id>` | `/xtdd --red cli1a` |
| Write failing test | `/xred --spec <id>` | `/xred --spec cli1a` |
| Implement code | `/xgreen --minimal` | `/xgreen --minimal` |
| Run tests | `/xtest --spec` | `/xtest --spec` |
| Check quality | `/xquality --all` | `/xquality --all` |
| Commit with trace | `/xcommit --tdd <id>` | `/xcommit --tdd cli1a` |
| Auto add/commit/push | `/xacp` | `/xacp` |
| Setup environment | `/xsetup --env` | `/xsetup --env` |


### Essential TDD Workflow
```bash
/xspec --read <spec-id>    # 1. Read requirement
/xred --spec <spec-id>     # 2. Write failing test  
/xgreen --minimal          # 3. Make test pass
/xquality --all           # 4. Ensure quality
/xcommit --tdd <spec-id>  # 5. Commit with traceability
```

## Command Index

| Command | Purpose | Section |
|---------|---------|---------|
| `/xanalyze` | Analyze code structure and find issues | [Debugging & Analysis](#debugging--analysis) |
| `/xarchitecture` | Design and validate system architecture | [Architecture & Design](#architecture--design) |
| `/xatomic` | Break large tasks into manageable pieces | [Task Planning & Decomposition](#task-planning--decomposition) |
| `/xaws` | Work with AWS services and credentials | [AWS/IAM Development](#awsiam-development) |
| `/xcommit` | Create commits linked to specifications | [Commit & Version Control](#commit--version-control) |
| `/xcompliance` | Check project compliance with standards | [Security & Compliance](#security--compliance) |
| `/xconfig` | Manage project configuration files | [Environment & Configuration](#environment--configuration) |
| `/xconstraints` | Define and enforce coding constraints | [Governance & Rules](#governance--rules) |
| `/xcoverage` | Generate and analyze test coverage reports | [Testing & Quality](#testing--quality) |
| `/xdebug` | Debug issues and trace problems to specs | [Debugging & Analysis](#debugging--analysis) |
| `/xdesign` | Apply design patterns and best practices | [Architecture & Design](#architecture--design) |
| `/xdocs` | Generate documentation from code and specs | [Documentation & Reporting](#documentation--reporting) |
| `/xfootnote` | Manage specification reference IDs | [Specification Management](#specification-management) |
| `/xgenerate` | Auto-generate code, tests, and docs | [AI-Assisted Generation](#ai-assisted-generation) |
| `/xgovernance` | Manage development policies and audits | [Governance & Rules](#governance--rules) |
| `/xgreen` | Write minimal code to make tests pass | [TDD Cycle Management](#tdd-cycle-management) |
| `/xiac` | Manage infrastructure code and IAM | [AWS/IAM Development](#awsiam-development) |
| `/xmaturity` | Assess development process maturity | [AI Readiness & Maturity](#ai-readiness--maturity) |
| `/xmonitoring` | Monitor development process health | [Observable Development](#observable-development) |
| `/xobservable` | Get insights into development patterns | [Observable Development](#observable-development) |
| `/xoptimize` | Find and apply performance improvements | [Performance & Optimization](#performance--optimization) |
| `/xperformance` | Profile and benchmark application performance | [Performance & Optimization](#performance--optimization) |
| `/xplanning` | Create roadmaps and estimate effort | [Task Planning & Decomposition](#task-planning--decomposition) |
| `/xpolicy` | Generate and validate IAM policies | [AWS/IAM Development](#awsiam-development) |
| `/xquality` | Run code quality checks and formatting | [Testing & Quality](#testing--quality) |
| `/xreadiness` | Assess AI development readiness | [AI Readiness & Maturity](#ai-readiness--maturity) |
| `/xred` | Write failing tests for new features | [TDD Cycle Management](#tdd-cycle-management) |
| `/xrisk` | Identify and mitigate project risks | [Governance & Rules](#governance--rules) |
| `/xrules` | Define coding rules and check compliance | [Governance & Rules](#governance--rules) |
| `/xsandbox` | Create secure development environments | [Security & Compliance](#security--compliance) |
| `/xscan` | Scan repository for specific patterns | [Debugging & Analysis](#debugging--analysis) |
| `/xsecurity` | Run security scans and vulnerability checks | [Security & Compliance](#security--compliance) |
| `/xsetup` | Set up development environment | [Environment & Configuration](#environment--configuration) |
| `/xspec` | Read and manage project specifications | [Specification Management](#specification-management) |
| `/xtdd` | Complete test-driven development cycles | [TDD Cycle Management](#tdd-cycle-management) |
| `/xtemplate` | Generate code templates and boilerplate | [AI-Assisted Generation](#ai-assisted-generation) |
| `/xtest` | Run tests with various options | [Testing & Quality](#testing--quality) |
| `/xvalidate` | Validate project completeness and quality | [Documentation & Reporting](#documentation--reporting) |
| `/xacp` | Auto stage, commit, and push changes | [Commit & Version Control](#commit--version-control) |
| `/xanalytics` | Business and performance analytics | [Analytics & Business Intelligence](#analytics--business-intelligence) |
| `/xapi` | API design and management | [API Management](#api-management) |
| `/xcicd` | Manage CI/CD pipelines and deployments | [CI/CD Pipeline Management](#cicd-pipeline-management) |
| `/xdb` | Database management and operations | [Database Management](#database-management) |
| `/xincident` | Incident response and management | [Incident Management](#incident-management) |
| `/xinfra` | Infrastructure and operations | [Infrastructure Management](#infrastructure-management) |
| `/xknowledge` | Knowledge and team management | [Knowledge Management](#knowledge-management) |
| `/xpipeline` | Configure build and deployment pipelines | [CI/CD Pipeline Management](#cicd-pipeline-management) |
| `/xproduct` | Product management and strategy | [Product Management](#product-management) |
| `/xrefactor` | Get suggestions to improve code quality | [Architecture & Design](#architecture--design) |
| `/xrelease` | Release management and coordination | [Release Management](#release-management) |
| `/xsprint` | Sprint and project management | [Project Management](#project-management) |
| `/xux` | User experience and frontend | [User Experience](#user-experience) |

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

#### `/xfootnote` - Track Machine-Readable Requirement Links
Find and manage links between requirements and their implementations using SpecDriven AI methodology.

```bash
/xfootnote --find <id>       # Find requirement by footnote ID (e.g., cli1a)
/xfootnote --next <component> # Generate next available ID with proper format
/xfootnote --trace <id>      # Show tests implementing requirement
/xfootnote --validate <id>   # Validate footnote ID format (^[a-z]{3}[0-9][a-z])
/xfootnote --authority <id>  # Show authority level for specification
/xfootnote --coverage <id>   # Check dual coverage (code + specification)
```

**Dual Coverage Tracking:**
- **Code Coverage**: Lines of code executed by tests
- **Specification Coverage**: All specifications have corresponding tests
- **Traceability**: Every test links back to specific specification ID

### TDD Cycle Management

#### `/xtdd` - Run Complete TDD Workflow
Automate the full Red-Green-Refactor-Commit cycle for any feature.

```bash
/xtdd --red <spec-id>        # Start: write failing test
/xtdd --green                # Implement minimal passing code
/xtdd --refactor             # Improve code, keep tests green
/xtdd --commit <spec-id>     # Commit with spec reference
```

#### `/xred` - Write Failing Tests First
```bash
/xred --spec <spec-id>       # Create test for specific requirement
/xred --component <name>     # Create test for new component
```

#### `/xgreen` - Make Tests Pass
```bash
/xgreen --minimal            # Implement just enough to pass
/xgreen --check              # Verify tests pass
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

#### `/xcommit` - SpecDriven AI Commits with Traceability
```bash
/xcommit --tdd <spec-id>     # Commit TDD cycle with footnote reference
/xcommit --message <spec-id> # Generate commit message with spec traceability
/xcommit --trace             # Include full traceability info
/xcommit --authority <spec-id> # Include authority level in commit
/xcommit --coverage <spec-id>  # Include coverage metrics in commit message
```

**SpecDriven AI Commit Format:**
```
feat: implement [requirement] via TDD (^cli1a)

- Add failing test for [specific behavior]
- Implement minimal code to pass test
- Authority: developer
- Specification Coverage: 95%
- Code Coverage: 87%

Implements: specs/specifications/cli-interface.md#{#cli1a authority=developer}
```

#### `/xacp` - Add, Commit, Push Automation
Automates the complete git workflow: stages all changes, generates smart commit messages, commits, and pushes.

```bash
/xacp                        # Stage all, commit with smart message, push
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

#### `/xdesign` - Design Patterns
```bash
/xdesign --patterns <domain> # Suggest domain patterns
/xdesign --principles        # Review principles
/xdesign --refactor <component> # Refactoring guidance
/xdesign --best-practices    # Show best practices
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

#### `/xperformance` - Performance Analysis
```bash
/xperformance --profile <component> # Profile performance
/xperformance --benchmark    # Run benchmarks
/xperformance --optimize     # Get optimizations
/xperformance --monitor      # Monitor metrics
/xperformance --report       # Generate report
```

#### `/xoptimize` - Code Optimization
```bash
/xoptimize --code <component> # Optimize code
/xoptimize --process <workflow> # Optimize workflow
/xoptimize --dependencies   # Optimize dependencies
/xoptimize --resources       # Optimize resources
```

### Security & Compliance

#### `/xsecurity` - Security Analysis
```bash
/xsecurity --scan            # Run vulnerability scan
/xsecurity --secrets         # Check for exposed secrets
/xsecurity --dependencies    # Analyze dependencies
/xsecurity --policies        # Validate policies
/xsecurity --report          # Generate report
```

#### `/xsandbox` - Security Sandbox
```bash
/xsandbox --create           # Create secure environment
/xsandbox --isolate          # Isolate development
/xsandbox --validate         # Check security
/xsandbox --monitor          # Monitor activity
/xsandbox --cleanup          # Clean up resources
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

#### `/xanalytics` - Business & Performance Analytics
```bash
/xanalytics --business       # Business metrics tracking
/xanalytics --users          # User behavior analysis
/xanalytics --performance    # Performance analytics
/xanalytics --custom <metric> # Custom metrics implementation
/xanalytics --reports        # Custom reporting generation
/xanalytics --predictions    # Predictive analytics
```

### CI/CD Pipeline Management

#### `/xcicd` - CI/CD Operations
```bash
/xcicd --pipeline <type>      # Create pipeline configuration
/xcicd --validate             # Validate pipeline configuration
/xcicd --optimize             # Optimize pipeline performance
/xcicd --security             # Security scan pipeline
/xcicd --deploy <env>         # Deploy to environment
```

#### `/xpipeline` - Pipeline Configuration
```bash
/xpipeline --init <platform>  # Initialize pipeline for platform
/xpipeline --stage <name>     # Add pipeline stage
/xpipeline --artifact         # Configure artifact management
/xpipeline --test-stage       # Configure testing stage
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

#### `/xsprint` - Sprint & Project Management
```bash
/xsprint --plan <iteration>   # Sprint planning
/xsprint --track <progress>   # Progress tracking
/xsprint --retrospective      # Sprint retrospectives
/xsprint --velocity           # Team velocity analysis
/xsprint --assignment         # Task assignment automation
/xsprint --reporting          # Stakeholder reporting
```

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

#### `/xreadiness` - AI Development Readiness
```bash
/xreadiness --assess         # Run assessment
/xreadiness --baseline       # Establish metrics
/xreadiness --capabilities   # Assess capabilities
/xreadiness --gaps           # Identify gaps
/xreadiness --report         # Generate report
```

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

#### `/xobservable` - Development Observability
```bash
/xobservable --trace <operation> # Trace operations
/xobservable --metrics       # View dashboard
/xobservable --insights      # Get insights
/xobservable --patterns      # Analyze patterns
/xobservable --optimize      # Get suggestions
```

#### `/xmonitoring` - Process Monitoring
```bash
/xmonitoring --health        # Check health
/xmonitoring --performance   # Monitor performance
/xmonitoring --alerts        # Manage alerts
/xmonitoring --dashboard     # View dashboard
/xmonitoring --trends        # Analyze trends
```

### AI-Assisted Generation

#### `/xgenerate` - Code Generation
```bash
/xgenerate --test <spec-id>  # Generate test from spec
/xgenerate --code <test>     # Generate passing code
/xgenerate --schema <model>  # Generate Pydantic schema
/xgenerate --docs <component> # Generate documentation
/xgenerate --config <template> # Generate configuration
```

#### `/xtemplate` - Template Generation
```bash
/xtemplate --spec <type>     # Specification template
/xtemplate --test <pattern>  # Test pattern
/xtemplate --component <type> # Component template
/xtemplate --workflow <pattern> # Workflow pattern
```

---

## Project Management

### Environment & Configuration

#### `/xsetup` - Environment Setup
```bash
/xsetup --env                # Run complete setup
/xsetup --deps               # Install dependencies
/xsetup --python             # Set up Python 3.11+
```

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

#### `/xvalidate` - Project Validation
```bash
/xvalidate --compliance      # Check compliance
/xvalidate --traceability    # Verify traceability
/xvalidate --coverage        # Validate coverage
```

### Debugging & Analysis

#### `/xdebug` - Debugging Assistance
```bash
/xdebug --trace <error>      # Trace to specification
/xdebug --logs               # Analyze logs
/xdebug --policy <role>      # Debug policy generation
```

#### `/xanalyze` - Code Analysis
```bash
/xanalyze --structure        # Check structure
/xanalyze --types            # Verify type safety
/xanalyze --patterns         # Analyze patterns
```

#### `/xscan` - Repository Scanning
```bash
/xscan --roles               # Find IAM roles
/xscan --files               # Find IaC files
/xscan --issues              # Identify issues
```

### Governance & Rules

#### `/xrules` - Rules as Code
```bash
/xrules --define <rule>      # Define new rule
/xrules --validate           # Check compliance
/xrules --enforce            # Apply rules
/xrules --report             # Generate report
/xrules --update <rule>      # Update rule
```

#### `/xgovernance` - Development Governance
```bash
/xgovernance --policy <type> # Manage policies
/xgovernance --audit         # Run audit
/xgovernance --compliance    # Check compliance
/xgovernance --controls      # Manage controls
```

#### `/xconstraints` - Constraint Management
```bash
/xconstraints --define <constraint> # Define constraint
/xconstraints --enforce      # Enforce constraints
/xconstraints --validate     # Check compliance
/xconstraints --optimize     # Optimize constraints
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

## Workflow Examples

### Complete Feature Development

**Prerequisites:** Environment setup complete, specifications available

#### Phase 1: Planning and Setup
```bash
# Decompose feature into atomic tasks (4-8 hour units)
/xatomic --decompose "implement user authentication"
# Expected: 3-5 atomic tasks with dependencies identified

# Generate development roadmap
/xplanning --roadmap
# Expected: Prioritized task list with time estimates

# Create secure development environment
/xsandbox --create
# Expected: Isolated environment ready for development
```

#### Phase 2: Specification-Driven Development
```bash
# Read the specific requirement
/xspec --read auth2c
# Expected: Clear requirement definition with acceptance criteria

# Generate test from specification
/xgenerate --test auth2c
# Expected: Test file created in specs/tests/

# Create failing test (Red phase)
/xred --spec auth2c
# Expected: Test fails as expected, proves requirement gap
```

#### Phase 3: Implementation (Green phase)
```bash
# Implement minimal code to pass test
/xgreen --minimal
# Expected: Test passes, code coverage increases

# Enforce project constraints
/xconstraints --enforce
# Expected: No constraint violations

# Run all quality checks
/xquality --all
# Expected: All checks pass (mypy, ruff, formatting)
```

#### Phase 4: Optimization and Commit
```bash
# Profile performance if needed
/xperformance --profile authentication
# Expected: Performance baseline established

# Get optimization suggestions
/xoptimize --code authentication
# Expected: Specific improvement recommendations

# Commit with traceability
/xcommit --tdd auth2c
# Expected: Commit with proper footnote reference
```

**Success Criteria:** Tests pass, quality gates pass, feature traced to specification

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

```bash
# 1. Read the specification
/xspec --read cli1a
# Expected: Clear understanding of requirement

# 2. Write failing test
/xred --spec cli1a
# Expected: Red test that describes desired behavior

# 3. Run test to confirm failure
/xtest --spec
# Expected: Test fails for right reason

# 4. Write minimal implementation
/xgreen --minimal
# Expected: Test passes with simplest possible code

# 5. Refactor if needed (while keeping tests green)
/xquality --all
# Expected: Clean code that passes all quality gates

# 6. Commit with traceability
/xcommit --tdd cli1a
# Expected: Clean commit with specification reference
```

**Cycle Time:** 15-30 minutes per cycle

### AI Development Readiness Assessment

**Prerequisites:** Project structure established

#### Phase 1: Baseline Assessment
```bash
# Assess current AI development readiness
/xreadiness --assess
# Expected: Readiness score with specific improvement areas

# Check development maturity level
/xmaturity --level
# Expected: Maturity level (1-5) with next level requirements

# Establish baseline metrics
/xreadiness --baseline
# Expected: Measurement baseline for future comparison
```

#### Phase 2: Capability Enhancement
```bash
# Define AI development standards
/xrules --define "ai-standards"
# Expected: Codified rules for AI-assisted development

# Set up development observability
/xobservable --metrics
# Expected: Metrics dashboard for development insights

# Create monitoring for development patterns
/xmonitoring --health
# Expected: Health checks for development process
```

#### Phase 3: Progress Tracking
```bash
# Monitor maturity progress
/xmaturity --progress
# Expected: Progress report against maturity goals

# Identify remaining readiness gaps
/xreadiness --gaps
# Expected: Prioritized list of improvement opportunities

# Generate readiness report
/xreadiness --report
# Expected: Comprehensive readiness assessment document
```

**Success Metrics:** Readiness score >80%, maturity level 3+, no critical gaps

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
/xcicd --security
# Expected: Security analysis of pipeline configuration

# Validate against CI/CD best practices
/xcicd --validate
# Expected: Compliance check against documented standards

# Optimize pipeline performance
/xcicd --optimize
# Expected: Performance improvements identified
```

#### Phase 3: Deployment and Monitoring
```bash
# Deploy to staging environment
/xcicd --deploy staging
# Expected: Successful deployment with validation

# Monitor deployment metrics
/xmonitoring --health
# Expected: Health checks and performance metrics

# Generate deployment report
/xcicd --report
# Expected: Deployment summary with success metrics
```

**Success Criteria:** Pipeline deploys successfully, security validated, performance optimized

## SpecDriven AI Best Practices

1. **Start with machine-readable specifications**: Always use `/xspec --read` with proper authority levels before development
2. **Follow TDD discipline**: Use `/xtdd` commands for all changes with specification traceability
3. **Maintain dual coverage**: Track both code coverage and specification coverage using `/xcoverage --dual`
4. **Validate continuously**: Run `/xquality --all` and `/xspec --validate` before committing
5. **Ensure traceability**: Every test must link to a specific specification ID with authority level
6. **Monitor development**: Use `/xobservable` for insights into specification compliance
7. **Secure by default**: Run `/xsecurity --scan` regularly
8. **Plan strategically**: Use `/xplanning` for complex planning with specification references
9. **Authority-driven development**: Respect specification authority levels (system > platform > developer)
10. **Precise specifications lead to precise implementation**: Write detailed, testable specifications

## Troubleshooting

### Common Issues and Solutions

#### Command Not Found
**Symptom:** `/xcommand` not recognized
**Solutions:**
1. Verify command exists in Command Index above
2. Check if project has `.claude/commands/` directory
3. Ensure correct namespace: use `/project:command` or `/user:command`
4. For `/x` shortcuts, ensure commands are in correct location

#### Specification Not Found
**Symptom:** `/xspec --read <id>` returns "specification not found"
**Solutions:**
1. Check `specs/specifications/` directory exists
2. Verify footnote ID format matches `^[a-z]{3}[0-9][a-z]` pattern
3. Use `/xfootnote --find <partial-id>` to locate specifications
4. Ensure specification file contains the footnote reference

#### Test Generation Fails
**Symptom:** `/xgenerate --test <spec-id>` produces invalid tests
**Solutions:**
1. Verify specification has clear acceptance criteria
2. Check that `specs/tests/` directory structure exists
3. Ensure Python environment is properly configured
4. Use `/xvalidate --spec <spec-id>` to check specification format

#### Quality Checks Fail
**Symptom:** `/xquality --all` reports errors
**Common Issues:**
- **MyPy errors**: Check type annotations, update imports
- **Ruff formatting**: Run `/xquality --format` to auto-fix
- **Missing dependencies**: Use `/xsetup --deps` to reinstall

**Resolution Steps:**
```bash
/xquality --mypy          # Check specific issue
/xquality --format        # Auto-fix formatting
/xanalyze --types         # Deep type analysis
```

#### TDD Cycle Breaks
**Symptom:** Tests pass unexpectedly or fail for wrong reasons
**Diagnosis:**
1. Use `/xtest --component <name>` to isolate issues
2. Check test isolation with `/xtest --unit`
3. Verify mocks with `/xaws --mock` for AWS tests

**Recovery:**
```bash
/xdebug --trace <error>   # Trace error to specification
/xtest --coverage         # Check test completeness
/xvalidate --traceability # Verify spec-to-test links
```

#### Performance Issues
**Symptom:** Commands run slowly or time out
**Optimization:**
1. Check system resources with `/xmonitoring --performance`
2. Profile specific operations with `/xperformance --profile <component>`
3. Optimize command execution with appropriate flags

#### Security Scan Failures
**Symptom:** `/xsecurity --scan` reports vulnerabilities
**Response Protocol:**
1. **Critical vulnerabilities**: Stop development, fix immediately
2. **High vulnerabilities**: Fix before next commit
3. **Medium/Low**: Plan fix in next sprint

**Remediation:**
```bash
/xsecurity --dependencies    # Check dependency issues
/xsecurity --secrets         # Verify no exposed secrets
/xrisk --mitigate <issue>   # Get specific guidance
```

#### Environment Setup Problems
**Symptom:** `/xsetup --env` fails or commands don't work
**Solutions:**
1. Check Python version: requires 3.11+
2. Verify `./setup.sh` exists and is executable
3. Check environment variables are set
4. Use `/xconfig --validate` to check configuration

**Reset Environment:**
```bash
/xsetup --python          # Reinstall Python requirements
/xsetup --deps            # Reinstall dependencies
/xconfig --template       # Regenerate configuration
```

### Error Code Reference

| Error Pattern | Meaning | Action |
|---------------|---------|--------|
| `SPEC_NOT_FOUND` | Specification file missing | Check `specs/specifications/` directory |
| `FOOTNOTE_INVALID` | Footnote ID format wrong | Use pattern `^[a-z]{3}[0-9][a-z]` |
| `TEST_GEN_FAILED` | Test generation failed | Verify specification format |
| `QUALITY_FAILED` | Code quality check failed | Run individual quality commands |
| `TDD_CYCLE_BROKEN` | TDD cycle inconsistent | Reset with `/xtdd --red <spec-id>` |
| `SECURITY_VIOLATION` | Security issue detected | Run `/xsecurity --mitigate` |
| `ENV_SETUP_FAILED` | Environment setup failed | Check prerequisites and permissions |

### Getting Help

1. **Command Help**: Most commands support `--help` flag
2. **Specification Issues**: Use `/xvalidate --compliance` for checks
3. **Complex Problems**: Use `/xanalyze` commands for deep analysis
4. **Integration Issues**: Check Integration Points section below

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