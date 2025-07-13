---
description: Build, test, and deploy with automated CI/CD pipelines
tags: [cicd, deployment, automation, pipeline]
---

Manage CI/CD pipeline operations based on the arguments provided in $ARGUMENTS.

First, examine the project structure to understand the current setup:
!ls -la | grep -E "(.github|.gitlab-ci.yml|Jenkinsfile|azure-pipelines.yml)"
!find . -name "*.yml" -o -name "*.yaml" | grep -E "(workflow|pipeline|ci|cd)" | head -10

Based on $ARGUMENTS, perform the appropriate CI/CD operation:

## 1. Pipeline Initialization

If initializing GitHub Actions (--init github):
!mkdir -p .github/workflows
Create GitHub Actions workflow file with proper stages:
- Checkout code
- Set up environment
- Install dependencies
- Run tests
- Build application
- Deploy (if main branch)

If initializing GitLab CI (--init gitlab):
Create .gitlab-ci.yml with stages: build, test, deploy

## 2. Pipeline Validation

If validating pipeline (--validate):
!yamllint .github/workflows/*.yml 2>/dev/null || echo "No GitHub workflows found"
!yamllint .gitlab-ci.yml 2>/dev/null || echo "No GitLab CI config found"

Validate:
- YAML syntax
- Required stages present
- Security best practices
- Environment variables configured

## 3. Build and Test Operations

If running build (--build):
@package.json
!npm ci && npm run build 2>/dev/null || python -m pip install -r requirements.txt 2>/dev/null || echo "No standard build found"

If running tests (--test):
!npm test 2>/dev/null || python -m pytest 2>/dev/null || echo "No tests found"

## 4. Deployment Operations

If deploying to environment (--deploy):
Check deployment prerequisites:
- Tests passing
- Security scans clean
- Required approvals received

For staging deployment:
!echo "Deploying to staging environment..."

For production deployment:
!echo "Deploying to production environment..."
Include additional safety checks and rollback preparation.

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

## 7. Security and Compliance

If running security checks (--security):
!git secrets --scan 2>/dev/null || echo "git-secrets not installed"
!npm audit --audit-level high 2>/dev/null || echo "No npm security audit available"

Check for:
- Hardcoded secrets
- Vulnerable dependencies
- Insecure configurations
- Missing security headers

## 8. Monitoring and Alerts

If monitoring pipeline (--monitor):
!git log --since="7 days ago" --pretty=format:"%h %s" | wc -l
!git log --since="7 days ago" --grep="failed" --pretty=format:"%h %s"

Track:
- Build success rate
- Average build time
- Failed build patterns
- Deployment frequency

For rollback operations (--rollback):
!git log --oneline -10
Provide safe rollback procedures and verify rollback success.

Report pipeline health metrics and suggest improvements for reliability and performance.