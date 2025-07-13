---
description: Advanced CI/CD pipeline configuration, build automation, deployment orchestration, and optimization
tags: [pipeline, cicd, automation, deployment, orchestration, optimization, artifacts]
---

Configure and manage CI/CD pipelines based on the arguments provided in $ARGUMENTS.

First, examine the current pipeline configuration and environment:
!find . -name "*.yml" -o -name "*.yaml" | grep -E "(pipeline|workflow|ci|cd)" | head -10
!ls -la .github/workflows/ .gitlab-ci.yml Jenkinsfile azure-pipelines.yml 2>/dev/null || echo "No CI/CD configurations found"
!git branch --show-current 2>/dev/null || echo "No git repository"

Based on $ARGUMENTS, perform the appropriate pipeline operation:

## 1. Pipeline Initialization and Setup

If initializing pipeline (--init):
!find . -name "package.json" -o -name "requirements.txt" -o -name "pom.xml" -o -name "go.mod" | head -3
!which docker 2>/dev/null || echo "Docker not available"
!git remote -v 2>/dev/null || echo "No git remotes configured"

Initialize CI/CD pipeline configuration:
- Detect project type and language
- Generate platform-specific pipeline configuration
- Configure basic build, test, and deploy stages
- Set up environment variables and secrets
- Configure artifact management and caching

## 2. Stage Configuration and Management

If configuring stages (--stage, --build, --test-stage):
!find . -name "*.yml" -o -name "*.yaml" | xargs grep -l "stage\|job\|step" 2>/dev/null | head -5
!python -c "import pytest; print('pytest available')" 2>/dev/null || npm test --version 2>/dev/null || echo "No test framework detected"

Configure pipeline stages:
- Define stage dependencies and execution order
- Configure parallel execution for independent stages
- Set up conditional stage execution criteria
- Implement manual approval gates
- Configure stage timeout and retry policies

## 3. Build and Compilation Configuration

If configuring build (--build, --compile):
!find . -name "Dockerfile" -o -name "docker-compose.yml" | head -3
!find . -name "Makefile" -o -name "build.gradle" -o -name "webpack.config.js" | head -3
!ls -la package.json setup.py pyproject.toml 2>/dev/null || echo "No build configuration files"

Configure build automation:
- Set up compilation and build processes
- Configure build caching strategies
- Implement build matrix for multiple variants
- Optimize build performance and parallelization
- Configure artifact packaging and versioning

## 4. Testing Pipeline Integration

If configuring testing (--test-stage, --coverage):
!find . -name "*test*" -type d | head -5
!find . -name "*.test.js" -o -name "test_*.py" | wc -l
!python -m pytest --collect-only 2>/dev/null | grep "test" | wc -l || echo "0"

Integrate comprehensive testing:
- Configure unit, integration, and end-to-end tests
- Set up code coverage requirements and reporting
- Implement test parallelization and optimization
- Configure test environment setup and teardown
- Integrate security and performance testing

## 5. Deployment and Orchestration

If configuring deployment (--deploy-stage, --strategy):
!find . -name "*.yml" -o -name "*.yaml" | xargs grep -l "deploy\|release" 2>/dev/null | head -3
!kubectl version --client 2>/dev/null || docker --version 2>/dev/null || echo "No deployment tools detected"

Configure deployment automation:
- Set up environment-specific deployment configurations
- Implement deployment strategies (blue-green, canary, rolling)
- Configure automated rollback and health checks
- Set up approval workflows and quality gates
- Integrate monitoring and observability

## 6. Artifact and Registry Management

If managing artifacts (--artifact, --registry):
!find . -name "*.tar.gz" -o -name "*.zip" -o -name "*.jar" | head -5 2>/dev/null
!docker images --format "table {{.Repository}}:{{.Tag}}" 2>/dev/null | head -5
!npm whoami 2>/dev/null || echo "Not logged into npm registry"

Configure artifact management:
- Set up artifact registry integration
- Configure versioning and tagging strategies
- Implement artifact promotion pipelines
- Configure retention policies and cleanup
- Set up artifact security scanning

Think step by step about pipeline configuration and optimization requirements and provide:

1. **Pipeline Analysis**:
   - Current pipeline configuration assessment
   - Platform compatibility evaluation
   - Performance bottleneck identification
   - Security vulnerability scanning

2. **Configuration Strategy**:
   - Stage dependency optimization
   - Parallel execution opportunities
   - Resource allocation improvements
   - Cache strategy implementation

3. **Implementation Plan**:
   - Platform-specific configuration generation
   - Security integration requirements
   - Monitoring and observability setup
   - Quality gate configuration

4. **Optimization Recommendations**:
   - Build time reduction strategies
   - Resource utilization improvements
   - Cost optimization opportunities
   - Performance monitoring setup

Generate comprehensive pipeline configuration with platform-specific optimizations, security integrations, monitoring setup, and performance recommendations.

If no specific operation is provided, perform pipeline health assessment and recommend configuration improvements based on current setup and best practices.