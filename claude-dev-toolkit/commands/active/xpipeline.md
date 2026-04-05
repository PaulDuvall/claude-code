---
description: Advanced CI/CD pipeline configuration, build automation, deployment orchestration, and optimization
tags: [pipeline, cicd, automation, deployment, orchestration, optimization, artifacts]
---

Configure and manage CI/CD pipelines based on the arguments provided in $ARGUMENTS.

## Usage Examples

**Analyze current pipeline:**
```
/xpipeline
```

**Initialize GitHub Actions pipeline:**
```
/xpipeline --init github
```

**Initialize GitLab CI pipeline:**
```
/xpipeline --init gitlab
```

**Initialize platform-agnostic pipeline:**
```
/xpipeline --init generic
```

**Validate pipeline best practices:**
```
/xpipeline --validate
```

**Configure deployment stage:**
```
/xpipeline --deploy staging
```

**Monitor pipeline health and DORA metrics:**
```
/xpipeline --monitor
```

**Rollback a deployment:**
```
/xpipeline --rollback staging
```

**Help and options:**
```
/xpipeline --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

First, examine the current pipeline configuration and environment:
!find . -name "*.yml" -o -name "*.yaml" | grep -E "(pipeline|workflow|ci|cd)" | head -10
!ls -la .github/workflows/ .gitlab-ci.yml Jenkinsfile azure-pipelines.yml buildspec.yml 2>/dev/null || echo "No CI/CD configurations found"
!git branch --show-current 2>/dev/null || echo "No git repository"

Based on $ARGUMENTS, perform the appropriate pipeline operation:

## 1. Pipeline Initialization (--init)

If initializing pipeline (--init github):
!mkdir -p .github/workflows
!mkdir -p config/environments
Create GitHub Actions workflow with configuration-driven stages:
- **Source Stage**: Checkout with secure authentication
- **Pre-commit Validation**: Fast feedback (< 5 minutes)
- **Build Stage**: Compile, unit tests, security scans, artifact generation
- **Test Stage**: Integration tests in isolated environment (< 30 minutes)
- **Security Stage**: SAST, secrets detection, dependency scanning
- **Deploy Stage**: Configuration-driven deployment to any environment

If initializing GitLab CI (--init gitlab):
!mkdir -p config/environments
Create .gitlab-ci.yml with configuration-driven deployment:
- source, build, test, security, deploy stages
- Environment-specific configuration files
- Parallel execution where possible for fast feedback

If initializing platform-agnostic pipeline (--init generic):
!mkdir -p config/environments
!mkdir -p scripts/ci
Create configuration templates that work with any CI/CD platform:
- Environment configuration files (staging.json, production.json)
- Unified deployment script with environment parameter
- Security scanning configuration
- Testing configuration

Detect project type and language:
!find . -name "package.json" -o -name "requirements.txt" -o -name "pom.xml" -o -name "go.mod" | head -3
!which docker 2>/dev/null || echo "Docker not available"
!git remote -v 2>/dev/null || echo "No git remotes configured"

## 2. Pipeline Validation (--validate)

If validating pipeline (--validate):
!yamllint .github/workflows/*.yml 2>/dev/null || echo "No GitHub workflows found"
!yamllint .gitlab-ci.yml 2>/dev/null || echo "No GitLab CI config found"
!find config/environments -name "*.json" -exec jq . {} \; 2>/dev/null || echo "No environment configs found"

Validate pipeline best practices compliance:
- **Required stages present**: source, build, test, security, deploy
- **Fast feedback**: Build + test stages complete within 30 minutes
- **Security controls**: Secrets detection, SAST, dependency scanning
- **Configuration-driven deployment**: Environment configs present and valid
- **Trunk-based development**: Main branch protection and merge requirements
- **Secret management**: No hardcoded secrets, proper environment variables
- **Rollback capabilities**: Configuration-driven rollback mechanisms

## 3. Stage Configuration (--stage, --build, --test-stage)

If configuring stages:
!find . -name "*.yml" -o -name "*.yaml" | xargs grep -l "stage\|job\|step" 2>/dev/null | head -5

Configure pipeline stages:
- Define stage dependencies and execution order
- Configure parallel execution for independent stages
- Set up conditional stage execution criteria
- Implement manual approval gates
- Configure stage timeout and retry policies

## 4. Build and Compilation (--build, --compile)

If configuring build:
!find . -name "Dockerfile" -o -name "docker-compose.yml" | head -3
!find . -name "Makefile" -o -name "build.gradle" -o -name "webpack.config.js" | head -3
!ls -la package.json setup.py pyproject.toml 2>/dev/null || echo "No build configuration files"

Configure build automation:
- Set up compilation and build processes
- Configure build caching strategies
- Implement build matrix for multiple variants
- Optimize build performance and parallelization
- Configure artifact packaging and versioning
- Generate Software Bill of Materials (SBOM)

## 5. Testing Integration (--test-stage, --coverage)

If configuring testing:
!find . -name "*test*" -type d | head -5
!find . -name "*.test.js" -o -name "test_*.py" | wc -l

Integrate comprehensive testing:
- Configure unit, integration, and end-to-end tests
- Set up code coverage requirements and reporting
- Implement test parallelization and optimization
- Configure test environment setup and teardown
- Integrate security and performance testing

## 6. Configuration-Driven Deployment (--deploy [environment])

If deploying to environment (--deploy):
!find . -name "*.yml" -o -name "*.yaml" | xargs grep -l "deploy\|release" 2>/dev/null | head -3
!kubectl version --client 2>/dev/null || docker --version 2>/dev/null || echo "No deployment tools detected"

Check deployment prerequisites:
- **All tests passing** (unit, integration, performance)
- **Security scans clean** (SAST, secrets, dependencies)
- **Artifacts generated** and validated
- **Environment configuration** exists and valid
- **Rollback plan** prepared and tested

Configure deployment automation:
- Set up environment-specific deployment configurations
- Implement deployment strategies (blue-green, canary, rolling)
- Configure automated rollback and health checks
- Set up approval workflows and quality gates
- Integrate monitoring and observability

Deployment safety mechanisms:
- **Configuration validation** before deployment
- **Health check verification** using environment config
- **Automated rollback** based on failure thresholds
- **Real-time monitoring** during deployment

## 7. Artifact and Registry Management (--artifact, --registry)

If managing artifacts:
!find . -name "*.tar.gz" -o -name "*.zip" -o -name "*.jar" | head -5 2>/dev/null
!docker images --format "table {{.Repository}}:{{.Tag}}" 2>/dev/null | head -5

Configure artifact management:
- Set up artifact registry integration
- Configure versioning and tagging strategies
- Implement artifact promotion pipelines
- Configure retention policies and cleanup
- Set up artifact security scanning

## 8. Security and Compliance Scanning (--security)

If running security checks:
!echo "=== Security Stage ==="

**Secrets Detection:**
!git secrets --scan 2>/dev/null || trufflehog . --json 2>/dev/null || echo "Install git-secrets or trufflehog for secrets scanning"

**Software Composition Analysis:**
!npm audit --audit-level high 2>/dev/null || pip-audit 2>/dev/null || echo "No dependency vulnerability scanning available"

**Static Application Security Testing (SAST):**
!semgrep --config=auto . 2>/dev/null || bandit -r . 2>/dev/null || echo "Install semgrep or bandit for SAST"

**Infrastructure as Code Security:**
!checkov -d . 2>/dev/null || echo "Install checkov for IaC security scanning"

Security compliance checks:
- Hardcoded secrets and credentials
- Vulnerable dependencies and libraries
- Insecure configurations and permissions
- Container and infrastructure vulnerabilities
- Supply chain security validation

## 9. Pipeline Monitoring and DORA Metrics (--monitor, --status)

If monitoring pipeline:
!echo "=== Pipeline Key Metrics ==="

**Lead Time Measurement:**
!git log --since="30 days ago" --pretty=format:"%h %ad %s" --date=iso | head -20

**Deployment Frequency:**
!git log --since="7 days ago" --pretty=format:"%h %s" | wc -l

**Mean Time Between Failures (MTBF):**
!git log --since="30 days ago" --grep="fix\|bug\|hotfix" --pretty=format:"%h %ad %s" --date=short

**Mean Time to Recovery (MTTR):**
!git log --since="7 days ago" --grep="rollback\|revert" --pretty=format:"%h %ad %s" --date=short

**Build and Pipeline Health:**
- Build success rate (target: > 95%)
- Average build time (target: < 30 minutes)
- Failed build patterns and root causes
- Security scan pass rate
- Test coverage trends

If checking status (--status):
!git log --oneline -5
!git status
Show current branch, last commit, pipeline status, test results, deployment status.

## 10. Pipeline Optimization (--optimize)

If optimizing pipeline:
!du -sh node_modules/ 2>/dev/null || echo "No node_modules found"
!find . -name "*.log" -size +1M 2>/dev/null | head -5

Identify bottlenecks and provide recommendations:
- Long-running test suites
- Large dependency installations
- Inefficient Docker builds
- Missing caching strategies
- Build time reduction strategies
- Resource utilization improvements
- Cost optimization opportunities

## 11. Rollback Operations (--rollback [environment])

If rolling back deployment:
!git log --oneline -10

Execute configuration-driven rollback:
- **Automated rollback triggers** based on health checks
- **Environment-specific rollback** using deployment strategy from config
- **Health check validation** during rollback process
- **Post-rollback validation** and monitoring
- **Incident documentation** and lessons learned

Think step by step about pipeline configuration and provide:

1. **Pipeline Analysis**: Current configuration assessment, platform compatibility, bottleneck identification
2. **Configuration Strategy**: Stage dependency optimization, parallel execution, cache strategy
3. **Implementation Plan**: Platform-specific configuration, security integration, monitoring setup
4. **Optimization Recommendations**: Build time reduction, resource utilization, cost optimization

If no specific operation is provided, perform pipeline health assessment and recommend improvements based on current setup and best practices.
