---
description: Comprehensive risk assessment and mitigation across technical, security, and operational domains
tags: [risk, assessment, mitigation, security, operations, compliance, monitoring]
---

Identify, assess, and mitigate project risks based on the arguments provided in $ARGUMENTS.

First, examine the project environment for risk indicators:
!find . -name "*.log" | head -5 2>/dev/null || echo "No log files found"
!git log --grep="fix\|bug\|error" --oneline | head -10 2>/dev/null || echo "No error patterns in git history"
!find . -name "requirements.txt" -o -name "package.json" -o -name "go.mod" | head -3

Based on $ARGUMENTS, perform the appropriate risk assessment operation:

## 1. Risk Assessment and Identification

If assessing risks (--assess, --identify):
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | wc -l
!grep -r "TODO\|FIXME\|HACK" . --include="*.py" --include="*.js" | wc -l 2>/dev/null || echo "0"
!docker --version 2>/dev/null || echo "Docker not available"

Identify and assess project risks:
- Analyze codebase for technical debt indicators
- Scan for security vulnerabilities and exposures
- Evaluate architectural and design risks
- Assess operational and process risks
- Identify compliance and regulatory risks

## 2. Technical Risk Analysis

If analyzing technical risks (--technical):
!find . -name "*.py" -exec grep -l "eval\|exec\|pickle" {} \; 2>/dev/null | head -5
!find . -name "package-lock.json" -o -name "requirements.txt" | head -2
!grep -r "password\|secret\|key" . --include="*.py" --include="*.js" | grep -v test | head -5 2>/dev/null

Analyze technical risk factors:
- Code quality and maintainability issues
- Dependency vulnerabilities and outdated packages
- Architecture scalability limitations
- Performance bottlenecks and resource constraints
- Integration complexity and failure points

## 3. Security Risk Assessment

If assessing security risks (--security):
!find . -name "*.py" -exec grep -l "subprocess\|os\.system\|shell=True" {} \; 2>/dev/null | head -5
!npm audit --audit-level high 2>/dev/null || python -m safety check 2>/dev/null || echo "No security scanners available"
!find . -name ".env*" -o -name "*secret*" -o -name "*key*" | head -5

Evaluate security risk exposure:
- Authentication and authorization vulnerabilities
- Data protection and privacy compliance gaps
- Input validation and injection attack vectors
- Dependency security vulnerabilities
- Infrastructure and deployment security risks

## 4. Operational Risk Evaluation

If evaluating operational risks (--operational):
!find . -name "Dockerfile" -o -name "docker-compose.yml" | head -3
!ls -la .github/workflows/ 2>/dev/null || echo "No CI/CD workflows found"
!find . -name "*backup*" -o -name "*disaster*" | head -3 2>/dev/null

Assess operational risk factors:
- Deployment and release process risks
- Infrastructure and service dependencies
- Monitoring and alerting coverage gaps
- Backup and recovery procedure adequacy
- Team knowledge and key person dependencies

## 5. Risk Mitigation Planning

If planning mitigation (--mitigate, --contingency):
!find . -name "*test*" | wc -l
!git log --since="30 days ago" --grep="fix\|patch" --oneline | wc -l 2>/dev/null || echo "0"
!find . -name "*monitor*" -o -name "*alert*" | head -3

Develop risk mitigation strategies:
- Preventive measures and controls
- Detection and monitoring capabilities
- Response and recovery procedures
- Risk transfer and insurance options
- Contingency planning and alternatives

## 6. Risk Monitoring and Tracking

If monitoring risks (--monitor, --track):
!ps aux | grep -E "(monitor|alert)" | head -3
!find . -name "*.log" -newer +7 2>/dev/null | head -5
!uptime

Monitor and track risk indicators:
- Automated risk detection and alerting
- Key risk indicator (KRI) monitoring
- Trend analysis and pattern recognition
- Risk register updates and maintenance
- Stakeholder reporting and communication

Think step by step about risk management requirements and provide:

1. **Risk Identification and Assessment**:
   - Technical debt and code quality risks
   - Security vulnerabilities and compliance gaps
   - Operational process and infrastructure risks
   - Business and market risks

2. **Risk Analysis and Prioritization**:
   - Risk probability and impact evaluation
   - Risk interdependencies and cascading effects
   - Risk timeline and maturation analysis
   - Cost-benefit analysis of mitigation options

3. **Mitigation Strategy Development**:
   - Preventive controls and safeguards
   - Detective monitoring and alerting
   - Response procedures and recovery plans
   - Risk transfer and acceptance decisions

4. **Risk Monitoring and Reporting**:
   - Key risk indicator tracking
   - Risk register maintenance
   - Stakeholder communication
   - Continuous risk assessment updates

Generate comprehensive risk assessment with prioritized mitigation strategies, monitoring procedures, and stakeholder reporting.

If no specific operation is provided, perform comprehensive risk scan and provide prioritized risk assessment with immediate action recommendations.

