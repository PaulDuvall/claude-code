---
description: Build, test, and deploy with platform-agnostic CI/CD pipelines using configuration-driven deployment
tags: [cicd, deployment, automation, pipeline, security, testing, configuration]
---

Implement enterprise-grade CI/CD pipelines with configuration-driven deployment that works across platforms based on $ARGUMENTS.

First, examine the project structure and current pipeline setup:
!ls -la | grep -E "(.github|.gitlab-ci.yml|Jenkinsfile|azure-pipelines.yml|buildspec.yml)"
!find . -name "*.yml" -o -name "*.yaml" | grep -E "(workflow|pipeline|ci|cd)" | head -10
!find . -name "*.json" | grep -E "(package|requirements|pom|Cargo)" | head -5

Analyze current pipeline maturity and best practices compliance:
- Trunk-based development workflow
- Fast feedback loops (< 30 minutes)
- Comprehensive security scanning
- Configuration-driven deployment automation
- Platform-agnostic rollback capabilities

Based on $ARGUMENTS, perform the appropriate CI/CD operation:

## 1. Pipeline Initialization (Platform-Agnostic)

If initializing GitHub Actions (--init github):
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

## 2. Pipeline Configuration and Validation

If validating pipeline (--validate):
!yamllint .github/workflows/*.yml 2>/dev/null || echo "No GitHub workflows found"
!yamllint .gitlab-ci.yml 2>/dev/null || echo "No GitLab CI config found" 
!find config/environments -name "*.json" -exec jq . {} \; 2>/dev/null || echo "No environment configs found"

Validate pipeline best practices compliance:
- **YAML/JSON syntax and structure**
- **Required stages present**: source, build, test, security, deploy
- **Fast feedback**: Build + test stages complete within 30 minutes
- **Security controls**: Secrets detection, SAST, dependency scanning
- **Configuration-driven deployment**: Environment configs present and valid
- **Trunk-based development**: Main branch protection and merge requirements
- **Secret management**: No hardcoded secrets, proper environment variables
- **Rollback capabilities**: Configuration-driven rollback mechanisms
- **Key metrics tracking**: Lead time, deploy frequency, MTBF, MTTR

Create environment configuration template if missing:
!cat > config/environments/template.json << 'EOF'
{
  "environment": "template",
  "deploy": {
    "target": "platform-specific-target",
    "strategy": "rolling|blue-green|canary",
    "health_check_url": "/health",
    "timeout_minutes": 10,
    "rollback": {
      "auto_rollback": true,
      "failure_threshold": 0.1
    }
  },
  "secrets": {
    "required": ["API_KEY", "DATABASE_URL"],
    "optional": ["MONITORING_TOKEN"]
  },
  "resources": {
    "cpu": "1000m",
    "memory": "512Mi",
    "replicas": 2
  }
}
EOF

## 3. Build and Test Operations

If running build (--build):
@package.json
Execute build stage with artifact generation:
!echo "=== Build Stage (Target: < 15 minutes) ==="
!time (npm ci && npm run build) 2>/dev/null || time (python -m pip install -r requirements.txt && python -m build) 2>/dev/null || echo "No standard build found"

Generate Software Bill of Materials (SBOM):
!npm sbom 2>/dev/null || cyclonedx-bom -o sbom.json 2>/dev/null || echo "SBOM generation not available"

Package build artifacts:
!mkdir -p artifacts
!tar -czf artifacts/build-$(date +%Y%m%d-%H%M%S).tar.gz dist/ build/ 2>/dev/null || echo "No build artifacts to package"

If running tests (--test):
!echo "=== Test Stage (Target: < 30 minutes total) ==="
!time npm test 2>/dev/null || time python -m pytest --cov --junitxml=test-results.xml 2>/dev/null || echo "No tests found"

Run integration tests:
!npm run test:integration 2>/dev/null || python -m pytest tests/integration/ 2>/dev/null || echo "No integration tests configured"

Performance and load testing:
!npm run test:performance 2>/dev/null || echo "No performance tests configured"

Generate test reports:
!mkdir -p reports
!cp test-results.xml reports/ 2>/dev/null || echo "No test results to copy"

## 4. Configuration-Driven Deployment Operations

If deploying to environment (--deploy [environment]):
Create unified deployment script if missing:
!cat > scripts/deploy.sh << 'EOF'
#!/bin/bash
set -euo pipefail

ENVIRONMENT=${1:-staging}
CONFIG_FILE="config/environments/${ENVIRONMENT}.json"

if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "Error: Environment config not found: $CONFIG_FILE"
    exit 1
fi

# Load configuration
DEPLOY_TARGET=$(jq -r '.deploy.target' "$CONFIG_FILE")
DEPLOY_STRATEGY=$(jq -r '.deploy.strategy' "$CONFIG_FILE")
HEALTH_CHECK_URL=$(jq -r '.deploy.health_check_url' "$CONFIG_FILE")
TIMEOUT=$(jq -r '.deploy.timeout_minutes' "$CONFIG_FILE")

echo "=== Deploying to $ENVIRONMENT ==="
echo "Target: $DEPLOY_TARGET"
echo "Strategy: $DEPLOY_STRATEGY" 

# Platform-agnostic deployment logic
case "$DEPLOY_STRATEGY" in
    "rolling")
        echo "Executing rolling deployment..."
        ;;
    "blue-green")
        echo "Executing blue/green deployment..."
        ;;
    "canary")
        echo "Executing canary deployment..."
        ;;
esac

# Health check validation
if [[ "$HEALTH_CHECK_URL" != "null" ]]; then
    echo "Running health checks on $HEALTH_CHECK_URL"
fi

echo "✅ Deployment to $ENVIRONMENT completed"
EOF

!chmod +x scripts/deploy.sh

Check deployment prerequisites:
- **All tests passing** (unit, integration, performance)
- **Security scans clean** (SAST, secrets, dependencies)
- **Artifacts generated** and validated
- **Environment configuration** exists and valid
- **Rollback plan** prepared and tested

Execute configuration-driven deployment:
!scripts/deploy.sh ${TARGET_ENV:-staging}

Deployment safety mechanisms:
- **Configuration validation** before deployment
- **Health check verification** using environment config
- **Automated rollback** based on failure thresholds
- **Real-time monitoring** during deployment
- **Environment-specific** rollback procedures

## 5. Status and Monitoring

If checking status (--status):
!git log --oneline -5
!git status

Show:
- Current branch
- Last commit
- Pipeline status
- Test results
- Deployment status

Think step by step about CI/CD best practices and provide recommendations for:
- Pipeline optimization
- Security improvements
- Testing strategies
- Deployment safety

If no specific operation is provided, analyze current CI/CD setup and suggest improvements.

## 6. Pipeline Optimization

If optimizing pipeline (--optimize):
Analyze current pipeline performance:
!du -sh node_modules/ 2>/dev/null || echo "No node_modules found"
!find . -name "*.log" -size +1M 2>/dev/null | head -5

Identify bottlenecks:
- Long-running test suites
- Large dependency installations
- Inefficient Docker builds
- Missing caching strategies

Provide specific optimization recommendations.

## 7. Security and Compliance Scanning

If running security checks (--security):
!echo "=== Security Stage ==="

**Secrets Detection:**
!git secrets --scan 2>/dev/null || trufflehog . --json 2>/dev/null || echo "Install git-secrets or trufflehog for secrets scanning"

**Software Composition Analysis:**
!npm audit --audit-level high 2>/dev/null || pip-audit 2>/dev/null || echo "No dependency vulnerability scanning available"

**Static Application Security Testing (SAST):**
!semgrep --config=auto . 2>/dev/null || bandit -r . 2>/dev/null || echo "Install semgrep or bandit for SAST"

**Infrastructure as Code Security:**
!checkov -d . 2>/dev/null || echo "Install checkov for IaC security scanning"

**Configuration Security Validation:**
!find config/environments -name "*.json" -exec grep -l "password\|secret\|key" {} \; | head -5
!echo "Checking for hardcoded secrets in configuration files..."

**Software Bill of Materials (SBOM) Validation:**
!cyclonedx validate --input-file sbom.json 2>/dev/null || echo "SBOM validation not available"

Security compliance checks:
- **Hardcoded secrets and credentials**
- **Vulnerable dependencies and libraries** 
- **Insecure configurations and permissions**
- **Missing security headers and controls**
- **Container and infrastructure vulnerabilities**
- **Configuration file security validation**
- **Supply chain security validation**

## 8. Pipeline Monitoring and Key Metrics

If monitoring pipeline (--monitor):
!echo "=== Pipeline Key Metrics ==="

**Lead Time Measurement:**
!git log --since="30 days ago" --pretty=format:"%h %ad %s" --date=iso | head -20

**Deployment Frequency:**
!git log --since="7 days ago" --pretty=format:"%h %s" | wc -l
!git log --since="7 days ago" --grep="deploy" --pretty=format:"%h %ad %s" --date=short

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
- Configuration drift detection

**Configuration Health:**
!find config/environments -name "*.json" -exec echo "Validating: {}" \; -exec jq . {} \; 2>/dev/null || echo "No environment configs to validate"

For rollback operations (--rollback [environment]):
!git log --oneline -10
Create configuration-driven rollback script:
!cat > scripts/rollback.sh << 'EOF'
#!/bin/bash
set -euo pipefail

ENVIRONMENT=${1:-staging}
CONFIG_FILE="config/environments/${ENVIRONMENT}.json"

if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "Error: Environment config not found: $CONFIG_FILE"
    exit 1
fi

# Load rollback configuration
AUTO_ROLLBACK=$(jq -r '.deploy.rollback.auto_rollback' "$CONFIG_FILE")
FAILURE_THRESHOLD=$(jq -r '.deploy.rollback.failure_threshold' "$CONFIG_FILE")

echo "=== Rolling back $ENVIRONMENT ==="
echo "Auto-rollback enabled: $AUTO_ROLLBACK"
echo "Failure threshold: $FAILURE_THRESHOLD"

# Execute rollback based on deployment strategy
DEPLOY_STRATEGY=$(jq -r '.deploy.strategy' "$CONFIG_FILE")
case "$DEPLOY_STRATEGY" in
    "blue-green")
        echo "Executing blue/green rollback..."
        ;;
    "rolling")
        echo "Executing rolling rollback..."
        ;;
    "canary")
        echo "Executing canary rollback..."
        ;;
esac

echo "✅ Rollback to $ENVIRONMENT completed"
EOF

!chmod +x scripts/rollback.sh

Execute configuration-driven rollback procedures:
- **Automated rollback triggers** based on health checks and configuration
- **Environment-specific rollback** using deployment strategy from config
- **Health check validation** during rollback process
- **Post-rollback validation** and monitoring
- **Incident documentation** and lessons learned

Report comprehensive pipeline health metrics and suggest data-driven improvements for reliability, security, and performance.