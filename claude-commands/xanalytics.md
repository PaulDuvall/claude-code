---
description: Comprehensive business metrics tracking, user behavior analysis, and performance analytics for data-driven decisions
tags: [analytics, metrics, business, performance, reporting, insights]
---

Analyze business metrics and performance data based on the arguments provided in $ARGUMENTS.

First, examine the project for analytics setup:
!find . -name "*.json" -o -name "*.yml" -o -name "*.yaml" | grep -E "(analytics|metrics|config)" | head -5
!ls -la package.json requirements.txt 2>/dev/null | head -2
!ps aux | grep -E "(analytics|prometheus|grafana)" | grep -v grep

Based on $ARGUMENTS, perform the appropriate analytics operation:

## 1. Business Metrics Analysis

If analyzing business metrics (--business, --revenue, --conversion):
!find . -name "*.sql" -o -name "*analytics*" | head -5 2>/dev/null
!grep -r "revenue\|conversion\|funnel" . --include="*.py" --include="*.js" | head -5 2>/dev/null
!python -c "import pandas; print('Analytics libraries available')" 2>/dev/null || echo "Install analytics dependencies"

Analyze business performance:
- Revenue trends and forecasting
- Conversion funnel optimization
- Customer retention analysis
- Churn prediction modeling
- ROI and profitability metrics

## 2. User Behavior Analytics

If analyzing user behavior (--users, --journeys, --segments):
!find . -name "*event*" -o -name "*tracking*" | head -5 2>/dev/null
!grep -r "user_id\|session\|event" . --include="*.py" --include="*.js" | head -5 2>/dev/null
!curl -s http://localhost:3000/health 2>/dev/null || echo "Application not running locally"

Analyze user patterns:
- User journey mapping and optimization
- Behavioral segmentation analysis
- Engagement and retention metrics
- A/B test result analysis
- User acquisition channel performance

## 3. Performance Analytics

If analyzing performance (--performance, --latency, --throughput):
!find . -name "*log*" -o -name "*metrics*" | head -5 2>/dev/null
!netstat -tuln 2>/dev/null | grep -E "(9090|3000|8080)" || echo "No monitoring ports detected"
!docker ps | grep -E "(prometheus|grafana)" || echo "No monitoring containers running"

Analyze system performance:
- Response time and latency analysis
- Throughput and capacity planning
- Error rate and pattern detection
- Resource utilization optimization
- SLA compliance monitoring

## 4. Custom Analytics Implementation

If implementing custom analytics (--custom, --dashboard, --alerts):
!find . -name "*dashboard*" -o -name "*alert*" | head -5 2>/dev/null
!python -c "import matplotlib, seaborn; print('Visualization libraries available')" 2>/dev/null || echo "Install visualization dependencies"
!ls -la config/ analytics/ dashboards/ 2>/dev/null || echo "No analytics configuration found"

Implement custom solutions:
- Custom metric definition and tracking
- Interactive dashboard creation
- Alert threshold configuration
- Data pipeline automation
- Real-time monitoring setup

## 5. Predictive Analytics

If running predictive analytics (--predictions, --forecast, --anomaly):
!python -c "import sklearn, numpy; print('ML libraries available')" 2>/dev/null || echo "Install ML dependencies: pip install scikit-learn numpy"
!find . -name "*model*" -o -name "*predict*" | head -5 2>/dev/null
!ls -la data/ models/ predictions/ 2>/dev/null || echo "No ML artifacts found"

Perform predictive analysis:
- Machine learning model training
- Forecasting and trend prediction
- Anomaly detection implementation
- Seasonal pattern analysis
- Risk assessment modeling

Think step by step about analytics requirements and provide:

1. **Data Assessment**:
   - Available data sources identification
   - Data quality and completeness evaluation
   - Integration requirements analysis
   - Privacy and compliance considerations

2. **Analytics Strategy**:
   - Key performance indicators definition
   - Measurement framework design
   - Dashboard and reporting requirements
   - Alert and notification setup

3. **Implementation Plan**:
   - Data pipeline architecture
   - Visualization and dashboard setup
   - Monitoring and alerting configuration
   - Machine learning model development

4. **Insights and Recommendations**:
   - Performance trend analysis
   - Optimization opportunities identification
   - Business impact assessment
   - Action plan development

Generate comprehensive analytics implementation with data collection, visualization, monitoring, and actionable insights.

If no specific operation is provided, perform analytics readiness assessment and recommend implementation strategy based on current setup and business requirements.