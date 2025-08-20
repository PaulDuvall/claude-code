# NPM Token in AWS SSM

Store NPM tokens securely in AWS SSM and use them in GitHub Actions.

## Setup (one-time)

**Option 1: Fully automated**
```bash
# Run the setup script - it does everything!
./scripts/setup-npm-ssm.sh

# The script will:
# 1. Create AWS OIDC provider and IAM role
# 2. Set GitHub repository variables 
# 3. Prompt for your NPM token and store it securely
```

**Option 2: With environment variable**
```bash
# Set your NPM token as an environment variable
export NPM_TOKEN="npm_your_token_here"

# Run setup script (won't prompt for token)
./scripts/setup-npm-ssm.sh
```

**Option 3: Manual fallback**
If the script can't set GitHub variables automatically:
```bash
# Run setup script first
./scripts/setup-npm-ssm.sh

# Then manually run the commands it outputs
gh variable set AWS_ROLE --body 'arn:aws:iam::ACCOUNT:role/...'
gh variable set AWS_REGION --body 'us-east-1'
```

## How it works

1. GitHub Actions uses OIDC to get temporary AWS credentials
2. Workflow retrieves NPM token from SSM Parameter Store
3. Token is used to publish to NPM

## Files

- `scripts/setup-npm-ssm.sh` - One-time AWS setup
- `.github/workflows/npm-publish-simple.yml` - GitHub Actions workflow

## Security

- Token encrypted in SSM with KMS
- No secrets stored in GitHub
- Temporary AWS credentials (1 hour)
- Repository-specific access only

That's it! Simple and secure.