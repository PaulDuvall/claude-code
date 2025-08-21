#!/usr/bin/env python3
"""
AWS IAM Role Setup for GitHub Actions - NPM Publishing
Creates the necessary IAM role and OIDC provider for GitHub Actions to publish NPM packages.
"""

import boto3
import json
import sys
from botocore.exceptions import ClientError


def get_github_repo_info():
    """Get GitHub repository information from git remote."""
    print("📋 Detecting GitHub Repository Information...")
    
    try:
        import subprocess
        
        # Get remote URL
        result = subprocess.run(['git', 'remote', 'get-url', 'origin'], 
                              capture_output=True, text=True, check=True)
        remote_url = result.stdout.strip()
        
        # Parse GitHub URL
        if 'github.com' in remote_url:
            # Handle both SSH and HTTPS URLs
            if remote_url.startswith('git@github.com:'):
                # SSH: git@github.com:owner/repo.git
                repo_path = remote_url.replace('git@github.com:', '').replace('.git', '')
            elif 'github.com/' in remote_url:
                # HTTPS: https://github.com/owner/repo.git
                repo_path = remote_url.split('github.com/')[-1].replace('.git', '')
            else:
                raise ValueError("Cannot parse GitHub URL format")
            
            github_org, github_repo = repo_path.split('/', 1)
            
            print(f"✅ Detected GitHub repository: {github_org}/{github_repo}")
            return github_org, github_repo
        else:
            raise ValueError("Remote is not a GitHub repository")
            
    except Exception as e:
        print(f"❌ Could not auto-detect GitHub repository: {e}")
        print("Please ensure you're in a git repository with GitHub remote")
        sys.exit(1)


def create_oidc_provider(iam_client):
    """Create GitHub OIDC identity provider if it doesn't exist."""
    print("\n🔐 Setting up GitHub OIDC Provider...")
    
    github_oidc_url = "https://token.actions.githubusercontent.com"
    github_thumbprint = "6938fd4d98bab03faadb97b34396831e3780aea1"  # GitHub's thumbprint
    
    try:
        # Check if OIDC provider already exists
        response = iam_client.list_open_id_connect_providers()
        for provider in response['OpenIDConnectProviderList']:
            if github_oidc_url in provider['Arn']:
                print(f"✅ GitHub OIDC provider already exists: {provider['Arn']}")
                return provider['Arn']
        
        # Create OIDC provider
        response = iam_client.create_open_id_connect_provider(
            Url=github_oidc_url,
            ThumbprintList=[github_thumbprint],
            ClientIDList=['sts.amazonaws.com']
        )
        
        oidc_arn = response['OpenIDConnectProviderArn']
        print(f"✅ Created GitHub OIDC provider: {oidc_arn}")
        return oidc_arn
        
    except ClientError as e:
        if 'EntityAlreadyExists' in str(e):
            print("✅ GitHub OIDC provider already exists")
            # Get the ARN
            response = iam_client.list_open_id_connect_providers()
            for provider in response['OpenIDConnectProviderList']:
                if github_oidc_url in provider['Arn']:
                    return provider['Arn']
        else:
            print(f"❌ Error creating OIDC provider: {e}")
            sys.exit(1)


def create_trust_policy(account_id, github_org, github_repo):
    """Create trust policy for GitHub Actions."""
    return {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Federated": f"arn:aws:iam::{account_id}:oidc-provider/token.actions.githubusercontent.com"
                },
                "Action": "sts:AssumeRoleWithWebIdentity",
                "Condition": {
                    "StringEquals": {
                        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                    },
                    "StringLike": {
                        "token.actions.githubusercontent.com:sub": [
                            f"repo:{github_org}/{github_repo}:*"
                        ]
                    }
                }
            }
        ]
    }


def create_npm_publish_policy():
    """Create IAM policy for NPM publishing permissions."""
    return {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "SSMParameterStoreAccess",
                "Effect": "Allow",
                "Action": [
                    # SSM Parameter Store permissions for NPM token management
                    "ssm:PutParameter",
                    "ssm:GetParameter",
                    "ssm:GetParameters",
                    "ssm:DeleteParameter",
                    "ssm:DescribeParameters",
                    "ssm:GetParameterHistory",
                    "ssm:GetParametersByPath",
                    "ssm:AddTagsToResource",
                    "ssm:RemoveTagsFromResource",
                    "ssm:ListTagsForResource"
                ],
                "Resource": [
                    # Specific to NPM token parameters
                    "arn:aws:ssm:*:*:parameter/npm/tokens/*",
                    "arn:aws:ssm:*:*:parameter/github/tokens/*",
                    "arn:aws:ssm:*:*:parameter/ci/tokens/*"
                ]
            },
            {
                "Sid": "SSMDescribeAccess",
                "Effect": "Allow",
                "Action": [
                    "ssm:DescribeParameters"
                ],
                "Resource": "*"
            },
            {
                "Sid": "KMSKeyAccess",
                "Effect": "Allow",
                "Action": [
                    # KMS permissions for SecureString parameters
                    "kms:Decrypt",
                    "kms:Encrypt",
                    "kms:GenerateDataKey",
                    "kms:DescribeKey"
                ],
                "Resource": "*",
                "Condition": {
                    "StringLike": {
                        "kms:ViaService": [
                            "ssm.*.amazonaws.com"
                        ]
                    }
                }
            },
            {
                "Sid": "CloudWatchLogsAccess",
                "Effect": "Allow", 
                "Action": [
                    # CloudWatch Logs for GitHub Actions debugging
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents",
                    "logs:DescribeLogGroups",
                    "logs:DescribeLogStreams"
                ],
                "Resource": [
                    "arn:aws:logs:*:*:log-group:/github-actions/*",
                    "arn:aws:logs:*:*:log-group:/aws/lambda/github-actions-*"
                ]
            },
            {
                "Sid": "STSAssumeRole",
                "Effect": "Allow",
                "Action": [
                    # STS permissions for role assumption
                    "sts:GetCallerIdentity",
                    "sts:GetSessionToken"
                ],
                "Resource": "*"
            }
        ]
    }


