---
description: Comprehensive release management with planning, coordination, deployment automation, and monitoring
tags: [release, deployment, planning, coordination, automation, monitoring, rollback]
---

Manage comprehensive release operations based on the arguments provided in $ARGUMENTS.

## Usage Examples

**Basic release analysis:**
```
/xrelease
```

**Plan release:**
```
/xrelease --plan
```

**Deploy release:**
```
/xrelease --deploy
```

**Help and options:**
```
/xrelease --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

First, examine the project release environment and status:
!git tag --sort=-version:refname | head -10 2>/dev/null || echo "No git tags found"
!git log --oneline -10 2>/dev/null || echo "No git repository found"
!find . -name "CHANGELOG*" -o -name "RELEASE*" | head -3
!ls -la package.json setup.py pyproject.toml 2>/dev/null || echo "No version files found"

Based on $ARGUMENTS, perform the appropriate release operation:

## 1. Release Planning and Preparation

If planning release (--plan):
!git log --since="$(git describe --tags --abbrev=0 2>/dev/null)..HEAD" --oneline | wc -l 2>/dev/null || echo "No previous releases"
!find . -name "*.md" | xargs grep -l "BREAKING" | head -3 2>/dev/null || echo "No breaking changes documented"
!git diff --name-only HEAD~10..HEAD | head -10 2>/dev/null

Create comprehensive release plan:
- Analyze changes since last release
- Identify breaking changes and dependencies
- Assess release readiness criteria
- Generate release timeline and milestones
- Coordinate stakeholder approvals

## 2. Release Notes and Documentation

If generating release notes (--notes):
!git log --since="$(git describe --tags --abbrev=0 2>/dev/null)" --pretty=format:"%h %s" 2>/dev/null | head -20
!find . -name "CHANGELOG*" | head -1
!git log --grep="feat\|fix\|BREAKING" --oneline --since="$(git describe --tags --abbrev=0 2>/dev/null)" 2>/dev/null | head -10

Generate release documentation:
- Extract commit messages and categorize changes
- Identify features, fixes, and breaking changes
- Create formatted changelog entries
- Generate migration guides for breaking changes
- Prepare stakeholder communications

## 3. Deployment and Delivery

If deploying release (--deploy):
!docker --version 2>/dev/null || echo "Docker not available"
!kubectl version --client 2>/dev/null || echo "Kubernetes not available"
!find . -name "Dockerfile" -o -name "docker-compose.yml" | head -3

Execute release deployment:
- Validate deployment environment
- Execute deployment strategy (blue-green, canary, rolling)
- Monitor deployment progress and health
- Coordinate feature flag rollouts
- Validate deployment success criteria

## 4. Rollback and Recovery

If executing rollback (--rollback):
!git tag --sort=-version:refname | head -5
!docker images --format "table {{.Repository}}:{{.Tag}}" 2>/dev/null | head -5
!kubectl get deployments 2>/dev/null || echo "No Kubernetes deployments"

Execute rollback procedures:
- Identify target rollback version
- Validate rollback compatibility
- Execute rollback deployment
- Verify system stability post-rollback
- Document rollback reasons and lessons

## 5. Quality Gates and Validation

If validating release (--validate, --gate):
!python -m pytest --tb=short 2>/dev/null || npm test 2>/dev/null || echo "No tests configured"
!find . -name "*security*" -o -name "*audit*" | head -3
!git log --grep="security\|vulnerability" --oneline | head -5

Validate release quality:
- Execute comprehensive test suites
- Run security scans and audits
- Check compliance requirements
- Validate performance benchmarks
- Ensure documentation completeness

Think step by step about release management requirements and provide:

1. **Release Planning Assessment**:
   - Current release readiness status
   - Change analysis and impact assessment
   - Dependency validation and coordination
   - Risk evaluation and mitigation strategies

2. **Documentation and Communication**:
   - Release notes generation from commits
   - Breaking change identification and documentation
   - Stakeholder communication planning
   - Migration guide preparation

3. **Deployment Strategy**:
   - Deployment method selection and validation
   - Environment readiness verification
   - Rollback plan preparation
   - Monitoring and health check configuration

4. **Quality Assurance**:
   - Quality gate validation
   - Security and compliance verification
   - Performance benchmark validation
   - Post-release monitoring setup

Generate comprehensive release management with automated planning, coordinated deployment, quality validation, and monitoring integration.

If no specific operation is provided, analyze current release status and recommend next steps based on project state and release readiness criteria.

