# Initialize repo with comprehensive CLAUDE.md + Specification-Driven Development

Initialize a new project with comprehensive CLAUDE.md and specification framework.

## Usage
```
/xnew <project_name> [stack]
```

## Examples
```
/xnew vibecoding-web node
/xnew ai-patterns python
/xnew microservice-api go
```

## Parameters
- **PROJECT_NAME**: First word in arguments (default: current folder name)
- **STACK**: Technology stack (choices: `python` | `node` | `go` | `java` | `mixed`; default: `mixed`)

## Execution

Perform the following steps in order:

### Step 1: Safety & Idempotence
- Check for existing files before overwriting
- Create timestamped backups for any existing files (format: `filename.bak-YYYYMMDD-HHMMSS`)
- Never overwrite without backup creation

### Step 2: Create Comprehensive CLAUDE.md
Generate CLAUDE.md with Specification-Driven Development methodology:

```markdown
# Project: $PROJECT_NAME
# Stack: $STACK
# Generated: $(date +%Y-%m-%d)
# Development Methodology: Specification-Driven Development (SDD)

This is the single source of truth for all development standards, conventions, rules, and specifications for this project. Claude Code and other AI assistants should read this file first and follow these guidelines for all operations.

## 📚 Specification-Driven Development

This project follows Specification-Driven Development (SDD) methodology. All features MUST have specifications before implementation.

### Specification Framework
specs/
├── README.md                    # Specification guide and navigation
├── requirements.md             # EARS-formatted requirements
├── design.md                   # Technical architecture and design
├── tasks.md                    # Atomic, sequenced implementation tasks
├── mvp-summary.md             # MVP vs Advanced feature separation
├── testing-requirements.md    # Test coverage requirements
├── performance-benchmarks.md  # Performance targets and metrics
├── user-testing-strategy.md   # User validation approach
├── system-monitoring.md       # Operational monitoring strategy
├── hooks.md                   # Development lifecycle automation
├── agents.md                  # Multi-agent orchestration
├── context.md                 # Data classification and context management
└── github-actions-requirements.md  # CI/CD automation specs

### EARS Requirements Pattern
All requirements use Official EARS Syntax (https://alistairmavin.com/ears/):
- Event-Driven: When <trigger>, the <system> shall <response>
- State-Driven: While <precondition>, the <system> shall <response>
- Ubiquitous: The <system> shall <response> (always active)
- Optional Feature: Where <feature>, the <system> shall <response>
- Unwanted Behavior: If <trigger>, then the <system> shall <response>

### Specification Coverage Requirements
- Every feature must have corresponding specifications
- Every specification must have corresponding tests
- Minimum spec coverage: 95% of all features
- Spec-to-test mapping: Automated validation required

## 🎯 Project Goals & Context
- Primary objective: [Define main goal and success metrics]
- Technical requirements: [Core technical needs and constraints]
- Business objectives: [Business value delivered]
- User value: [What users gain from this system]
- Development methodology: Specification-Driven Development (SDD)

## 📋 Requirements Management

### Requirements Framework (EARS)
requirement_structure:
  id: "REQ-XXX"
  pattern: "Event-Driven|State-Driven|Ubiquitous|Optional|Unwanted"
  requirement: "Clear EARS-formatted statement"
  rationale: "Why this requirement exists"
  acceptance_criteria: "Testable criteria for validation"
  priority: "MVP|ADVANCED"

### MVP vs Advanced Features
- MVP Features: Core functionality for initial release
- Advanced Features: Enhanced capabilities for future iterations
- Decision Framework:
  - ✅ Include in MVP if: Essential for core workflow
  - ⚠️ Move to Advanced if: Complex edge cases or optimizations

## 📁 Directory Structure
project/
├── src/                        # Source code
├── tests/                     # Test suites
│   └── specs/                # Specification compliance tests
├── specs/                     # SPECIFICATIONS (CRITICAL)
│   ├── README.md            # Specification navigation guide
│   ├── requirements.md      # EARS-formatted requirements
│   ├── design.md           # Technical architecture
│   ├── tasks.md            # Implementation roadmap
│   └── [other specs]       # Additional specifications
├── docs/                      # Documentation
├── .claude/                  # Claude Code configuration
│   ├── commands/            # Custom slash commands
│   ├── hooks/              # Pre/post task hooks
│   └── knowledge/          # Captured patterns
├── scripts/                  # Build and deployment scripts
├── ci/                      # CI/CD configuration
├── config/                  # Application configuration
└── AI_INTERACTIONS.md       # AI development log

## 🏷️ Naming Conventions

### Files and Directories
- Files: kebab-case (e.g., user-service.js, api-client.ts)
- Test files: *.test.js or *.spec.js
- Config files: dot-prefixed (e.g., .env, .eslintrc)
- Documentation: UPPER-CASE.md for root docs, kebab-case.md for others

### Code Conventions
- Classes: PascalCase (e.g., UserService, ApiController)
- Interfaces/Types: PascalCase with 'I' or 'T' prefix optional
- Functions/Methods: camelCase (e.g., getUserById, handleRequest)
- Constants: UPPER_SNAKE_CASE (e.g., MAX_RETRIES, API_TIMEOUT)
- Variables: camelCase (e.g., currentUser, isLoading)
- Private members: underscore prefix (e.g., _privateMethod)
- Database: snake_case for tables and columns

## 💻 Language/Framework Standards - $STACK

[Insert stack-specific standards based on $STACK parameter]

## 🧪 Testing Strategy

### Specification-Based Testing
# Every specification must have corresponding tests
def test_req_001_ticker_submission():
    """
    Test REQ-001: Ticker Symbol Submission
    Spec: specs/requirements.md#REQ-001
    """
    pass

### Coverage Requirements
- Unit tests: Minimum 80% code coverage
- Specification tests: 100% requirement coverage
- Integration tests: All API endpoints and database operations
- E2E tests: Critical user journeys
- Performance tests: Meet targets from specs/performance-benchmarks.md

## 🔐 Security Standards

### Application Security
- Input validation on all user inputs
- Parameterized queries to prevent SQL injection
- HTTPS only for all endpoints
- Rate limiting on all APIs
- Authentication required for all non-public endpoints
- JWT tokens with short expiration
- CORS properly configured
- Security headers (CSP, HSTS, X-Frame-Options)
- Regular dependency vulnerability scanning

### Data Protection
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.2+)
- No secrets in code (use environment variables)
- Secure credential storage
- Audit logging for sensitive operations

## 🚀 CI/CD Pipeline

### Pipeline Stages
1. Specification Validation - Verify all features have specifications
2. Build Stage - Compile and generate artifacts
3. Test Stage - Run all tests including spec compliance
4. Quality Gates - All must pass including spec coverage
5. Documentation Validation - Verify specs are complete
6. Deployment Stage - Blue-green deployment
7. Post-Deployment - Monitor and verify

## 🔄 Git & Version Control

### Branching Strategy
- Trunk-Based Development with short-lived feature branches
- Feature branches: feature/REQ-XXX-description
- Main branch is always deployable

### Commit Standards
- Use Conventional Commits format
- Reference specifications: feat(REQ-001): implement requirement
- Atomic commits (one logical change)

## 🛠️ Development Workflow

### Specification-Driven Development Process

1. Specification Phase (ALWAYS FIRST)
   - Check specs/requirements.md for existing requirements
   - Write/update EARS-formatted requirements
   - Update specs/design.md with technical approach
   - Break down into tasks in specs/tasks.md

2. Implementation Phase
   - Reference specification in code comments
   - Implement according to specs/design.md
   - Follow task sequence from specs/tasks.md

3. Validation Phase
   - Run specification compliance tests
   - Validate performance against benchmarks
   - Update specifications if gaps found

### Code Review Checklist
- [ ] References correct specification (REQ-XXX)
- [ ] Specification tests added/updated
- [ ] Implementation matches specs/design.md
- [ ] Performance meets specs/performance-benchmarks.md
- [ ] Documentation updated in specs/
- [ ] No unspecified functionality added

## 📝 Documentation Standards

### Required Documentation
- README.md: Project overview
- CLAUDE.md: This file - development standards
- specs/: All specifications (PRIMARY SOURCE)
- AI_INTERACTIONS.md: Clean log of AI-assisted development

### AI Interaction Logging
Keep a clean, readable log in AI_INTERACTIONS.md:

## 2024-01-15 14:30 - Implement ticker validation
**H:** Implement REQ-001 ticker validation from specs
**AI:** Created regex validation with special handling for BRK.A format
**Result:** ✅ Working validation function
**Spec Updated:** Added BRK.A edge case to REQ-001
**Commit:** abc123f

Guidelines:
- Only log significant interactions (not routine questions)
- Keep entries brief and scannable
- Focus on: What was asked → What was done → What changed
- Use ✅ for success, ❌ for failed attempts, ⚠️ for partial success

## 🤖 AI-Assisted Development

### Working with Claude Code
- ALWAYS start with specifications: Read specs/ before any work
- Reference specifications in prompts: "Implement REQ-001 from specs/requirements.md"
- Follow the methodology: This project uses Specification-Driven Development
- Validate against specs: All AI-generated code must meet specifications

### Effective Prompts
Template: "I'm implementing [REQ-XXX] from specs/requirements.md. This is an [MVP/ADVANCED] feature with [EARS-PATTERN] pattern. Please help me implement this following specs/design.md architecture."

## ✅ Definition of Done

A feature is considered "done" when ALL criteria are met:

### Specification Compliance
- [ ] All requirements from specs/requirements.md implemented
- [ ] Design follows specs/design.md architecture
- [ ] Performance meets specs/performance-benchmarks.md targets
- [ ] User testing passes per specs/user-testing-strategy.md

### Code Quality
- [ ] Code follows all standards in CLAUDE.md
- [ ] Specification tests written and passing (100% coverage)
- [ ] Unit tests written and passing (≥80% coverage)
- [ ] Documentation updated in specs/ and code
- [ ] Code reviewed and approved

### Operational Readiness
- [ ] CI/CD pipeline passing all stages
- [ ] Security scan passing
- [ ] Deployed to staging environment
- [ ] Monitoring configured per specs/system-monitoring.md

## 🔄 Continuous Improvement

### Learning from Implementation
When implementation teaches us something new:
1. Log it - Brief entry in AI_INTERACTIONS.md
2. Update spec - Add to specs/ with date marker
3. Test it - Add test for new understanding
4. Commit it - Clear commit message with spec reference

### Review Cycles
- Daily: Review current task against specifications
- Weekly: Update specs based on implementation learnings
- Sprint: Comprehensive specification review
- Quarterly: Major specification refactoring

---

Last Updated: $(date +%Y-%m-%d)
Version: 1.0.0
Methodology: Specification-Driven Development (SDD)

⚠️ CRITICAL: This document enforces Specification-Driven Development. All features MUST have specifications in the specs/ directory BEFORE implementation. No code without specs!
```

