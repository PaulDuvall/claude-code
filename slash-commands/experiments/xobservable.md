---
description: Analyze development patterns, team productivity, and process health through comprehensive observability
tags: [observability, metrics, patterns, productivity, tracing, insights]
---

Analyze development observability and patterns based on the arguments provided in $ARGUMENTS.

First, examine the project for observability indicators:
!find . -name "*.log" -o -name "*.json" | grep -E "(metric|trace|log)" | head -5
!git log --oneline --since="1 month ago" | wc -l
!find . -name "*test*" -type f | wc -l
!git branch -r | wc -l

Based on $ARGUMENTS, perform the appropriate observability analysis:

## 1. Development Metrics Collection

If collecting metrics (--metrics, --dashboard):
!git log --pretty=format:"%h %ad %s" --date=short --since="1 month ago" | head -10
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | xargs wc -l | tail -1
!git log --pretty=format:"%an" --since="1 month ago" | sort | uniq -c | sort -nr

Collect development metrics:
- Commit frequency and patterns
- Code churn and complexity trends
- Team collaboration indicators
- Feature delivery velocity
- Quality metrics evolution

## 2. Pattern Analysis

If analyzing patterns (--patterns, --behavior):
!git log --pretty=format:"%H %s" --since="1 month ago" | grep -i -E "(fix|bug|refactor|feature)" | wc -l
!find . -name "*test*" -type f -exec grep -l "describe\|it\|test" {} \; | wc -l
!git log --pretty=format:"%ad" --date=format:"%H" --since="1 month ago" | sort | uniq -c

Analyze development patterns:
- Code change patterns and hotspots
- Testing behavior and coverage trends
- Work time distribution analysis
- Collaboration and review patterns
- Technical debt accumulation

## 3. Performance Tracing

If tracing operations (--trace, --timing):
!ls -la .git/logs/refs/heads/ 2>/dev/null | head -5
!find . -name "*.log" | xargs grep -i "duration\|time\|performance" 2>/dev/null | head -5
!git log --pretty=format:"%H %ct" --since="1 week ago" | head -10

Trace development operations:
- TDD cycle timing analysis
- Build and test execution times
- Code review duration tracking
- Deployment frequency measurement
- Issue resolution time analysis

## 4. Team Productivity Analysis

If analyzing productivity (--productivity, --team):
!git shortlog -sn --since="1 month ago"
!git log --pretty=format:"%an %ad" --date=short --since="1 month ago" | sort | uniq -c
!find . -name "*.md" -o -name "*.txt" | xargs grep -l "TODO\|FIXME" | wc -l

Analyze team productivity:
- Individual contribution patterns
- Knowledge sharing indicators
- Documentation coverage trends
- Technical debt markers
- Skill development tracking

## 5. Process Health Assessment

If assessing process health (--health, --compliance):
!git log --grep="test" --oneline --since="1 month ago" | wc -l
!find . -name "*.yml" -o -name "*.yaml" | xargs grep -l "test\|ci\|cd" 2>/dev/null | wc -l
!git log --pretty=format:"%s" --since="1 month ago" | grep -E "^(feat|fix|docs|style|refactor|test|chore)" | wc -l

Assess process health:
- TDD adherence measurement
- CI/CD pipeline effectiveness
- Code review compliance
- Security practice adoption
- Documentation completeness

Think step by step about development observability requirements and provide:

1. **Current State Analysis**:
   - Development velocity assessment
   - Quality trend identification
   - Team collaboration patterns
   - Process adherence measurement

2. **Pattern Insights**:
   - Code change hotspot analysis
   - Testing behavior patterns
   - Work distribution insights
   - Productivity bottleneck identification

3. **Optimization Opportunities**:
   - Process improvement recommendations
   - Tool adoption suggestions
   - Team efficiency enhancements
   - Quality improvement strategies

4. **Monitoring Recommendations**:
   - Key metrics to track continuously
   - Alert threshold configurations
   - Dashboard setup guidance
   - Trend analysis automation

Generate comprehensive observability analysis with actionable insights, pattern identification, productivity recommendations, and monitoring setup guidance.

If no specific operation is provided, perform development health assessment and recommend observability improvements based on current patterns and industry best practices.