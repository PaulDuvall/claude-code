---
description: Check project compliance with standards and generate audit documentation
tags: [compliance, audit, security, regulatory, governance]
---

Perform compliance checks and management based on the arguments provided in $ARGUMENTS.

First, examine the project structure for compliance-related files:
!ls -la | grep -E "(compliance|audit|security|policy)"
!find . -name "*.md" -o -name "*.yml" -o -name "*.json" | grep -E "(compliance|policy|security)" | head -10

Based on $ARGUMENTS, perform the appropriate compliance operation:

## 1. Standards Compliance Checking

If checking SOC 2 compliance (--soc2):
!grep -r "audit" . --include="*.md" --include="*.yml" | head -5
!find . -name "*.log" | grep -E "(access|security|change)" | head -5

Check SOC 2 requirements:
- Security controls implementation
- Availability monitoring
- Processing integrity
- Confidentiality measures
- Privacy protection

If checking ISO 27001 (--iso27001):
!find . -name "*security*" -o -name "*isms*" | head -10

Validate:
- Information security management system
- Risk assessment documentation
- Security policy implementation
- Incident response procedures

If checking GDPR compliance (--gdpr):
!grep -r -i "personal.*data\|privacy\|consent" . --include="*.py" --include="*.js" | head -10

Check for:
- Data processing lawfulness
- Consent mechanisms
- Data subject rights
- Privacy by design
- Data breach procedures

## 2. Audit Trail Generation

If generating audit trail (--audit-trail):
!git log --since="30 days ago" --pretty=format:"%h %an %ad %s" --date=short
!find . -name "*.log" -newer $(date -d "30 days ago" +%Y-%m-%d) 2>/dev/null | head -10

Collect:
- Code changes with timestamps
- Access logs
- Configuration changes
- Deployment records
- Security events

## 3. Gap Analysis

If running gap analysis (--gap-analysis):
@package.json
!pip list | grep -E "(security|audit|compliance)" 2>/dev/null || npm list | grep -E "(security|audit|compliance)" 2>/dev/null

Identify missing:
- Security controls
- Documentation
- Monitoring capabilities
- Access controls
- Compliance policies

## 4. Evidence Collection

If collecting evidence (--evidence):
!ls -la logs/ 2>/dev/null || echo "No logs directory found"
!find . -name "*.cert" -o -name "*.pem" | head -5
!docker images 2>/dev/null | grep -E "(security|scan)" || echo "No security scanning images"

Gather evidence for:
- Security configurations
- Access controls
- Monitoring systems
- Backup procedures
- Incident responses

## 5. Assessment and Reporting

If running assessment (--assessment):
!find . -name "Dockerfile" -exec grep -l "USER" {} \; 2>/dev/null
!grep -r "password" . --include="*.py" --include="*.js" | grep -v "test" | head -5
!find . -name "*.yml" -exec grep -l "secrets" {} \; 2>/dev/null

Assess:
- Container security
- Secret management
- Network security
- Data encryption
- Access management

Think step by step about compliance requirements and provide:
- Current compliance status
- Identified gaps and risks
- Remediation recommendations
- Implementation timeline
- Resource requirements

Generate compliance report with findings and recommendations.

## 6. Policy Management

If checking policies (--policies, --policy-check):
!find . -name "*policy*" -o -name "*procedure*" | head -10
!grep -r "policy" . --include="*.md" | head -5

Validate:
- Policy documentation exists
- Policies are current and approved
- Implementation evidence
- Training records
- Exception handling

## 7. Control Testing

If testing controls (--test-controls):
!netstat -tuln 2>/dev/null | grep ":22\|:443\|:80" || echo "Network scan not available"
!ps aux | grep -E "(firewall|antivirus|monitoring)" | head -5

Test:
- Access controls
- Network security
- Data encryption
- Monitoring systems
- Backup procedures

## 8. Compliance Monitoring

If generating dashboard (--dashboard, --metrics):
!uptime
!df -h | head -5
!free -h 2>/dev/null || echo "Memory info not available"

Track:
- System availability
- Security incident count
- Policy compliance rate
- Control effectiveness
- Audit findings

For continuous monitoring (--alerts):
Set up compliance alerts for:
- Policy violations
- Security incidents
- System failures
- Unauthorized access
- Configuration changes

Provide compliance scorecard with recommendations for improvement.

## 9. Remediation Planning

If requesting remediation (--remediation):
Based on identified gaps, provide:
- Prioritized action items
- Implementation timeline
- Resource requirements
- Risk mitigation strategies
- Success metrics

## 10. Audit Readiness

If checking readiness (--readiness):
!find . -name "*.backup" -o -name "*.bak" | head -5
!crontab -l 2>/dev/null | grep -E "(backup|security|audit)" || echo "No scheduled compliance tasks"

Verify readiness for:
- External audits
- Regulatory reviews
- Security assessments
- Compliance certifications

Provide audit preparation checklist and recommendations for successful compliance outcomes.