### Step 3: Create Specifications Directory
Create specs/ directory with essential templates:

```bash
mkdir -p specs/
```

Create specs/README.md with specification guide.
Create specs/requirements.md with EARS template.
Create specs/design.md with architecture template.
Create specs/tasks.md with implementation roadmap template.
Create other specification files as needed.

### Step 4: Generate .gitignore
Create stack-specific .gitignore based on $STACK parameter.

### Step 5: Create Directory Structure & Scripts
```bash
mkdir -p src tests/unit tests/integration tests/e2e tests/specs
mkdir -p docs/api docs/architecture docs/guides
mkdir -p scripts config ci
mkdir -p .claude/commands .claude/hooks .claude/knowledge
touch AI_INTERACTIONS.md
```

Create stack-specific automation scripts in `scripts/` directory:

**For Python Stack:**
Create `scripts/run.sh` as the unified automation script:
```bash
#!/bin/bash
# Python Project Automation Script
# Usage: ./scripts/run.sh [command] [args...]

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

PYTHON_VERSION="3.11"
VENV_DIR=".venv"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if Python 3.11 is available
check_python() {
    if command -v python$PYTHON_VERSION >/dev/null 2>&1; then
        PYTHON_CMD="python$PYTHON_VERSION"
    elif command -v python3 >/dev/null 2>&1 && python3 --version | grep -q "3.11"; then
        PYTHON_CMD="python3"
    elif command -v python >/dev/null 2>&1 && python --version | grep -q "3.11"; then
        PYTHON_CMD="python"
    else
        error "Python 3.11 not found. Please install Python 3.11"
    fi
    log "Using Python: $($PYTHON_CMD --version)"
}

# Setup virtual environment
setup_venv() {
    log "Setting up virtual environment..."
    
    if [ ! -d "$VENV_DIR" ]; then
        log "Creating virtual environment with Python $PYTHON_VERSION"
        $PYTHON_CMD -m venv "$VENV_DIR"
        success "Virtual environment created"
    fi
    
    # Activate virtual environment
    source "$VENV_DIR/bin/activate"
    
    # Upgrade pip
    log "Upgrading pip..."
    pip install --upgrade pip
    
    success "Virtual environment activated"
}

# Install dependencies
install_deps() {
    log "Installing dependencies..."
    
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        success "Production dependencies installed"
    fi
    
    if [ -f "requirements-dev.txt" ]; then
        pip install -r requirements-dev.txt
        success "Development dependencies installed"
    fi
    
    if [ -f "pyproject.toml" ]; then
        pip install -e ".[dev]"
        success "Package installed in development mode"
    fi
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Run pytest with coverage
    if command -v pytest >/dev/null 2>&1; then
        pytest tests/ --cov=src --cov-report=html --cov-report=term
        success "Tests completed with coverage report"
    else
        warn "pytest not found, running with unittest"
        python -m unittest discover tests/
    fi
}

# Run linting and formatting
run_quality() {
    log "Running code quality checks..."
    
    # Black formatting
    if command -v black >/dev/null 2>&1; then
        black src/ tests/ --check --diff
        success "Black formatting check passed"
    fi
    
    # isort import sorting
    if command -v isort >/dev/null 2>&1; then
        isort src/ tests/ --check-only --diff
        success "isort import check passed"
    fi
    
    # flake8 linting
    if command -v flake8 >/dev/null 2>&1; then
        flake8 src/ tests/
        success "flake8 linting passed"
    fi
    
    # mypy type checking
    if command -v mypy >/dev/null 2>&1; then
        mypy src/
        success "mypy type checking passed"
    fi
}

# Run security scan
run_security() {
    log "Running security scan..."
    
    if command -v bandit >/dev/null 2>&1; then
        bandit -r src/ -f json -o security-report.json
        bandit -r src/
        success "Security scan completed"
    else
        warn "bandit not installed, skipping security scan"
    fi
    
    # Check for known vulnerabilities
    if command -v safety >/dev/null 2>&1; then
        safety check
        success "Dependency vulnerability check passed"
    fi
}

# Build the project
run_build() {
    log "Building project..."
    
    if [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
        python -m build
        success "Build completed"
    else
        warn "No build configuration found (setup.py or pyproject.toml)"
    fi
}

# Run GitHub Actions locally with nektos/act
run_act() {
    log "Running GitHub Actions locally with act..."
    
    if ! command -v act >/dev/null 2>&1; then
        error "act not installed. Install with: brew install act"
    fi
    
    # Setup virtual environment first
    setup_venv
    install_deps
    
    # Run act with the specified event
    local event=${1:-push}
    act "$event" --artifact-server-path /tmp/artifacts
    
    success "GitHub Actions simulation completed"
}

# Deploy the application
run_deploy() {
    log "Deploying application..."
    
    # Run quality checks first
    run_quality
    run_tests
    run_security
    
    # Build
    run_build
    
    # Add deployment logic here
    warn "Deployment logic not implemented yet"
}

# Development server
run_dev() {
    log "Starting development server..."
    
    setup_venv
    install_deps
    
    # Look for common dev server patterns
    if [ -f "app.py" ]; then
        python app.py
    elif [ -f "main.py" ]; then
        python main.py
    elif [ -f "src/main.py" ]; then
        python src/main.py
    elif command -v uvicorn >/dev/null 2>&1 && [ -f "src/app.py" ]; then
        uvicorn src.app:app --reload
    else
        error "No development server entry point found"
    fi
}

# Clean up generated files
run_clean() {
    log "Cleaning up..."
    
    rm -rf build/ dist/ *.egg-info/
    rm -rf .pytest_cache/ __pycache__/ .coverage htmlcov/
    rm -rf .mypy_cache/ .bandit/
    find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete
    
    success "Cleanup completed"
}

# Show help
show_help() {
    echo "Usage: ./scripts/run.sh [command] [args...]"
    echo ""
    echo "Available commands:"
    echo "  setup      - Setup virtual environment and install dependencies"
    echo "  test       - Run tests with coverage"
    echo "  quality    - Run linting, formatting, and type checks"
    echo "  security   - Run security scans"
    echo "  build      - Build the project"
    echo "  deploy     - Deploy the application (includes all checks)"
    echo "  dev        - Start development server"
    echo "  act [event] - Run GitHub Actions locally (default: push)"
    echo "  clean      - Clean up generated files"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/run.sh setup"
    echo "  ./scripts/run.sh test"
    echo "  ./scripts/run.sh act pull_request"
    echo "  ./scripts/run.sh deploy"
}

# Main command processing
main() {
    check_python
    
    case "${1:-help}" in
        "setup")
            setup_venv
            install_deps
            ;;
        "test")
            setup_venv
            install_deps
            run_tests
            ;;
        "quality")
            setup_venv
            install_deps
            run_quality
            ;;
        "security")
            setup_venv
            install_deps
            run_security
            ;;
        "build")
            setup_venv
            install_deps
            run_build
            ;;
        "deploy")
            setup_venv
            install_deps
            run_deploy
            ;;
        "dev")
            run_dev
            ;;
        "act")
            run_act "${2:-push}"
            ;;
        "clean")
            run_clean
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Cleanup function for script exit
cleanup() {
    if [ -n "$VIRTUAL_ENV" ]; then
        deactivate 2>/dev/null || true
        log "Virtual environment deactivated"
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Run main function
main "$@"
```