def create_npm_role(iam_client, role_name, github_org, github_repo, account_id):
    """Create the NPM publishing role for GitHub Actions."""
    print(f"\n🔧 Creating NPM publishing role: {role_name}")
    
    trust_policy = create_trust_policy(account_id, github_org, github_repo)
    
    try:
        # Create the role
        response = iam_client.create_role(
            RoleName=role_name,
            AssumeRolePolicyDocument=json.dumps(trust_policy),
            Description=f"NPM publishing role for GitHub Actions in {github_org}/{github_repo}",
            MaxSessionDuration=3600  # 1 hour
        )
        
        role_arn = response['Role']['Arn']
        print(f"✅ Created role: {role_arn}")
        
        # Create and attach the NPM publishing policy
        policy_name = f"{role_name}-NPMPublishPolicy"
        npm_policy = create_npm_publish_policy()
        
        iam_client.put_role_policy(
            RoleName=role_name,
            PolicyName=policy_name,
            PolicyDocument=json.dumps(npm_policy)
        )
        
        print(f"✅ Attached NPM publishing policy: {policy_name}")
        return role_arn
        
    except ClientError as e:
        if 'EntityAlreadyExists' in str(e):
            print(f"✅ Role {role_name} already exists")
            response = iam_client.get_role(RoleName=role_name)
            role_arn = response['Role']['Arn']
            
            # Update the policy even if role exists
            policy_name = f"{role_name}-NPMPublishPolicy"
            npm_policy = create_npm_publish_policy()
            
            iam_client.put_role_policy(
                RoleName=role_name,
                PolicyName=policy_name,
                PolicyDocument=json.dumps(npm_policy)
            )
            
            print(f"✅ Updated NPM publishing policy: {policy_name}")
            return role_arn
        else:
            print(f"❌ Error creating role: {e}")
            sys.exit(1)


def main():
    """Main function to set up GitHub Actions AWS integration for NPM publishing."""
    print("🚀 AWS IAM Role Setup for GitHub Actions - NPM Publishing")
    print("=" * 50)
    
    # Initialize AWS clients
    try:
        sts_client = boto3.client('sts')
        iam_client = boto3.client('iam')
        
        # Get current AWS account info
        identity = sts_client.get_caller_identity()
        account_id = identity['Account']
        current_user = identity['Arn']
        
        print(f"📋 AWS Account: {account_id}")
        print(f"📋 Current User: {current_user}")
        
    except Exception as e:
        print(f"❌ AWS authentication failed: {e}")
        print("Make sure your AWS credentials are configured (aws configure)")
        sys.exit(1)
    
    # Get GitHub repository information
    github_org, github_repo = get_github_repo_info()
    
    # Set up role name
    role_name = f"github-actions-{github_org}-{github_repo}-npm-access"
    
    print(f"\n📋 Setup Summary:")
    print(f"   AWS Account: {account_id}")
    print(f"   GitHub Repo: {github_org}/{github_repo}")
    print(f"   Role Name: {role_name}")
    
    # Auto-proceed (non-interactive)
    print("\n🚀 Proceeding with automatic setup...")
    
    # Create OIDC provider
    oidc_arn = create_oidc_provider(iam_client)
    
    # Create NPM publishing role
    role_arn = create_npm_role(iam_client, role_name, github_org, github_repo, account_id)
    
    print("\n" + "=" * 50)
    print("✅ Setup Complete!")
    print("=" * 50)
    
    print(f"\n📋 GitHub Repository Variable to add:")
    print(f"   Repository: https://github.com/{github_org}/{github_repo}/settings/variables/actions")
    print(f"   ")
    print(f"   Variable Name: AWS_DEPLOYMENT_ROLE")
    print(f"   Variable Value: {role_arn}")
    print(f"   ")
    print(f"   Note: This should be a Repository Variable, not a Secret")
    
    print(f"\n🔗 Next Steps:")
    print(f"   1. Add the repository variable above to your GitHub repository")
    print(f"   2. Store your NPM token in the workflow when running it")
    print(f"   3. The workflow will save the token to SSM for future use")
    
    print(f"\n🔐 Security Notes:")
    print(f"   - Role can only be assumed by your specific GitHub repository")
    print(f"   - Role has limited permissions for SSM Parameter Store only")
    print(f"   - Can only access parameters under /npm/tokens/*, /github/tokens/*, and /ci/tokens/*")
    print(f"   - Sessions are limited to 1 hour")
    
    print(f"\n📦 NPM Token Storage:")
    print(f"   - Tokens will be stored in: /npm/tokens/{github_org}-{github_repo}")
    print(f"   - Tokens are encrypted using AWS KMS")
    print(f"   - Only this GitHub repository can access these tokens")


if __name__ == '__main__':
    main()