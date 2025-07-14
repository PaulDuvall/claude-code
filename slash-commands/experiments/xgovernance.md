---
description: Comprehensive development governance framework for policies, audits, and compliance
tags: [governance, policies, audits, compliance, controls, standards]
---

Manage development governance based on the arguments provided in $ARGUMENTS.

First, examine current governance structure and documentation:
!find . -name "*policy*" -o -name "*governance*" -o -name "*compliance*" | head -10
!ls -la | grep -E "(POLICY|COMPLIANCE|GOVERNANCE)"
!find . -name "*.md" | grep -E "(policy|standard|procedure)" | head -5

Based on $ARGUMENTS, perform the appropriate governance operation:

## 1. Policy Management

If managing policies (--policy):
!find . -name "POLICY.md" -o -name "policies/" | head -3
!grep -r "policy" . --include="*.md" | head -5

Policy operations:
- Create new development policies
- Validate existing policy compliance
- Update policies based on requirements
- Track policy exceptions and approvals
- Enforce policy across projects

## 2. Governance Audit

If running audit (--audit):
!git log --since="30 days ago" --pretty=format:"%h %s" | head -10
!find . -name "*audit*" -o -name "*review*" | head -5
!ls -la .github/ 2>/dev/null || echo "No GitHub configuration found"

Audit activities:
- Review code quality standards compliance
- Check security policy adherence
- Validate development process maturity
- Assess risk management effectiveness
- Generate audit findings and recommendations

## 3. Compliance Assessment

If checking compliance (--compliance):
!grep -r "compliance" . --include="*.md" --include="*.yml" | head -5
!find . -name "*cert*" -o -name "*standard*" | head -3

Compliance checks:
- SOC 2 compliance validation
- ISO 27001 adherence assessment
- GDPR data protection compliance
- Industry-specific regulatory requirements
- Certification readiness evaluation

## 4. Controls Implementation

If managing controls (--controls):
!find . -name "*.yml" -o -name "*.yaml" | grep -E "(workflow|action|pipeline)" | head -5
!ls -la .github/workflows/ 2>/dev/null || echo "No CI/CD workflows found"

Governance controls:
- Implement automated compliance checks
- Set up governance monitoring
- Configure approval workflows
- Establish access controls
- Monitor control effectiveness

## 5. Standards Management

If managing standards (--standards):
!find . -name "*standard*" -o -name "*guideline*" | head -5
!python -m flake8 --version 2>/dev/null || echo "No Python linting standards"
!eslint --version 2>/dev/null || echo "No JavaScript linting standards"

Standards enforcement:
- Define coding standards
- Implement documentation standards
- Establish security standards
- Create architecture guidelines
- Monitor standards compliance

## 6. Review Processes

If managing reviews (--review):
!git log --grep="review" --oneline | head -5
!find . -name "CODEOWNERS" -o -name "*review*" | head -3

Review governance:
- Code review requirements and processes
- Architecture review checkpoints
- Security review mandatory gates
- Compliance review procedures
- Approval workflow management

## 7. Gap Analysis

If performing gap analysis (--gap-analysis):
!find . -name "*.md" | xargs grep -l "requirement" | head -5
!grep -r "TODO\|FIXME" . --include="*.py" --include="*.js" | wc -l

Identify gaps in:
- Policy coverage and implementation
- Compliance requirements fulfillment
- Control effectiveness
- Process maturity
- Documentation completeness

## 8. Metrics and Reporting

If generating reports (--metrics, --dashboard):
!git shortlog -sn --since="30 days ago" | head -10
!find . -name "*test*" | wc -l
!uptime

Governance metrics:
- Policy compliance rates
- Audit finding resolution time
- Control effectiveness measures
- Process maturity indicators
- Risk exposure levels

Think step by step about governance requirements and provide:

1. **Current State Assessment**:
   - Existing governance structure
   - Policy coverage and gaps
   - Compliance status
   - Control effectiveness

2. **Risk Analysis**:
   - Governance risk exposure
   - Compliance risks
   - Process risks
   - Technology risks

3. **Improvement Plan**:
   - Priority governance actions
   - Policy updates needed
   - Control enhancements
   - Process improvements

4. **Implementation Roadmap**:
   - Phased implementation approach
   - Resource requirements
   - Timeline and milestones
   - Success metrics

Generate comprehensive governance assessment with actionable recommendations for improving organizational governance maturity.

