---
description: Comprehensive development environment setup with automated installation and configuration
tags: [setup, environment, configuration, dependencies, tools, automation]
---

Set up and configure development environments based on the arguments provided in $ARGUMENTS.

First, detect the current system and environment:
!uname -s
!ls -la | grep -E "(package.json|requirements.txt|pyproject.toml|Cargo.toml|go.mod)"
!python3 --version 2>/dev/null || python --version 2>/dev/null || echo "Python not available"

Based on $ARGUMENTS, perform the appropriate setup operation:

## 1. Environment Setup

If setting up environment (--env, --dev, --test, --production):
!which brew 2>/dev/null || which apt-get 2>/dev/null || which yum 2>/dev/null || echo "No package manager detected"
!docker --version 2>/dev/null || echo "Docker not installed"
!git --version 2>/dev/null || echo "Git not installed"

Set up comprehensive development environment:
- Detect and configure package managers
- Install essential development tools
- Configure version control systems
- Set up containerization tools
- Install language-specific tools and runtimes

## 2. Dependency Management

If managing dependencies (--deps, --python, --node):
!find . -name "requirements.txt" -o -name "package.json" -o -name "pyproject.toml" | head -5
!python3 -m pip --version 2>/dev/null || echo "pip not available"
!npm --version 2>/dev/null || echo "npm not available"

Install and manage project dependencies:
- Python: pip, poetry, conda environments
- Node.js: npm, yarn, pnpm package management
- Language-specific dependency resolution
- Virtual environment configuration
- Dependency security scanning

## 3. Tool Installation and Configuration

If installing tools (--tools, --cli-tools, --editors):
!which code 2>/dev/null || which vim 2>/dev/null || echo "No editors detected"
!which kubectl 2>/dev/null || echo "Kubernetes tools not installed"
!which terraform 2>/dev/null || echo "Terraform not installed"

Install and configure development tools:
- Code editors and IDEs
- Command-line utilities
- Infrastructure tools
- Security scanners
- Monitoring and debugging tools

## 4. Validation and Health Checks

If validating setup (--validate, --health-check, --doctor):
!python3 -c "import sys; print(f'Python {sys.version}')" 2>/dev/null || echo "Python validation failed"
!node --version 2>/dev/null || echo "Node.js validation failed"
!docker ps 2>/dev/null || echo "Docker validation failed"

Perform comprehensive environment validation:
- Verify tool installations and versions
- Check configuration file validity
- Test network connectivity
- Validate security settings
- Generate health report

## 5. Platform-Specific Setup

If setting up platform-specific environment (--macos, --linux, --windows):
!sw_vers 2>/dev/null || lsb_release -a 2>/dev/null || systeminfo 2>/dev/null || echo "Platform detection failed"
!which brew 2>/dev/null && echo "macOS detected" || echo "Non-macOS platform"

Configure platform-specific tools and settings:
- macOS: Homebrew, Xcode tools, system preferences
- Linux: Package managers, development libraries
- Windows: WSL, PowerShell, development tools
- Cross-platform: Environment standardization

## 6. Project-Specific Configuration

If setting up project-specific environment (--web, --api, --data):
@package.json 2>/dev/null || @requirements.txt 2>/dev/null || echo "No project files detected"
!find . -name "Dockerfile" -o -name "docker-compose.yml" | head -3

Configure project-specific development environment:
- Web development: Frontend frameworks, build tools
- API development: Backend frameworks, testing tools
- Data science: Jupyter, data libraries, visualization
- Mobile development: Platform SDKs, simulators

Think step by step about environment setup requirements and provide:

1. **Environment Analysis**:
   - Current system and platform detection
   - Existing tool and dependency inventory
   - Configuration file validation
   - Environment variable assessment

2. **Setup Strategy**:
   - Platform-specific installation approach
   - Dependency resolution and management
   - Tool configuration and integration
   - Security and compliance setup

3. **Validation and Testing**:
   - Installation verification procedures
   - Configuration testing protocols
   - Health check implementations
   - Performance benchmarking

4. **Documentation and Maintenance**:
   - Setup documentation generation
   - Troubleshooting guides
   - Update and maintenance procedures
   - Team onboarding workflows

Generate comprehensive environment setup with automated installation, configuration validation, and complete documentation for team collaboration and maintenance.

If no specific operation is provided, perform complete environment analysis and recommend setup priorities based on project requirements and current system state.