**For Node.js Stack:**
Create `scripts/run.sh` with npm/yarn automation:
```bash
#!/bin/bash
# Node.js Project Automation Script

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

NODE_VERSION="18"

# Package manager detection
if [ -f "yarn.lock" ]; then
    PKG_MANAGER="yarn"
elif [ -f "pnpm-lock.yaml" ]; then
    PKG_MANAGER="pnpm"
else
    PKG_MANAGER="npm"
fi

log() {
    echo -e "\033[0;34m[$(date +'%H:%M:%S')]\033[0m $1"
}

success() {
    echo -e "\033[0;32m✅ $1\033[0m"
}

check_node() {
    if ! command -v node >/dev/null 2>&1; then
        error "Node.js not found. Please install Node.js $NODE_VERSION+"
    fi
    log "Using Node.js: $(node --version)"
    log "Using package manager: $PKG_MANAGER"
}

install_deps() {
    log "Installing dependencies..."
    $PKG_MANAGER install
    success "Dependencies installed"
}

run_tests() {
    log "Running tests..."
    $PKG_MANAGER test
    success "Tests completed"
}

run_build() {
    log "Building project..."
    $PKG_MANAGER run build
    success "Build completed"
}

run_dev() {
    log "Starting development server..."
    $PKG_MANAGER run dev
}

run_act() {
    log "Running GitHub Actions locally..."
    if ! command -v act >/dev/null 2>&1; then
        error "act not installed. Install with: brew install act"
    fi
    
    install_deps
    act "${1:-push}" --artifact-server-path /tmp/artifacts
    success "GitHub Actions simulation completed"
}

# Add main function and other commands...
main() {
    check_node
    case "${1:-help}" in
        "setup") install_deps ;;
        "test") install_deps && run_tests ;;
        "build") install_deps && run_build ;;
        "dev") install_deps && run_dev ;;
        "act") run_act "${2:-push}" ;;
        *) echo "Usage: $0 {setup|test|build|dev|act}" ;;
    esac
}

main "$@"
```

