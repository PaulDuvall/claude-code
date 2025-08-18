---
description: Automate AWS OIDC role creation for GitHub Actions with local policy discovery
tags: [aws, oidc, github-actions, security, automation]
---

Automate the creation of AWS OIDC roles for GitHub Actions with intelligent policy discovery from local aws_policies folders.

## Usage Examples

```bash
# Basic usage with policy discovery
/xoidc --github-org myorg --github-repo myrepo

# With custom policies directory
/xoidc --github-org myorg --github-repo myrepo --policies-dir custom_policies

# Dry run validation
/xoidc --github-org myorg --github-repo myrepo --dry-run

# Full configuration
/xoidc --github-org myorg --github-repo myrepo --region us-west-2 --github-token $GITHUB_TOKEN
```

## Arguments

- `--github-org`: GitHub organization name (required)
- `--github-repo`: GitHub repository name (required)
- `--region`: AWS region (default: us-east-1)
- `--policies-dir`: Custom policies directory (default: aws_policies)
- `--stack-name`: Custom CloudFormation stack name
- `--dry-run`: Validate policies without deployment
- `--github-token`: GitHub PAT for repository variable setting

## Implementation

First, check for required dependencies and validate environment:
Check if AWS CLI is available. If not found, display error message.
Check if GitHub CLI is available. If not found, display warning about limited features.

Parse arguments from $ARGUMENTS and set defaults:
- GITHUB_ORG: Extract from --github-org parameter
- GITHUB_REPO: Extract from --github-repo parameter  
- REGION: Extract from --region parameter or default to "us-east-1"
- POLICIES_DIR: Extract from --policies-dir parameter or default to "aws_policies"
- STACK_NAME: Extract from --stack-name parameter or generate from org/repo names
- DRY_RUN: Set to true if --dry-run flag is present
- GITHUB_TOKEN: Extract from --github-token parameter

Validate that required arguments are provided:
- Exit with error if --github-org is missing
- Exit with error if --github-repo is missing

## 1. Policy Discovery

Scan for AWS policies in the specified directory:
Display message indicating scanning for policies in the policies directory.
Check if the policies directory exists. If not found, display error and exit.

List discovered policy files:
Find all JSON files in the policies directory, excluding example files, and display them sorted.

Store policy files for processing:
Get list of policy files and validate that at least one policy file was found.
If no policy files found, display error and exit.

## 2. Policy Validation

Validate each policy file structure:
Display message indicating policy validation is starting.
For each policy file found:
- Display validation message with filename
- Validate JSON syntax using jq
- Check for required Version field (should be "2012-10-17")
- Validate Statement array exists and is properly formatted
- Check for overly permissive policies (wildcard actions or resources)
- Display warnings for any issues found but continue processing

## 3. Generate Trust Policy

Create trust policy for GitHub OIDC:
Display message indicating trust policy generation.
Create a trust policy JSON file with:
- Version "2012-10-17"
- Allow effect for GitHub OIDC provider
- Principal federated to GitHub Actions OIDC provider
- Action for AssumeRoleWithWebIdentity
- Conditions for audience and subject matching the specific GitHub org/repo
- Replace variables with actual GitHub org and repo names

## 4. Create CloudFormation Template

Generate CloudFormation template:
Display message indicating CloudFormation template creation.
Create a CloudFormation template with:
- AWSTemplateFormatVersion: '2010-09-09'
- Description for the GitHub OIDC Role
- Parameters for GitHubOrg and GitHubRepo
- GitHubOIDCProvider resource with proper thumbprint
- GitHubActionsRole resource with:
  - Role name following pattern: GitHubActions-{org}-{repo}
  - Trust policy referencing the OIDC provider
  - Conditions for audience and subject validation
- Inline policies section populated from discovered policy files
- Output for the Role ARN

For each policy file found:
- Add as inline policy to the IAM role
- Use filename (without .json) as policy name
- Include full policy document content with proper indentation

Add outputs section with Role ARN for easy reference.

## 5. Deploy or Validate

Set stack name if not provided:
Generate stack name using pattern: gha-oidc-{github-org}-{github-repo}

If dry run mode is enabled:
- Display dry run message
- Validate CloudFormation template using AWS CLI
- Display validation success message
- List discovered policy files
- Exit without deploying

Deploy the CloudFormation stack:
- Display deployment message with stack name
- Use AWS CLI to deploy the CloudFormation template
- Include required capabilities for IAM resource creation
- Pass GitHub org and repo as parameters
- Use specified AWS region

Get the role ARN from the stack output:
- Query the deployed stack for outputs
- Extract the RoleArn output value
- Store for use in GitHub configuration

## 6. Configure GitHub Repository Variable

Set repository variable if GitHub token is provided:
If GitHub token is available and GitHub CLI is installed:
- Display configuration message
- Set GitHub token in environment
- Use GitHub CLI to set repository variable 'GHA_OIDC_ROLE_ARN'
- Display success message

If GitHub token is not provided:
- Display manual step instruction
- Show the Role ARN that needs to be set manually

## 7. Generate Usage Instructions

Display completion message and setup summary:
- Show success message: "🎉 OIDC Role Setup Complete!"
- Display divider line
- Show stack name, role ARN, and region
- List all policies that were applied
- Display GitHub Actions workflow usage example with:
  - Job configuration with required permissions
  - AWS credentials configuration step
  - Role ARN variable reference
  - Region configuration
- Show completion message

Clean up temporary files:
Remove temporary files created during the process (trust policy, CloudFormation template, backup files).