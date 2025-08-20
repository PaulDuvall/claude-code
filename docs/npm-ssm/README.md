# NPM Token in AWS SSM

Store NPM tokens securely in AWS SSM and use them in GitHub Actions.

## Setup (one-time)

```bash
# 1. Run setup script
./scripts/setup-npm-ssm.sh

# 2. Set GitHub variables (copy commands from script output)
gh variable set AWS_ROLE --body 'arn:aws:iam::ACCOUNT:role/github-actions-npm-REPO'
gh variable set AWS_REGION --body 'us-east-1'

# 3. Store your NPM token
aws ssm put-parameter \
  --name '/npm/token' \
  --value 'npm_YOUR_TOKEN_HERE' \
  --type SecureString \
  --region us-east-1
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