---
description: Advanced metrics collection and analysis for development process optimization and SpecDriven AI insights
tags: [metrics, analytics, performance, quality, velocity, coverage]
---

Collect and analyze development metrics based on the arguments provided in $ARGUMENTS.

First, examine the project for metrics and monitoring setup:
!find . -name "*.json" -o -name "*.yml" -o -name "*.yaml" | grep -E "(metric|monitor|analytics)" | head -5
!ls -la package.json requirements.txt pyproject.toml 2>/dev/null | head -3
!ps aux | grep -E "(prometheus|grafana|analytics)" | grep -v grep
!git log --oneline --since="1 month ago" | wc -l

Based on $ARGUMENTS, perform the appropriate metrics operation:

## 1. Dashboard and Overview Metrics

If viewing dashboard (--dashboard, --overview):
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | wc -l
!find . -name "*test*" -type f | wc -l
!git log --pretty=format:"%h %an %ad" --date=short --since="1 month ago" | wc -l
!git shortlog -sn --since="1 month ago" | head -5

Generate comprehensive metrics dashboard:
- Development velocity and productivity
- Code quality and coverage trends
- Team collaboration patterns
- Deployment and delivery metrics
- Technical debt and risk indicators

## 2. Coverage Analysis

If analyzing coverage (--coverage, --dual-coverage):
!python -m pytest --cov=. --cov-report=term 2>/dev/null || npm test -- --coverage 2>/dev/null || echo "No coverage tools available"
!find . -name "*spec*" -o -name "*requirement*" | wc -l
!grep -r "{#.*authority=" . --include="*.md" --include="*.py" | wc -l

Analyze coverage metrics:
- Traditional code coverage (line, branch, function)
- Specification coverage tracking
- Authority-level coverage analysis
- Traceability coverage assessment
- Coverage gap identification

## 3. Velocity and Productivity Metrics

If analyzing velocity (--velocity, --productivity, --team):
!git log --pretty=format:"%h %s %an %ad" --date=short --since="1 month ago" | head -20
!git log --pretty=format:"%an" --since="1 month ago" | sort | uniq -c | sort -nr
!git log --oneline --since="1 week ago" | wc -l
!git branch -r | wc -l

Measure team productivity:
- Commit frequency and patterns
- Pull request velocity
- Feature delivery rate
- Sprint burndown analysis
- Individual contributor metrics

## 4. Quality Metrics

If analyzing quality (--quality, --debt, --complexity):
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | xargs wc -l | tail -1
!grep -r "TODO\|FIXME\|HACK" . --include="*.py" --include="*.js" --include="*.ts" | wc -l
!python -m pylint **/*.py --output-format=json 2>/dev/null | head -10 || echo "Pylint not available"
!find . -name "*test*" -type f | wc -l

Analyze code quality:
- Cyclomatic complexity trends
- Technical debt accumulation
- Bug density measurements
- Code duplication analysis
- Maintainability index

## 5. Performance and DORA Metrics

If analyzing performance (--performance, --dora, --lead-time):
!git log --pretty=format:"%h %ad %s" --date=short --since="1 month ago" | grep -E "(deploy|release|fix)" | wc -l
!find . -name "*.yml" -o -name "*.yaml" | xargs grep -l "deploy\|ci\|cd" | head -5 2>/dev/null
!uptime
!ps aux | head -5

Measure performance metrics:
- Deployment frequency
- Lead time for changes
- Mean time to recovery (MTTR)
- Change failure rate
- System performance indicators

Think step by step about metrics requirements and provide:

1. **Current State Analysis**:
   - Existing metrics collection setup
   - Available data sources and quality
   - Team velocity and productivity baseline
   - Quality and coverage current state

2. **Metrics Strategy**:
   - Key performance indicators definition
   - DORA metrics implementation
   - SpecDriven AI compliance tracking
   - Team and individual metrics framework

3. **Implementation Plan**:
   - Metrics collection automation
   - Dashboard and visualization setup
   - Alert and threshold configuration
   - Reporting and analysis framework

4. **Insights and Actions**:
   - Performance trend analysis
   - Improvement opportunity identification
   - Predictive analytics and forecasting
   - Actionable recommendations

Generate comprehensive metrics analysis with dashboard insights, trend analysis, performance indicators, and improvement recommendations.

If no specific operation is provided, perform metrics readiness assessment and recommend metrics implementation strategy based on current development setup and industry best practices.