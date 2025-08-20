#!/bin/bash
# Simple setup for NPM token storage in AWS SSM

set -e

# Get repo info
REPO=$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
ROLE_NAME="github-actions-npm-${REPO//\//-}"

echo "🔧 Setting up AWS for $REPO..."

# Create OIDC provider (idempotent)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 2>/dev/null || true

# Create IAM role
aws iam create-role --role-name "$ROLE_NAME" \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Federated": "arn:aws:iam::'$ACCOUNT':oidc-provider/token.actions.githubusercontent.com"},
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {"token.actions.githubusercontent.com:sub": "repo:'$REPO':*"}
      }
    }]
  }' 2>/dev/null || echo "Role already exists"

# Attach SSM policy
aws iam put-role-policy --role-name "$ROLE_NAME" --policy-name SSMReadNPM \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["ssm:GetParameter"],
      "Resource": "arn:aws:ssm:*:*:parameter/npm/*"
    }, {
      "Effect": "Allow",
      "Action": ["kms:Decrypt"],
      "Resource": "*",
      "Condition": {"StringEquals": {"kms:ViaService": "ssm.*.amazonaws.com"}}
    }]
  }'

ROLE_ARN="arn:aws:iam::$ACCOUNT:role/$ROLE_NAME"

echo "✅ Setup complete!"
echo ""
echo "1. Set GitHub variables:"
echo "   gh variable set AWS_ROLE --body '$ROLE_ARN'"
echo "   gh variable set AWS_REGION --body 'us-east-1'"
echo ""
echo "2. Store NPM token:"
echo "   aws ssm put-parameter --name '/npm/token' --value 'YOUR_NPM_TOKEN' --type SecureString --region us-east-1"