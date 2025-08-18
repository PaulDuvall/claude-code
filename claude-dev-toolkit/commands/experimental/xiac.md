---
description: Comprehensive Infrastructure as Code management with focus on AWS IAM, Terraform, CloudFormation, and infrastructure validation
tags: [infrastructure, terraform, cloudformation, iam, aws, security, compliance]
---

Manage Infrastructure as Code operations based on the arguments provided in $ARGUMENTS.

First, examine the current IaC setup:
!find . -name "*.tf" -o -name "*.yml" -o -name "*.yaml" | grep -E "(terraform|cloudformation|infra)" | head -10
!ls -la terraform/ cloudformation/ infrastructure/ iac/ 2>/dev/null || echo "No IaC directories found"
!which terraform 2>/dev/null && terraform version || echo "Terraform not available"
!which aws 2>/dev/null && aws --version || echo "AWS CLI not available"
!docker --version 2>/dev/null || echo "Docker not available"

Based on $ARGUMENTS, perform the appropriate Infrastructure as Code operation:

## 1. Infrastructure Scanning and Discovery

If scanning infrastructure (--scan, --discover, --inventory):
!find . -name "*.tf" | head -10
!find . -name "*.yml" -o -name "*.yaml" | xargs grep -l "Resources\|AWSTemplateFormatVersion" 2>/dev/null | head -5
!aws sts get-caller-identity 2>/dev/null || echo "AWS credentials not configured"
!aws iam list-roles --max-items 5 2>/dev/null || echo "No AWS access or roles not accessible"

Scan and discover infrastructure:
- Analyze existing IaC files and configurations
- Discover cloud resources and dependencies
- Generate infrastructure inventory
- Detect configuration drift
- Map resource relationships

## 2. Terraform Operations

If managing Terraform (--terraform, --tf-validate, --tf-plan):
!terraform version 2>/dev/null || echo "Terraform not installed"
!ls -la *.tf terraform/ 2>/dev/null || echo "No Terraform files found"
!terraform init -backend=false 2>/dev/null || echo "Terraform not initialized"
!terraform validate 2>/dev/null || echo "Terraform validation failed"

Manage Terraform infrastructure:
- Validate and format Terraform configurations
- Plan and apply infrastructure changes
- Manage Terraform state and modules
- Handle provider configurations
- Perform terraform operations safely

## 3. CloudFormation Operations

If managing CloudFormation (--cloudformation, --cf-validate, --cf-deploy):
!find . -name "*.yml" -o -name "*.yaml" -o -name "*.json" | xargs grep -l "AWSTemplateFormatVersion" 2>/dev/null | head -5
!aws cloudformation validate-template --template-body file://template.yml 2>/dev/null || echo "No valid CloudFormation templates found"
!aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE 2>/dev/null | head -10 || echo "No CloudFormation access"

Manage CloudFormation infrastructure:
- Validate and lint CloudFormation templates
- Deploy and manage CloudFormation stacks
- Handle stack updates and rollbacks
- Manage nested stacks and dependencies
- Monitor stack events and status

## 4. IAM Security Management

If managing IAM (--iam-roles, --iam-policies, --iam-validate):
!find . -name "*.tf" -o -name "*.yml" -o -name "*.yaml" | xargs grep -l "iam\|IAM" 2>/dev/null | head -5
!aws iam list-roles --max-items 10 2>/dev/null || echo "IAM access not available"
!grep -r "aws_iam\|AWS::IAM" . --include="*.tf" --include="*.yml" --include="*.yaml" | head -5 2>/dev/null

Manage IAM security:
- Analyze and validate IAM roles and policies
- Check least privilege compliance
- Scan for overly permissive policies
- Validate IAM policy syntax and logic
- Assess security posture and risks

## 5. Security and Compliance Scanning

If performing security analysis (--security-scan, --compliance, --secrets-scan):
!pip install checkov 2>/dev/null || echo "Install checkov: pip install checkov"
!checkov -f . --framework terraform cloudformation 2>/dev/null || echo "Checkov not available"
!grep -r "password\|secret\|key" . --include="*.tf" --include="*.yml" --include="*.yaml" | grep -v "example\|template" | head -5 2>/dev/null

Perform security analysis:
- Scan for security vulnerabilities
- Check compliance with security standards
- Detect hardcoded secrets and credentials
- Validate encryption and security controls
- Generate security assessment reports

Think step by step about Infrastructure as Code requirements and provide:

1. **Current State Assessment**:
   - Existing IaC tool usage and maturity
   - Infrastructure security posture
   - Compliance gaps and risks
   - Resource organization and management

2. **IaC Strategy**:
   - Tool selection and standardization
   - Module and template design patterns
   - State management and collaboration
   - Security and compliance integration

3. **Implementation Plan**:
   - IaC adoption and migration strategy
   - CI/CD pipeline integration
   - Testing and validation framework
   - Team training and knowledge transfer

4. **Operational Excellence**:
   - Monitoring and drift detection
   - Cost optimization strategies
   - Disaster recovery and backup
   - Continuous security assessment

Generate comprehensive Infrastructure as Code management plan with security controls, compliance checks, automation strategies, and operational best practices.

If no specific operation is provided, perform IaC readiness assessment and recommend implementation strategy based on current infrastructure setup and organizational needs.

