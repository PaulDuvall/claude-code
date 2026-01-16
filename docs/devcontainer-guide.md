# Devcontainer Setup Guide

Run Claude Code with `--dangerously-skip-permissions` safely using Anthropic's official devcontainer approach.

## Overview

The devcontainer feature creates an isolated Docker environment where Claude can operate with full autonomy while protecting your host system. This implements [Anthropic's official devcontainer approach](https://docs.anthropic.com/en/docs/claude-code/devcontainer).

### Why Use a Devcontainer?

| Without Devcontainer | With Devcontainer |
|---------------------|-------------------|
| Claude asks permission for every file operation | Claude operates autonomously |
| Manual approval interrupts workflow | Uninterrupted AI development |
| Direct access to host filesystem | Isolated environment |
| Full network access | Allowlisted domains only |

## Quick Start

```bash
# 1. Set your API key
export ANTHROPIC_API_KEY="sk-ant-..."

# 2. Run the setup script
./setup-devcontainer.sh

# 3. Start the container (VS Code)
# Cmd/Ctrl+Shift+P → "Dev Containers: Reopen in Container"

# 4. Run Claude with full autonomy (inside container)
claude --dangerously-skip-permissions
```

## Installation Options

### Option 1: Setup Script (Recommended)

```bash
# Download and run (if not in the repo)
curl -sL https://raw.githubusercontent.com/PaulDuvall/claude-code/main/setup-devcontainer.sh | bash

# Or if you have the repo cloned
./setup-devcontainer.sh
```

### Option 2: Slash Command

If you have Claude Code Custom Commands installed:

```bash
claude
/xdevcontainer
```

### Option 3: Manual Setup

Create `.devcontainer/devcontainer.json` and `.devcontainer/Dockerfile` manually following the examples in the [xdevcontainer.md](../slash-commands/experiments/xdevcontainer.md) command documentation.

## Setup Script Options

### Basic Usage

```bash
# Full setup with all security features (recommended)
./setup-devcontainer.sh

# Preview what would be created without writing files
./setup-devcontainer.sh --dry-run
```

### Configuration Flags

| Flag | Description |
|------|-------------|
| `--help`, `-h` | Show help message |
| `--dry-run` | Preview files without creating them |
| `--force` | Overwrite existing configuration |
| `--minimal` | Minimal tooling (Node.js, Git only) |
| `--no-network-firewall` | Disable network restrictions |
| `--strict` | Fail if prerequisites missing (for CI) |
| `--allow-domain DOMAIN` | Add custom domain to allowlist |

### Tooling Options

**Full Tooling (Default):**
- Node.js
- Python with boto3, requests
- Git
- GitHub CLI
- AWS CLI
- Docker-in-Docker

**Minimal Tooling (`--minimal`):**
- Node.js
- Git
- GitHub CLI

### Examples

```bash
# Minimal setup without network restrictions
./setup-devcontainer.sh --minimal --no-network-firewall

# Add custom domains for enterprise registries
./setup-devcontainer.sh --allow-domain internal.registry.com --allow-domain npm.mycompany.com

# CI/CD usage with strict validation
./setup-devcontainer.sh --strict

# Using environment variable for extra domains
DEVCONTAINER_EXTRA_DOMAINS="internal.registry.com,npm.mycompany.com" ./setup-devcontainer.sh
```

## Security Features

### Network Firewall

By default, the container only allows outbound connections to:

| Domain | Purpose |
|--------|---------|
| `api.anthropic.com` | Claude API |
| `github.com` | Git operations |
| `registry.npmjs.org` | NPM packages |
| `pypi.org` | Python packages |
| `files.pythonhosted.org` | Python package files |

All other HTTPS (443) and HTTP (80) traffic is blocked.

### Container Isolation

- **`--cap-drop=ALL`**: Drops all Linux capabilities
- **`--security-opt=no-new-privileges`**: Prevents privilege escalation
- **Non-root user**: Runs as `vscode` user
- **No host mounts**: Isolated from host filesystem by default

### Adding Custom Domains

For enterprise environments with private registries:

```bash
# Via command line flag (can be used multiple times)
./setup-devcontainer.sh --allow-domain internal.registry.com

# Via environment variable (space or comma separated)
export DEVCONTAINER_EXTRA_DOMAINS="registry1.company.com,registry2.company.com"
./setup-devcontainer.sh
```

## Using the Devcontainer

### With VS Code

1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open your project folder
3. Press `Cmd/Ctrl+Shift+P` and select "Dev Containers: Reopen in Container"
4. Wait for the container to build and start
5. Open terminal and run: `claude --dangerously-skip-permissions`

### With CLI

```bash
# Start the container
devcontainer up --workspace-folder .

# Execute commands inside
devcontainer exec --workspace-folder . claude --dangerously-skip-permissions

# Or get a shell
devcontainer exec --workspace-folder . bash
```

### Installing devcontainer CLI

```bash
npm install -g @devcontainers/cli
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Claude Code in Devcontainer

on: [push]

jobs:
  claude-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup devcontainer
        run: ./setup-devcontainer.sh --strict
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Build container
        run: devcontainer up --workspace-folder .

      - name: Run Claude
        run: |
          devcontainer exec --workspace-folder . \
            claude --dangerously-skip-permissions \
            "Review this codebase and suggest improvements"
```

### Using `--strict` Mode

The `--strict` flag is designed for CI environments:

- Fails immediately if Docker is not installed
- Fails if Docker daemon is not running
- Fails if `ANTHROPIC_API_KEY` is not set
- Provides clear error messages for debugging

```bash
# Will exit with error code if prerequisites missing
./setup-devcontainer.sh --strict
```

## Troubleshooting

### Docker Not Found

```
ERROR: Docker not found. Install Docker to use devcontainers.
```

**Solution:** Install Docker Desktop or Docker Engine.

### Docker Daemon Not Running

```
WARNING: Docker daemon is not running.
```

**Solution:** Start Docker Desktop or run `sudo systemctl start docker`.

### API Key Not Set

```
WARNING: ANTHROPIC_API_KEY not set.
```

**Solution:** Set the environment variable before running the container:
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Container Build Fails

If the container fails to build:

1. Check Docker has enough disk space
2. Try rebuilding without cache:
   ```bash
   devcontainer up --workspace-folder . --remove-existing-container
   ```
3. Check for network issues downloading base images

### Network Firewall Blocking Required Service

If you need to access a domain that's blocked:

```bash
# Add the domain to the allowlist
./setup-devcontainer.sh --force --allow-domain your-service.com

# Rebuild the container
devcontainer up --workspace-folder . --remove-existing-container
```

### Verifying Firewall Rules

Inside the container, check iptables rules:

```bash
# View current rules
sudo iptables -L OUTPUT -n -v

# Test connectivity (should work)
curl -I https://api.anthropic.com

# Test blocked domain (should fail)
curl -I https://example.com
```

## Security Considerations

### Safe For

- Your own trusted projects
- Development and testing workflows
- CI/CD automation with Claude
- Learning and experimentation

### Avoid For

- **Untrusted repositories**: Prompt injection risk from malicious code
- **Projects with unreviewed credentials**: Claude can access anything in the container
- **Production systems**: Use proper security controls for production

### Credential Handling

**Important:** Any credentials passed to the container are accessible to Claude.

Best practices:
- Use minimal credentials with limited scope
- Rotate credentials regularly
- Use temporary/session credentials when possible
- Review what credentials you're passing via `remoteEnv`

## File Reference

### Generated Files

The setup script creates:

```
.devcontainer/
├── devcontainer.json    # Container configuration
└── Dockerfile           # Container image definition
```

### devcontainer.json Structure

```json
{
  "name": "Claude Code Sandbox",
  "build": { "dockerfile": "Dockerfile" },
  "features": { /* Development tools */ },
  "postCreateCommand": "npm install -g @anthropic-ai/claude-code",
  "remoteEnv": { /* Environment variables from host */ },
  "runArgs": ["--cap-drop=ALL", "--security-opt=no-new-privileges"],
  "mounts": [],
  "customizations": { "vscode": { /* VS Code settings */ } }
}
```

### Environment Variables Passed

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API authentication |
| `GITHUB_TOKEN` | GitHub operations |
| `AWS_ACCESS_KEY_ID` | AWS access |
| `AWS_SECRET_ACCESS_KEY` | AWS secret |
| `AWS_DEFAULT_REGION` | AWS region |

## Related Resources

- [Anthropic's Official Devcontainer Documentation](https://docs.anthropic.com/en/docs/claude-code/devcontainer)
- [VS Code Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Dev Container CLI Reference](https://github.com/devcontainers/cli)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
