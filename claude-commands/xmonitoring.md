---
description: Monitor development process health, performance metrics, and team productivity with comprehensive observability
tags: [monitoring, observability, metrics, performance, productivity, analytics, dashboards]
---

Monitor development processes and team performance based on the arguments provided in $ARGUMENTS.

First, examine the current monitoring environment and available data sources:
!ps aux | grep -E "(monitor|metric|log)" | head -5
!find . -name "*.log" | head -5 2>/dev/null || echo "No log files found"
!git log --since="7 days ago" --pretty=format:"%ad" --date=short | sort | uniq -c 2>/dev/null || echo "No git activity"

Based on $ARGUMENTS, perform the appropriate monitoring operation:

## 1. Process Health Monitoring

If monitoring process health (--health, --status):
!git log --since="24 hours ago" --oneline | wc -l 2>/dev/null || echo "0"
!find . -name "*test*" -name "*.py" -o -name "*.js" | wc -l
!python -m pytest --tb=short --collect-only 2>/dev/null | grep "test" | wc -l || echo "0"

Monitor development process health:
- Code commit frequency and patterns
- Test execution status and coverage
- Build success rates and duration
- Code quality metrics and trends
- Compliance and governance indicators

## 2. Performance and Build Monitoring

If monitoring performance (--performance, --build-times):
!find . -name "*.log" -exec grep -l "build\|test\|deploy" {} \; 2>/dev/null | head -5
!tail -20 .github/workflows/*.log 2>/dev/null || echo "No CI/CD logs found"
!ps aux | grep -E "(build|test|deploy)" | head -3

Track performance metrics:
- Build and deployment duration trends
- Test execution time analysis
- CI/CD pipeline performance
- Resource utilization monitoring
- Bottleneck identification and analysis

## 3. Team Productivity Analytics

If monitoring productivity (--productivity, --velocity):
!git shortlog -sn --since="30 days ago" 2>/dev/null || echo "No contributor data"
!git log --since="30 days ago" --pretty=format:"%ad" --date=short | sort | uniq -c
!find . -name "*.py" -o -name "*.js" -exec wc -l {} \; | awk '{sum+=$1} END {print "Total lines:", sum}'

Analyze team productivity:
- Development velocity and throughput
- Feature delivery lead times
- Individual and team contribution patterns
- Work distribution and collaboration metrics
- Sprint and milestone completion rates

## 4. Quality and Technical Debt Monitoring

If monitoring quality (--quality, --technical-debt):
!python -m pytest --cov=. --cov-report=term-missing 2>/dev/null | grep "TOTAL" || echo "No coverage data"
!grep -r "TODO\|FIXME\|HACK" . --include="*.py" --include="*.js" | wc -l 2>/dev/null || echo "0"
!ruff check . --statistics 2>/dev/null || echo "No linting data"

Monitor code quality indicators:
- Test coverage trends and gaps
- Technical debt accumulation
- Code complexity and maintainability
- Linting and style violations
- Security vulnerability tracking

## 5. Alert and Notification Management

If managing alerts (--alerts, --notifications):
!find . -name "*alert*" -o -name "*notification*" | head -3 2>/dev/null
!tail -10 /var/log/system.log 2>/dev/null || echo "No system logs accessible"
!ps aux | grep -E "(alert|notify)" | head -3

Configure monitoring alerts:
- Threshold-based alerts for key metrics
- Anomaly detection and early warnings
- Escalation procedures and routing
- Notification channel configuration
- Alert fatigue prevention strategies

## 6. Dashboard and Reporting

If generating reports (--dashboard, --reports):
!find . -name "*.html" -o -name "*.json" | grep -E "(report|dashboard)" | head -3 2>/dev/null
!ls -la coverage.xml junit.xml test-results.xml 2>/dev/null || echo "No test reports found"
!date

Generate monitoring reports:
- Real-time dashboard visualizations
- Historical trend analysis
- Performance benchmark comparisons
- Team productivity summaries
- Executive summary reports

Think step by step about monitoring requirements and provide:

1. **Current State Assessment**:
   - Development process health indicators
   - Performance metrics and trends
   - Team productivity patterns
   - Quality and technical debt levels

2. **Monitoring Strategy**:
   - Key metrics identification and prioritization
   - Data collection and aggregation methods
   - Alert thresholds and escalation procedures
   - Dashboard design and visualization

3. **Observability Implementation**:
   - Real-time monitoring setup
   - Historical data analysis capabilities
   - Anomaly detection configuration
   - Integration with existing tools

4. **Reporting and Insights**:
   - Automated report generation
   - Trend analysis and forecasting
   - Actionable insights extraction
   - Stakeholder communication

Generate comprehensive monitoring solution with real-time observability, automated alerting, trend analysis, and actionable insights for development process optimization.

If no specific operation is provided, analyze current monitoring capabilities and recommend improvements for enhanced development process visibility.

