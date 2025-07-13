---
description: Comprehensive evaluation and assessment tools for code quality and project health
tags: [evaluation, assessment, quality, metrics, analysis]
---

Perform comprehensive evaluation and assessment based on the arguments provided in $ARGUMENTS.

First, examine the project structure and available metrics:
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | head -15
!ls -la | grep -E "(test|spec|coverage|metrics)"
!git log --oneline -10 2>/dev/null || echo "No git repository found"

Based on $ARGUMENTS, perform the appropriate evaluation:

## 1. Code Quality Assessment

If evaluating quality (--quality):
!python -m flake8 . --count 2>/dev/null || echo "No Python linting available"
!eslint . --format compact 2>/dev/null || echo "No JavaScript linting available"
!find . -name "*.py" -exec wc -l {} \; | awk '{sum+=$1} END {print "Total Python lines:", sum}'

Analyze code quality metrics:
- Code complexity and maintainability
- Test coverage percentage
- Linting and style violations
- Documentation coverage
- Technical debt indicators

## 2. Project Health Evaluation

If evaluating project health (--project):
!git log --since="30 days ago" --pretty=format:"%h %s" | wc -l
!git log --since="30 days ago" --pretty=format:"%an" | sort | uniq -c | sort -nr
!find . -name "TODO" -o -name "FIXME" | xargs grep -i "todo\|fixme" | wc -l 2>/dev/null || echo "0"

Assess project health indicators:
- Development velocity and commit frequency
- Issue resolution rate
- Technical debt accumulation
- Team collaboration patterns
- Release readiness

## 3. Team Performance Assessment

If evaluating team performance (--team):
!git shortlog -sn --since="30 days ago" 2>/dev/null || echo "No git history available"
!git log --since="7 days ago" --pretty=format:"%ad" --date=short | sort | uniq -c

Evaluate team metrics:
- Individual and team velocity
- Code review participation
- Knowledge sharing patterns
- Skill development indicators
- Collaboration effectiveness

## 4. Process Effectiveness Analysis

If evaluating process (--process):
!find . -name "*.yml" -o -name "*.yaml" | grep -E "(ci|pipeline|workflow)" | head -5
!ls -la .github/workflows/ 2>/dev/null || echo "No GitHub workflows found"
!find . -name "*test*" | wc -l

Analyze development processes:
- CI/CD pipeline effectiveness
- Testing process maturity
- Code review process efficiency
- Release management effectiveness
- Incident response capabilities

## 5. Comprehensive Reporting

If generating reports (--report):
!date
!uptime
!df -h . | tail -1

Generate evaluation metrics:
- Overall project health score
- Quality trend analysis
- Risk assessment summary
- Improvement recommendations
- Benchmarking against industry standards

Think step by step about the evaluation results and provide:

1. **Current Status Assessment**:
   - Overall health score (0-100)
   - Key strengths identified
   - Critical areas for improvement
   - Risk factors and mitigation strategies

2. **Trend Analysis**:
   - Performance trends over time
   - Quality trajectory
   - Team productivity patterns
   - Process improvement opportunities

3. **Actionable Recommendations**:
   - Prioritized improvement actions
   - Resource allocation suggestions
   - Timeline for improvements
   - Success metrics and KPIs

4. **Benchmarking Results**:
   - Industry standard comparisons
   - Best practice alignment
   - Competitive positioning
   - Excellence opportunities

Generate comprehensive evaluation report with specific, actionable insights and improvement roadmap.