Make scripts executable:
```bash
chmod +x scripts/run.sh
```

### Step 6: Create README.md
Generate project README with SDD focus and specification references.

### Step 7: Git Commit
```bash
git add -A
git commit -m "init: SDD framework with CLAUDE.md and specifications via /xnew"
```

### Step 8: Final Output
```
✅ Repository initialized with Specification-Driven Development framework

Created:
- CLAUDE.md with SDD methodology and stack-specific standards
- specs/ directory with EARS templates and starter content
- scripts/run.sh - unified automation script for all operations
- AI_INTERACTIONS.md for logging AI-assisted development
- tests/specs/ for specification compliance testing
- Complete directory structure with configurations

Key Features:
✓ Specification-Driven Development enforced
✓ EARS requirements format with traceability
✓ AI interaction logging with timestamps
✓ Specification evolution from discoveries
✓ Unified automation via scripts/run.sh
✓ Stack-specific tooling and standards

Automation Commands (via scripts/run.sh):
📦 ./scripts/run.sh setup      - Install venv, Python 3.11, dependencies
🧪 ./scripts/run.sh test       - Run tests with coverage
✨ ./scripts/run.sh quality    - Linting, formatting, type checking
🔒 ./scripts/run.sh security   - Security scans with bandit/safety  
🏗️ ./scripts/run.sh build      - Build project artifacts
🚀 ./scripts/run.sh deploy     - Full deployment pipeline
⚡ ./scripts/run.sh dev        - Start development server
🎭 ./scripts/run.sh act [event] - Run GitHub Actions with nektos/act
🧹 ./scripts/run.sh clean      - Clean generated files

Next steps:
1. Run: ./scripts/run.sh setup (installs everything you need)
2. Write initial requirements in specs/requirements.md
3. Create technical design in specs/design.md  
4. Run: ./scripts/run.sh test (validates your setup)
5. Begin implementation following specifications
6. Use ./scripts/run.sh act to test GitHub Actions locally

Remember: 
- ALWAYS check specs/ before implementing!
- USE ./scripts/run.sh for all operations!
- LOG significant AI interactions!
- UPDATE specs when you learn something new!

The scripts/run.sh is your single entry point for:
✅ Python 3.11 virtual environment management
✅ Dependency installation and updates  
✅ Running tests, linting, security scans
✅ Building, deploying, and development workflows
✅ Local GitHub Actions testing with nektos/act
✅ Proper virtual environment cleanup
```