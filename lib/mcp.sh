#!/usr/bin/env bash
# MCP server configuration for Claude Code

##################################
# Check Docker Availability
##################################
is_docker_available() {
    command -v docker &> /dev/null && docker info > /dev/null 2>&1
}

##################################
# Setup MCP Puppeteer Server
##################################
setup_mcp_puppeteer() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would pull Docker image and configure MCP server"
        return
    fi

    echo "Setting up MCP Puppeteer server..."
    
    # Pull the container
    if ! docker pull mcp/puppeteer; then
        error "Failed to pull MCP Puppeteer Docker image"
        return 1
    fi

    # Configure MCP server
    local mcp_json
    read -r -d '' mcp_json <<'EOF'
{
  "command": "docker",
  "args": ["run", "-i", "--rm", "--init", "-e", "DOCKER_CONTAINER=true", "mcp/puppeteer"]
}
EOF

    # Add the MCP server configuration
    if ! claude mcp add-json puppeteer "$mcp_json"; then
        error "Failed to configure MCP Puppeteer server"
        return 1
    fi
    
    # List configured servers
    echo "Configured MCP servers:"
    claude mcp list
    
    log "✓ MCP Puppeteer server configured successfully"
}

##################################
# Main MCP Setup
##################################
setup_mcp_servers() {
    if ! is_docker_available; then
        echo "Docker Desktop is not running. Skipping MCP server setup."
        echo "To use MCP servers, please start Docker Desktop and re-run this section."
        return
    fi
    
    echo "Docker is available, setting up MCP servers..."
    setup_mcp_puppeteer
}