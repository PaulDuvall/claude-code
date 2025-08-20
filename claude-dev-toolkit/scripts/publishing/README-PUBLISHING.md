# NPM Publishing Guide

This directory contains scripts for publishing the `claude-dev-toolkit` package to both private (GitHub Packages) and public (npmjs.org) NPM registries.

## 📁 Scripts Overview

| Script | Purpose | Registry |
|--------|---------|-----------|
| `publish-private.sh` | UX testing and beta releases | GitHub Packages |
| `publish-public.sh` | Public production releases | npmjs.org |
| `setup-public-auth.sh` | Authentication setup helper | npmjs.org |

## 🚀 Publishing Workflow

### 1. Development & Testing
```bash
# Test package locally
cd claude-dev-toolkit
npm run validate
npm test
npm pack --dry-run
```

### 2. Private Beta Release (GitHub Packages)
```bash
# Publish for internal testing
./scripts/publishing/publish-private.sh
```

### 3. Public Production Release (npmjs.org)

#### Option A: Manual Publishing
```bash
# Setup authentication (one-time)
./scripts/publishing/setup-public-auth.sh

# Publish to public registry
./scripts/publishing/publish-public.sh
```

#### Option B: Automated via GitHub Actions
1. Push code changes to `main` branch
2. Go to GitHub Actions > "Publish to Public NPM Registry"
3. Run workflow and confirm with `yes`
4. Or create a version tag: `git tag v1.0.1 && git push origin v1.0.1`

## 🔑 Authentication Setup

### For Local Publishing

1. **NPM Account**: Create account at https://www.npmjs.com/
2. **Authentication**: Run `./scripts/publishing/setup-public-auth.sh`
3. **Verification**: `npm whoami --registry=https://registry.npmjs.org`

### For GitHub Actions

1. **NPM Token**: Generate automation token at https://www.npmjs.com/settings/tokens
2. **Repository Secret**: Add `NPM_TOKEN` secret in GitHub repository settings
3. **Workflow**: The `.github/workflows/publish-public.yml` handles the rest

## 📋 Pre-Publication Checklist

- [ ] All tests passing (`npm test`)
- [ ] Package validation passes (`npm run validate`)
- [ ] Version bumped in `package.json`
- [ ] CHANGELOG updated with new features
- [ ] Documentation updated
- [ ] Git working directory clean
- [ ] Authentication configured

## 🏷️ Version Management

### Semantic Versioning
- `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Automated Tagging
Both publishing scripts automatically:
1. Extract version from `package.json`
2. Create git tag `v{version}`
3. Push tag to remote repository
4. Create GitHub release (in Actions workflow)

## 🛡️ Security Best Practices

1. **Token Security**
   - Never commit NPM tokens to git
   - Use automation tokens for CI/CD
   - Rotate tokens regularly

2. **Access Control**
   - Use minimal required permissions
   - Enable 2FA on npmjs.org account
   - Monitor package access logs

3. **Package Integrity**
   - Verify package contents before publishing
   - Use `npm pack --dry-run` for validation
   - Monitor for unauthorized changes

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Failed**
   ```bash
   # Re-authenticate
   npm login --registry=https://registry.npmjs.org
   ```

2. **Package Already Exists**
   - Version already published
   - Increment version in `package.json`
   - Cannot republish same version

3. **Permission Denied**
   - Verify account has publish permissions
   - Check package name availability
   - Ensure correct registry URL

4. **Workflow Fails**
   - Check `NPM_TOKEN` secret is set
   - Verify token has correct permissions
   - Check repository permissions

### Debug Commands
```bash
# Check authentication
npm whoami --registry=https://registry.npmjs.org

# Check package configuration
npm pkg get name publishConfig

# Validate package structure
npm pack --dry-run

# Check registry configuration
npm config get registry
```

## 📊 Monitoring

After publication, monitor:
- NPM package page: https://www.npmjs.com/package/claude-dev-toolkit
- Download statistics
- GitHub issues and feedback
- Security advisories

## 🔄 Rollback Procedures

If issues are discovered after publication:

1. **Immediate Response**
   ```bash
   # Unpublish (within 24 hours only)
   npm unpublish claude-dev-toolkit@<version> --registry=https://registry.npmjs.org
   ```

2. **Long-term Fix**
   - Publish hotfix version
   - Deprecate problematic version
   ```bash
   npm deprecate claude-dev-toolkit@<version> "Issue description - please upgrade"
   ```

## 📚 Additional Resources

- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Actions NPM Publishing](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
- [Semantic Versioning](https://semver.org/)
- [NPM Token Documentation](https://docs.npmjs.com/about-access-tokens)