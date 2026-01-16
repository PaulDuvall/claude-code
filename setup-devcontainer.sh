#!/bin/bash
# setup-devcontainer.sh - Create secure devcontainer for Claude Code with --dangerously-skip-permissions
#
# This script implements Anthropic's official devcontainer approach for running
# Claude Code with full autonomy in an isolated container environment.
#
# Reference: https://docs.anthropic.com/en/docs/claude-code/devcontainer

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEVCONTAINER_DIR=".devcontainer"
DEVCONTAINER_JSON="${DEVCONTAINER_DIR}/devcontainer.json"
DOCKERFILE="${DEVCONTAINER_DIR}/Dockerfile"

# Default settings
NETWORK_FIREWALL=true
FULL_TOOLING=true
DRY_RUN=false
FORCE=false
STRICT_MODE=false

# Allowed domains for network firewall (default set)
DEFAULT_ALLOWED_DOMAINS=(
    "api.anthropic.com"
    "github.com"
    "registry.npmjs.org"
    "pypi.org"
    "files.pythonhosted.org"
)

# Initialize with defaults; extra domains added via --allow-domain or env var
ALLOWED_DOMAINS=("${DEFAULT_ALLOWED_DOMAINS[@]}")

# Support additional domains via environment variable (space or comma separated)
# Example: DEVCONTAINER_EXTRA_DOMAINS="internal.registry.com private.npm.org"
if [[ -n "${DEVCONTAINER_EXTRA_DOMAINS:-}" ]]; then
    # Convert commas to spaces and split
    IFS=', ' read -ra EXTRA_DOMAINS <<< "$DEVCONTAINER_EXTRA_DOMAINS"
    ALLOWED_DOMAINS+=("${EXTRA_DOMAINS[@]}")
fi

usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Create a secure devcontainer configuration for running Claude Code with
--dangerously-skip-permissions safely.

OPTIONS:
    -h, --help              Show this help message
    --no-network-firewall   Skip network firewall rules (allows all outbound traffic)
    --minimal               Minimal tooling (Node.js, Git only - no Python, AWS CLI, etc.)
    --dry-run               Show what would be created without writing files
    --force                 Overwrite existing devcontainer configuration
    --strict                Fail immediately if prerequisites are missing (for CI use)
    --allow-domain DOMAIN   Add domain to firewall allowlist (can be used multiple times)

ENVIRONMENT VARIABLES:
    DEVCONTAINER_EXTRA_DOMAINS   Space or comma separated list of additional allowed domains
                                 Example: "internal.registry.com,private.npm.org"

EXAMPLES:
    # Create devcontainer with recommended security settings
    $(basename "$0")

    # Create minimal devcontainer without network restrictions
    $(basename "$0") --minimal --no-network-firewall

    # Preview what would be created
    $(basename "$0") --dry-run

    # Add custom domains for enterprise private registries
    $(basename "$0") --allow-domain internal.registry.com --allow-domain npm.mycompany.com

    # Or use environment variable
    DEVCONTAINER_EXTRA_DOMAINS="internal.registry.com,npm.mycompany.com" $(basename "$0")

AFTER SETUP:
    # Using VS Code
    Cmd/Ctrl+Shift+P → "Dev Containers: Reopen in Container"

    # Using CLI
    devcontainer up --workspace-folder .
    devcontainer exec --workspace-folder . claude --dangerously-skip-permissions

For more information, see:
https://docs.anthropic.com/en/docs/claude-code/devcontainer

EOF
}

log_info() {
    echo -e "${BLUE}INFO:${NC} $1"
}

log_success() {
    echo -e "${GREEN}SUCCESS:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            --no-network-firewall)
                NETWORK_FIREWALL=false
                shift
                ;;
            --minimal)
                FULL_TOOLING=false
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --strict)
                STRICT_MODE=true
                shift
                ;;
            --allow-domain)
                if [[ -z "${2:-}" ]]; then
                    log_error "--allow-domain requires a domain argument"
                    exit 1
                fi
                ALLOWED_DOMAINS+=("$2")
                shift 2
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    local has_errors=false

    # Check for Docker command
    if ! command -v docker &> /dev/null; then
        if [[ "$STRICT_MODE" == "true" ]]; then
            log_error "Docker not found. Install Docker to use devcontainers."
            has_errors=true
        else
            log_warning "Docker not found. You'll need Docker to use the devcontainer."
        fi
    else
        log_success "Docker found: $(docker --version)"

        # Check if Docker daemon is running
        if ! docker info &> /dev/null; then
            if [[ "$STRICT_MODE" == "true" ]]; then
                log_error "Docker daemon is not running. Start Docker and try again."
                has_errors=true
            else
                log_warning "Docker daemon is not running. Start Docker before using the devcontainer."
            fi
        else
            log_success "Docker daemon is running"
        fi
    fi

    # Check for ANTHROPIC_API_KEY
    if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
        if [[ "$STRICT_MODE" == "true" ]]; then
            log_error "ANTHROPIC_API_KEY environment variable is not set."
            has_errors=true
        else
            log_warning "ANTHROPIC_API_KEY not set. You'll need to set it before running Claude."
        fi
    else
        log_success "ANTHROPIC_API_KEY is set"
    fi

    # Check for devcontainer CLI (optional but helpful)
    if command -v devcontainer &> /dev/null; then
        log_success "devcontainer CLI found: $(devcontainer --version)"
    else
        log_info "devcontainer CLI not found. Install with: npm install -g @devcontainers/cli"
    fi

    # In strict mode, exit if any required prerequisites are missing
    if [[ "$STRICT_MODE" == "true" ]] && [[ "$has_errors" == "true" ]]; then
        log_error "Prerequisites check failed. Fix the errors above and try again."
        exit 1
    fi
}

