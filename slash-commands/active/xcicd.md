---
description: Build, test, and deploy with AWS-compliant CI/CD pipelines following reference architecture
tags: [cicd, deployment, automation, pipeline, aws, security, testing]
---

Implement enterprise-grade CI/CD pipelines following AWS Deployment Pipeline Reference Architecture best practices based on $ARGUMENTS.

First, examine the project structure and current pipeline setup:
!ls -la | grep -E "(.github|.gitlab-ci.yml|Jenkinsfile|azure-pipelines.yml|buildspec.yml)"
!find . -name "*.yml" -o -name "*.yaml" | grep -E "(workflow|pipeline|ci|cd)" | head -10
!find . -name "*.json" | grep -E "(package|requirements|pom|Cargo)" | head -5

Analyze current pipeline maturity and compliance with AWS reference architecture:
- Trunk-based development workflow
- Fast feedback loops (< 30 minutes)
- Comprehensive security scanning
- Deployment automation with rollback capabilities

Based on $ARGUMENTS, perform the appropriate CI/CD operation:

## 1. Pipeline Initialization (AWS Reference Architecture Compliant)

If initializing GitHub Actions (--init github):
!mkdir -p .github/workflows
Create AWS-compliant GitHub Actions workflow with stages:
- **Source Stage**: Checkout with role-based access control
- **Pre-commit Validation**: Fast feedback (< 5 minutes)
- **Build Stage**: Compile, unit tests, security scans, SBOM generation
- **Test Stage (Beta)**: Integration tests in isolated environment (< 30 minutes)  
- **Security Stage**: SAST, secrets detection, dependency scanning
- **Gamma Stage**: Pre-production deployment with smoke tests
- **Production Stage**: Blue/green deployment with automated rollback

If initializing GitLab CI (--init gitlab):
Create .gitlab-ci.yml following AWS reference architecture:
- source, build, test-beta, security, gamma, production stages
- Parallel execution where possible for fast feedback

If initializing AWS CodePipeline (--init aws):
!mkdir -p .aws
Create buildspec.yml and pipeline configuration with:
- CodeCommit/GitHub source integration
- CodeBuild for compilation and testing
- CodeDeploy for automated deployment
- CloudWatch monitoring and alerts

## 2. AWS-Compliant Pipeline Validation

If validating pipeline (--validate):
!yamllint .github/workflows/*.yml 2>/dev/null || echo "No GitHub workflows found"
!yamllint .gitlab-ci.yml 2>/dev/null || echo "No GitLab CI config found"
!yamllint buildspec.yml 2>/dev/null || echo "No AWS buildspec found"

Validate AWS reference architecture compliance:
- **YAML syntax and structure**
- **Required stages present**: source, build, test-beta, security, gamma, production
- **Fast feedback**: Build + test stages complete within 30 minutes
- **Security controls**: Secrets detection, SAST, dependency scanning, SBOM
- **Trunk-based development**: Main branch protection and merge requirements
- **Environment variables**: Secure secret management
- **Rollback capabilities**: Automated deployment rollback mechanisms
- **Key metrics tracking**: Lead time, deploy frequency, MTBF, MTTR

## 3. AWS-Compliant Build and Test Operations

If running build (--build):
@package.json
Execute AWS reference architecture build stage:
!echo "=== Build Stage (Target: < 15 minutes) ==="
!time (npm ci && npm run build) 2>/dev/null || time (python -m pip install -r requirements.txt && python -m build) 2>/dev/null || echo "No standard build found"

Generate Software Bill of Materials (SBOM):
!npm sbom 2>/dev/null || cyclonedx-bom -o sbom.json 2>/dev/null || echo "SBOM generation not available"

If running tests (--test):
!echo "=== Test Stage Beta (Target: < 30 minutes total) ==="
!time npm test 2>/dev/null || time python -m pytest --cov --junitxml=test-results.xml 2>/dev/null || echo "No tests found"

Run integration tests in isolated environment:
!npm run test:integration 2>/dev/null || python -m pytest tests/integration/ 2>/dev/null || echo "No integration tests configured"

Performance and load testing:
!npm run test:performance 2>/dev/null || echo "No performance tests configured"

## 4. AWS Reference Architecture Deployment Operations

If deploying to environment (--deploy):
Check AWS-compliant deployment prerequisites:
- **All tests passing** (unit, integration, performance)
- **Security scans clean** (SAST, secrets, dependencies)
- **SBOM generated** and validated
- **Required approvals** received for production
- **Rollback plan** prepared and tested

For **Gamma Stage** (pre-production):
!echo "=== Gamma Deployment (Pre-production) ==="
!echo "Deploying to gamma environment with smoke tests..."
Deploy to isolated pre-production environment
Run smoke tests and basic validation
Prepare for production promotion

For **Production Stage**:
!echo "=== Production Deployment (Blue/Green) ==="
!echo "Deploying to production with blue/green strategy..."
- Execute blue/green deployment
- Run health checks and monitoring validation
- Implement automated rollback triggers
- Track deployment metrics (lead time, success rate)
- Notify stakeholders of deployment status

Deployment safety mechanisms:
- **Circuit breakers** for automatic failure detection
- **Canary releases** for gradual rollout
- **Automated rollback** on failure detection
- **Real-time monitoring** during deployment

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

## 7. AWS Reference Architecture Security and Compliance

If running security checks (--security):
!echo "=== Security Stage (AWS Reference Architecture) ==="

**Secrets Detection:**
!git secrets --scan 2>/dev/null || trufflehog . --json 2>/dev/null || echo "Install git-secrets or trufflehog for secrets scanning"

**Software Composition Analysis:**
!npm audit --audit-level high 2>/dev/null || pip-audit 2>/dev/null || echo "No dependency vulnerability scanning available"

**Static Application Security Testing (SAST):**
!semgrep --config=auto . 2>/dev/null || bandit -r . 2>/dev/null || echo "Install semgrep or bandit for SAST"

**Infrastructure as Code Security:**
!checkov -d . 2>/dev/null || echo "Install checkov for IaC security scanning"

**Digital Signature Verification:**
!cosign verify-blob --signature package.sig package.json 2>/dev/null || echo "Package signing not configured"

**Software Bill of Materials (SBOM) Validation:**
!cyclonedx validate --input-file sbom.json 2>/dev/null || echo "SBOM validation not available"

AWS security compliance checks:
- **Hardcoded secrets and credentials**
- **Vulnerable dependencies and libraries**
- **Insecure configurations and permissions**
- **Missing security headers and controls**
- **Container and infrastructure vulnerabilities**
- **Supply chain security validation**

## 8. AWS Reference Architecture Monitoring and Key Metrics

If monitoring pipeline (--monitor):
!echo "=== AWS Reference Architecture Key Metrics ==="

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

**AWS CloudWatch Integration:**
- Pipeline execution metrics
- Error rate monitoring  
- Performance baseline tracking
- Alert thresholds and notifications

For rollback operations (--rollback):
!git log --oneline -10
Execute AWS-compliant rollback procedures:
- **Automated rollback triggers** based on health checks
- **Blue/green environment switching** for zero-downtime rollback
- **Database migration rollback** coordination
- **Post-rollback validation** and monitoring
- **Incident documentation** and lessons learned

Report comprehensive pipeline health metrics following AWS reference architecture KPIs and suggest data-driven improvements for reliability, security, and performance.