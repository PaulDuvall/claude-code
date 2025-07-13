---
description: Generate, validate, and test IAM policies with automated policy creation and best practices enforcement
tags: [iam, security, policies, aws, compliance, validation]
---

Manage IAM policies and security configurations based on the arguments provided in $ARGUMENTS.

First, examine the current AWS and IAM setup:
!find . -name "*.tf" -o -name "*.yml" -o -name "*.yaml" | xargs grep -l "iam\|IAM" 2>/dev/null | head -5
!ls -la iam/ policies/ security/ terraform/ 2>/dev/null | head -3
!which aws 2>/dev/null && aws --version || echo "AWS CLI not available"
!aws sts get-caller-identity 2>/dev/null || echo "AWS credentials not configured"

Based on $ARGUMENTS, perform the appropriate IAM policy operation:

## 1. Policy Generation

If generating IAM policies (--generate, --service, --resource, --template):
!find . -name "*.json" | xargs grep -l "Version.*2012-10-17" 2>/dev/null | head -5
!aws iam list-roles --max-items 5 2>/dev/null || echo "IAM access not available"
!find . -name "*.tf" | xargs grep -l "aws_iam" 2>/dev/null | head -3

Generate IAM policies:
- Role-specific policy generation
- Service-based policy templates
- Resource-scoped policy creation
- Custom policy from specifications
- Template-based policy generation

## 2. Policy Validation

If validating policies (--validate, --lint, --syntax-check, --compliance):
!find . -name "*.json" -o -name "*.yml" -o -name "*.yaml" | head -10
!python -c "import json; print('JSON validation available')" 2>/dev/null || echo "Python JSON not available"
!which jq 2>/dev/null && echo "jq available for JSON processing" || echo "jq not available"

Validate policy configurations:
- JSON/YAML syntax validation
- Policy logic and structure checking
- Best practice compliance validation
- Security vulnerability detection
- Regulatory compliance assessment

## 3. Policy Testing and Simulation

If testing policies (--test, --simulate, --dry-run, --permissions-test):
!aws iam simulate-principal-policy --help 2>/dev/null | head -1 || echo "AWS IAM simulation not available"
!find . -name "*test*" | grep -i iam | head -3 2>/dev/null
!python -c "import boto3; print('AWS SDK available')" 2>/dev/null || echo "AWS SDK not available"

Test policy functionality:
- Policy simulation and evaluation
- Permission testing and verification
- Access control validation
- Scenario-based testing
- Integration testing with AWS services

## 4. Policy Analysis and Security

If analyzing policies (--analyze, --permissions, --vulnerabilities, --least-privilege):
!grep -r "\*" . --include="*.json" | grep -i "action\|resource" | head -5 2>/dev/null
!aws iam get-account-authorization-details 2>/dev/null | head -10 || echo "IAM account details not accessible"
!pip list | grep -E "(boto3|botocore)" 2>/dev/null || echo "AWS Python SDK not installed"

Analyze security posture:
- Permission scope and effectiveness analysis
- Overprivileged policy identification
- Least privilege compliance checking
- Security vulnerability assessment
- Policy optimization recommendations

## 5. Policy Management and Deployment

If managing policies (--deploy, --attach, --version, --rollback):
!aws iam list-policies --scope Local --max-items 5 2>/dev/null || echo "IAM policy listing not available"
!find . -name "*.tf" | xargs grep -l "aws_iam_policy" 2>/dev/null | head -3
!ls -la terraform/ cloudformation/ iac/ 2>/dev/null | head -3

Manage policy lifecycle:
- Policy deployment and attachment
- Version control and rollback
- Policy lifecycle management
- Automated policy updates
- Compliance monitoring and reporting

Think step by step about IAM policy requirements and provide:

1. **Security Assessment**:
   - Current IAM policy configuration review
   - Permission scope and access analysis
   - Security vulnerability identification
   - Compliance gap assessment

2. **Policy Strategy**:
   - Least privilege principle implementation
   - Role-based access control design
   - Resource-specific permission scoping
   - Conditional access policy creation

3. **Implementation Plan**:
   - Policy generation and validation
   - Testing and simulation framework
   - Deployment and rollback procedures
   - Monitoring and compliance tracking

4. **Security Optimization**:
   - Policy optimization recommendations
   - Security hardening measures
   - Compliance alignment strategies
   - Continuous security improvement

Generate comprehensive IAM policy management with security validation, compliance checking, testing framework, and deployment automation.

If no specific operation is provided, perform IAM security assessment and recommend policy improvements based on current configuration and security best practices.