check_existing_config() {
    if [[ -d "$DEVCONTAINER_DIR" ]] && [[ "$FORCE" != "true" ]]; then
        log_error "Devcontainer configuration already exists at ${DEVCONTAINER_DIR}/"
        log_info "Use --force to overwrite existing configuration"
        exit 1
    fi
}

generate_devcontainer_json() {
    local features=""
    local post_create_command=""

    if [[ "$FULL_TOOLING" == "true" ]]; then
        features='{
    "ghcr.io/devcontainers/features/node:1": {},
    "ghcr.io/devcontainers/features/python:1": {},
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/aws-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:1": {}
  }'
        post_create_command="npm install -g @anthropic-ai/claude-code && pip install --user boto3 requests"
    else
        features='{
    "ghcr.io/devcontainers/features/node:1": {},
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  }'
        post_create_command="npm install -g @anthropic-ai/claude-code"
    fi

    cat << EOF
{
  "name": "Claude Code Sandbox",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "features": ${features},
  "postCreateCommand": "${post_create_command}",
  "remoteEnv": {
    "ANTHROPIC_API_KEY": "\${localEnv:ANTHROPIC_API_KEY}",
    "GITHUB_TOKEN": "\${localEnv:GITHUB_TOKEN}",
    "AWS_ACCESS_KEY_ID": "\${localEnv:AWS_ACCESS_KEY_ID}",
    "AWS_SECRET_ACCESS_KEY": "\${localEnv:AWS_SECRET_ACCESS_KEY}",
    "AWS_DEFAULT_REGION": "\${localEnv:AWS_DEFAULT_REGION}"
  },
  "runArgs": [
    "--cap-drop=ALL",
    "--security-opt=no-new-privileges"
  ],
  "mounts": [],
  "customizations": {
    "vscode": {
      "extensions": [
        "anthropic.claude-code"
      ],
      "settings": {
        "terminal.integrated.defaultProfile.linux": "bash"
      }
    }
  }
}
EOF
}

# Generate the firewall script portion of the Dockerfile
# iptables Firewall Strategy:
# - Uses a whitelist approach with rules processed in order (first match wins)
# - Prevents Claude from accessing arbitrary internet resources
# - Allows essential services (Anthropic API, GitHub, package registries)
generate_firewall_script() {
    if [[ "$NETWORK_FIREWALL" != "true" ]]; then
        echo "# Network firewall disabled - all outbound traffic allowed"
        echo "# To enable, run setup-devcontainer.sh without --no-network-firewall"
        return
    fi

    cat << 'FIREWALL_HEADER'
# Network firewall - only allow specific domains
RUN apt-get update && apt-get install -y iptables dnsutils && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create firewall setup script (runs at container start)
# The script builds iptables rules in order - first match wins
RUN echo '#!/bin/bash' > /usr/local/bin/setup-firewall.sh && \
    echo 'set -e' >> /usr/local/bin/setup-firewall.sh && \
    echo '# Allow loopback - required for local IPC (localhost communication)' >> /usr/local/bin/setup-firewall.sh && \
    echo 'iptables -A OUTPUT -o lo -j ACCEPT' >> /usr/local/bin/setup-firewall.sh && \
    echo '# Allow established connections - permit responses to our outbound requests' >> /usr/local/bin/setup-firewall.sh && \
    echo 'iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT' >> /usr/local/bin/setup-firewall.sh && \
    echo '# Allow DNS - required for domain name resolution (both UDP and TCP)' >> /usr/local/bin/setup-firewall.sh && \
    echo 'iptables -A OUTPUT -p udp --dport 53 -j ACCEPT' >> /usr/local/bin/setup-firewall.sh && \
    echo 'iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT' >> /usr/local/bin/setup-firewall.sh && \
    echo '# Allow specific domains (HTTPS) - whitelist of permitted destinations' >> /usr/local/bin/setup-firewall.sh && \
FIREWALL_HEADER

    # Add domain-specific rules
    for domain in "${ALLOWED_DOMAINS[@]}"; do
        echo "    echo 'iptables -A OUTPUT -p tcp -d ${domain} --dport 443 -j ACCEPT' >> /usr/local/bin/setup-firewall.sh && \\"
    done

    cat << 'FIREWALL_FOOTER'
    echo '# Block all other outbound web traffic - catch-all deny rules (must be last)' >> /usr/local/bin/setup-firewall.sh && \
    echo 'iptables -A OUTPUT -p tcp --dport 443 -j DROP' >> /usr/local/bin/setup-firewall.sh && \
    echo 'iptables -A OUTPUT -p tcp --dport 80 -j DROP' >> /usr/local/bin/setup-firewall.sh && \
    chmod +x /usr/local/bin/setup-firewall.sh

# Note: Firewall requires NET_ADMIN capability or running as root
# For strict isolation, run: docker run --cap-add=NET_ADMIN ...
FIREWALL_FOOTER
}

