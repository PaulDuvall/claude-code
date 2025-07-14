---
description: AWS integration for credentials, services, and IAM testing with moto mocking
tags: [aws, cloud, testing, security]
---

Manage AWS services integration and testing based on the arguments provided in $ARGUMENTS.

First, check if this is a Python project and if AWS dependencies are available:
!ls -la | grep -E "(requirements.txt|pyproject.toml|setup.py)"
!pip list | grep -E "(boto3|moto|pytest)" 2>/dev/null || echo "Missing AWS dependencies"

Based on $ARGUMENTS, perform the appropriate AWS operation:

## 1. AWS Credentials and Configuration

If checking credentials (--credentials):
!aws configure list 2>/dev/null || echo "AWS CLI not configured"
!aws sts get-caller-identity 2>/dev/null || echo "Invalid credentials or no access"

If setting up profiles (--profiles):
!aws configure list-profiles 2>/dev/null
Show available AWS profiles and guide user through profile setup if needed.

## 2. AWS Service Testing with Moto

If setting up mocking (--mock, --mock-setup):
!pip install moto[all] boto3 pytest 2>/dev/null || echo "Install required: pip install moto[all] boto3 pytest"

Create mock environment setup:
```python
# Mock AWS services for testing
import boto3
from moto import mock_s3, mock_iam, mock_lambda

@mock_s3
def test_s3_operations():
    s3 = boto3.client('s3', region_name='us-east-1')
    # Add test implementations
```

## 3. IAM Policy Testing

If testing IAM (--test-iam, --test-policies):
!python -c "import boto3; print('Testing IAM policy simulation...')"

Validate IAM policies and permissions:
- Check policy syntax
- Test policy simulation
- Verify least privilege principles

## 4. Service Operations

For S3 operations (--s3):
!aws s3 ls 2>/dev/null || echo "S3 access denied or not configured"

For Lambda operations (--lambda):
!aws lambda list-functions --max-items 5 2>/dev/null || echo "Lambda access denied"

For DynamoDB operations (--dynamodb):
!aws dynamodb list-tables 2>/dev/null || echo "DynamoDB access denied"

## 5. Security Scanning

If running security scan (--security-scan):
!pip install checkov 2>/dev/null
!checkov -f terraform/ --framework terraform 2>/dev/null || echo "No Terraform files found"

Scan for:
- Hardcoded credentials in code
- Overly permissive IAM policies
- Unencrypted resources
- Public S3 buckets

Think step by step about AWS best practices and security considerations.

For integration testing (--integration-test):
!python -m pytest tests/test_aws*.py -v 2>/dev/null || echo "No AWS tests found"

Provide specific recommendations based on findings:
- Security improvements needed
- Cost optimization opportunities  
- Performance enhancements
- Compliance gaps

If no specific operation is provided, guide the user through AWS setup and suggest next steps.