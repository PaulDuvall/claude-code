#!/bin/bash
# Complete setup for NPM token storage in AWS SSM

set -e

# Get repo info
REPO=$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
ROLE_NAME="github-actions-npm-${REPO//\//-}"
REGION=${AWS_REGION:-us-east-1}

echo "🔧 Setting up NPM token management for $REPO..."

# Step 1: Create AWS resources
echo "1️⃣ Creating AWS resources..."

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

# Step 2: Set GitHub variables automatically
echo "2️⃣ Setting GitHub repository variables..."

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    gh variable set AWS_ROLE --body "$ROLE_ARN"
    gh variable set AWS_REGION --body "$REGION"
    echo "✅ GitHub variables configured"
  else
    echo "⚠️  GitHub CLI not authenticated. Run: gh auth login"
    echo "   Then manually set variables:"
    echo "   gh variable set AWS_ROLE --body '$ROLE_ARN'"
    echo "   gh variable set AWS_REGION --body '$REGION'"
  fi
else
  echo "⚠️  GitHub CLI not installed. Install with: brew install gh"
  echo "   Then manually set variables:"
  echo "   gh variable set AWS_ROLE --body '$ROLE_ARN'"
  echo "   gh variable set AWS_REGION --body '$REGION'"
fi

# Step 3: Prompt for NPM token and store it
echo "3️⃣ Storing NPM token..."

if [ -n "$NPM_TOKEN" ]; then
  # Token provided via environment variable
  aws ssm put-parameter \
    --name '/npm/token' \
    --value "$NPM_TOKEN" \
    --type SecureString \
    --region "$REGION" \
    --overwrite 2>/dev/null || aws ssm put-parameter \
    --name '/npm/token' \
    --value "$NPM_TOKEN" \
    --type SecureString \
    --region "$REGION"
  echo "✅ NPM token stored from environment variable"
else
  # Prompt for token
  echo ""
  echo "📝 Please enter your NPM token:"
  echo "   (Get it from: https://www.npmjs.com/settings/tokens)"
  read -s -p "NPM Token: " USER_NPM_TOKEN
  echo ""
  
  if [ -n "$USER_NPM_TOKEN" ]; then
    aws ssm put-parameter \
      --name '/npm/token' \
      --value "$USER_NPM_TOKEN" \
      --type SecureString \
      --region "$REGION" \
      --overwrite 2>/dev/null || aws ssm put-parameter \
      --name '/npm/token' \
      --value "$USER_NPM_TOKEN" \
      --type SecureString \
      --region "$REGION"
    echo "✅ NPM token stored securely in SSM"
  else
    echo "⚠️  No token provided. Store manually with:"
    echo "   aws ssm put-parameter --name '/npm/token' --value 'YOUR_TOKEN' --type SecureString --region $REGION"
  fi
fi

echo ""
echo "🎉 Setup complete! Your NPM token is now:"
echo "   ✅ Stored encrypted in AWS SSM"
echo "   ✅ Accessible via GitHub Actions OIDC"
echo "   ✅ Ready for automatic NPM publishing"
echo ""
echo "💡 Test by pushing code - the workflow will automatically publish!"