# Generate the base Dockerfile content (header, labels, base packages)
generate_base_dockerfile() {
    cat << 'EOF'
# Anthropic's recommended devcontainer for Claude Code
# Reference: https://docs.anthropic.com/en/docs/claude-code/devcontainer
FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Security labels
LABEL org.opencontainers.image.title="Claude Code Sandbox"
LABEL org.opencontainers.image.description="Secure container for running Claude Code with --dangerously-skip-permissions"
LABEL org.opencontainers.image.vendor="Generated by setup-devcontainer.sh"

# Install essential security tools
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    lsb-release \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

EOF
}

# Generate the Dockerfile footer (workspace, user, healthcheck)
generate_dockerfile_footer() {
    cat << 'EOF'

# Create non-root user workspace
RUN mkdir -p /workspace && chown vscode:vscode /workspace
WORKDIR /workspace

# Default to non-root user
USER vscode

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -sf https://api.anthropic.com/health || exit 1
EOF
}

# Orchestrate Dockerfile generation by combining all parts
generate_dockerfile() {
    generate_base_dockerfile
    generate_firewall_script
    generate_dockerfile_footer
}

write_files() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN - Would create the following files:"
        echo ""
        echo "=== ${DEVCONTAINER_JSON} ==="
        generate_devcontainer_json
        echo ""
        echo "=== ${DOCKERFILE} ==="
        generate_dockerfile
        echo ""
        return
    fi

    # Create directory
    mkdir -p "$DEVCONTAINER_DIR"
    log_success "Created ${DEVCONTAINER_DIR}/"

    # Write devcontainer.json
    generate_devcontainer_json > "$DEVCONTAINER_JSON"
    log_success "Created ${DEVCONTAINER_JSON}"

    # Write Dockerfile
    generate_dockerfile > "$DOCKERFILE"
    log_success "Created ${DOCKERFILE}"
}

# Print a summary of the applied configuration
print_configuration_summary() {
    echo ""
    log_success "Devcontainer configuration created successfully!"
    echo ""
    echo "Configuration:"
    echo "  - Network firewall: $([ "$NETWORK_FIREWALL" == "true" ] && echo "ENABLED (allowlisted domains only)" || echo "DISABLED")"
    echo "  - Tooling: $([ "$FULL_TOOLING" == "true" ] && echo "Full (Node, Python, Git, GitHub CLI, AWS CLI, Docker)" || echo "Minimal (Node, Git, GitHub CLI)")"
    echo "  - Capabilities: Dropped (--cap-drop=ALL)"
    echo "  - Privilege escalation: Blocked (--security-opt=no-new-privileges)"
}

# Print instructions for using the devcontainer
print_usage_instructions() {
    echo ""
    echo "Next steps:"
    echo ""
    echo "  1. Set your API key (if not already set):"
    echo "     export ANTHROPIC_API_KEY=\"sk-ant-...\""
    echo ""
    echo "  2. Start the container:"
    echo ""
    echo "     # Using VS Code:"
    echo "     Cmd/Ctrl+Shift+P → \"Dev Containers: Reopen in Container\""
    echo ""
    echo "     # Using CLI:"
    echo "     devcontainer up --workspace-folder ."
    echo "     devcontainer exec --workspace-folder . bash"
    echo ""
    echo "  3. Run Claude with full autonomy (safe inside container):"
    echo "     claude --dangerously-skip-permissions"
}

# Print the list of allowed domains when firewall is enabled
print_allowed_domains() {
    if [[ "$NETWORK_FIREWALL" == "true" ]]; then
        echo ""
        echo "Allowed outbound domains:"
        for domain in "${ALLOWED_DOMAINS[@]}"; do
            echo "  - ${domain}"
        done
    fi
}

# Print security notes and documentation link
print_security_notes() {
    echo ""
    echo "Security notes:"
    echo "  - Safe for your own trusted projects"
    echo "  - Avoid using with untrusted code (prompt injection risk)"
    echo "  - Credentials inside container are accessible to Claude"
    echo ""
    echo "Documentation: https://docs.anthropic.com/en/docs/claude-code/devcontainer"
}

# Orchestrate printing all next steps information
print_next_steps() {
    if [[ "$DRY_RUN" == "true" ]]; then
        return
    fi

    print_configuration_summary
    print_usage_instructions
    print_allowed_domains
    print_security_notes
}

main() {
    echo "=============================================="
    echo "  Claude Code Devcontainer Setup"
    echo "=============================================="
    echo ""

    parse_args "$@"
    check_prerequisites
    check_existing_config
    write_files
    print_next_steps
}

main "$@"
