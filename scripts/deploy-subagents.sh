#!/bin/bash

# Deploy Claude Code Sub-Agents
# Generic script to deploy one or more sub-agents for Claude Code integration

set -euo pipefail  # Exit on error, undefined vars, pipe failures
IFS=$'\n\t'       # Secure internal field separator

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUBAGENTS_SOURCE_DIR="$SCRIPT_DIR/sub-agents"
CLAUDE_DIR="$HOME/.claude"
SUBAGENTS_DIR="$CLAUDE_DIR/sub-agents"

# Source helper functions
source "$SCRIPT_DIR/deploy-subagents-helpers.sh"

# Available sub-agents - dynamically detect from source directory
detect_available_subagents() {
    local subagents=()
    if [[ -d "$SUBAGENTS_SOURCE_DIR" ]]; then
        while IFS= read -r -d '' file; do
            local basename
            basename=$(basename "$file" .md)
            # Skip context files (they have -context suffix)
            if [[ ! "$basename" =~ -context$ ]]; then
                subagents+=("$basename")
            fi
        done < <(find "$SUBAGENTS_SOURCE_DIR" -name "*.md" -print0 2>/dev/null)
    fi
    if [ ${#subagents[@]} -gt 0 ]; then
        printf '%s\n' "${subagents[@]}" | sort
    fi
}

AVAILABLE_SUBAGENTS_OUTPUT=$(detect_available_subagents)
if [ -n "$AVAILABLE_SUBAGENTS_OUTPUT" ]; then
    AVAILABLE_SUBAGENTS=($AVAILABLE_SUBAGENTS_OUTPUT)
else
    AVAILABLE_SUBAGENTS=()
fi

# Default values
DRY_RUN=false
DEPLOY_ALL=false
SPECIFIC_SUBAGENTS=()
LIST_ONLY=false

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy Claude Code Sub-Agents with flexible options.

OPTIONS:
    --all                   Deploy all available sub-agents
    --include NAME          Deploy specific sub-agent (can be used multiple times)
    --list                  List all available sub-agents
    --dry-run              Preview what would be deployed without making changes
    --help                 Show this help message

EXAMPLES:
    $0 --all                                    # Deploy all sub-agents
    $0 --include debug-specialist              # Deploy only debug specialist
    $0 --include debug-specialist --include security-analyst  # Deploy multiple specific sub-agents
    $0 --list                                  # List available sub-agents
    $0 --all --dry-run                         # Preview all deployments

AVAILABLE SUB-AGENTS:
$(if [ ${#AVAILABLE_SUBAGENTS[@]} -gt 0 ]; then printf "    %s\n" "${AVAILABLE_SUBAGENTS[@]}"; else echo "    (No sub-agents found)"; fi)

EOF
}

list_subagents() {
    echo -e "${BLUE}📋 Available Sub-Agents:${NC}"
    echo "========================="
    
    if [[ ${#AVAILABLE_SUBAGENTS[@]} -eq 0 ]]; then
        echo -e "${YELLOW}No sub-agents found in $SUBAGENTS_SOURCE_DIR${NC}"
        return 0
    fi
    
    for subagent in "${AVAILABLE_SUBAGENTS[@]}"; do
        local config_file="$SUBAGENTS_SOURCE_DIR/${subagent}.md"
        if [[ -f "$config_file" ]]; then
            # Extract description from the config file with error handling
            local description
            description=$(grep -m1 "^## Agent Description" -A1 "$config_file" 2>/dev/null | tail -n1 | sed 's/^[[:space:]]*//' || echo "")
            if [[ -z "$description" ]]; then
                # Try alternative description patterns
                description=$(grep -m1 "^Specialized\|^Expert\|^.*assistant" "$config_file" 2>/dev/null | head -n1 | sed 's/^[[:space:]]*//' || echo "Sub-agent configuration file")
            fi
            echo -e "  ${GREEN}${subagent}${NC} - $description"
        else
            echo -e "  ${RED}${subagent}${NC} - Configuration file missing"
        fi
    done
    echo ""
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --all)
                DEPLOY_ALL=true
                shift
                ;;
            --include)
                if [[ -n "$2" && "$2" != --* ]]; then
                    SPECIFIC_SUBAGENTS+=("$2")
                    shift 2
                else
                    echo -e "${RED}Error: --include requires a sub-agent name${NC}"
                    exit 1
                fi
                ;;
            --list)
                LIST_ONLY=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help)
                usage
                exit 0
                ;;
            *)
                echo -e "${RED}Error: Unknown option $1${NC}"
                usage
                exit 1
                ;;
        esac
    done
}

validate_subagent() {
    local subagent="$1"
    local found=false
    
    # Check if we have any available sub-agents
    if [[ ${#AVAILABLE_SUBAGENTS[@]} -eq 0 ]]; then
        echo -e "${RED}Error: No sub-agents available in $SUBAGENTS_SOURCE_DIR${NC}"
        echo -e "${YELLOW}Please ensure sub-agent configuration files exist in the source directory${NC}"
        exit 1
    fi
    
    for available in "${AVAILABLE_SUBAGENTS[@]}"; do
        if [[ "$available" == "$subagent" ]]; then
            found=true
            break
        fi
    done
    
    if [[ "$found" != true ]]; then
        echo -e "${RED}Error: Sub-agent '$subagent' not found${NC}"
        echo -e "${YELLOW}Available sub-agents:${NC}"
        printf "  %s\n" "${AVAILABLE_SUBAGENTS[@]}"
        exit 1
    fi
    
    # Validate that the configuration file exists and is readable
    local config_file="$SUBAGENTS_SOURCE_DIR/${subagent}.md"
    if [[ ! -f "$config_file" ]]; then
        echo -e "${RED}Error: Configuration file not found: $config_file${NC}"
        exit 1
    fi
    
    if [[ ! -r "$config_file" ]]; then
        echo -e "${RED}Error: Configuration file not readable: $config_file${NC}"
        exit 1
    fi
}

get_subagents_to_deploy() {
    local subagents_to_deploy=()
    
    # Check if we have any available sub-agents first
    if [[ ${#AVAILABLE_SUBAGENTS[@]} -eq 0 ]]; then
        echo -e "${RED}Error: No sub-agents found in $SUBAGENTS_SOURCE_DIR${NC}" >&2
        exit 1
    fi
    
    if [[ "$DEPLOY_ALL" == true ]]; then
        subagents_to_deploy=("${AVAILABLE_SUBAGENTS[@]}")
    elif [[ ${#SPECIFIC_SUBAGENTS[@]} -gt 0 ]]; then
        for subagent in "${SPECIFIC_SUBAGENTS[@]}"; do
            validate_subagent "$subagent"  # This will exit on error
            subagents_to_deploy+=("$subagent")
        done
    else
        # Default: deploy debug-specialist if available, otherwise first available
        if printf '%s\n' "${AVAILABLE_SUBAGENTS[@]}" | grep -q "^debug-specialist$"; then
            subagents_to_deploy=("debug-specialist")
        else
            subagents_to_deploy=("${AVAILABLE_SUBAGENTS[0]}")
            echo -e "${YELLOW}Warning: debug-specialist not found, deploying ${AVAILABLE_SUBAGENTS[0]} instead${NC}" >&2
        fi
    fi
    
    printf '%s\n' "${subagents_to_deploy[@]}"
}

setup_directories() {
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would create directories:${NC}"
        echo "  - $SUBAGENTS_DIR"
        return
    fi
    
    # Validate CLAUDE_DIR exists and is writable
    if [[ ! -d "$CLAUDE_DIR" ]]; then
        echo -e "${YELLOW}Creating Claude Code directory: $CLAUDE_DIR${NC}"
        if ! mkdir -p "$CLAUDE_DIR"; then
            echo -e "${RED}Error: Cannot create Claude Code directory: $CLAUDE_DIR${NC}"
            echo -e "${YELLOW}Please check permissions and try again${NC}"
            exit 1
        fi
    fi
    
    if [[ ! -w "$CLAUDE_DIR" ]]; then
        echo -e "${RED}Error: Claude Code directory is not writable: $CLAUDE_DIR${NC}"
        echo -e "${YELLOW}Please check permissions and try again${NC}"
        exit 1
    fi
    
    # Create sub-agents directory
    if [[ ! -d "$SUBAGENTS_DIR" ]]; then
        echo -e "${YELLOW}Creating sub-agents directory...${NC}"
        if ! mkdir -p "$SUBAGENTS_DIR"; then
            echo -e "${RED}Error: Cannot create sub-agents directory: $SUBAGENTS_DIR${NC}"
            exit 1
        fi
    fi
}

deploy_subagent() {
    local subagent="$1"
    local config_file="$SUBAGENTS_SOURCE_DIR/${subagent}.md"
    local context_file="$SUBAGENTS_SOURCE_DIR/${subagent%%-*}-context.md"
    
    echo -e "${BLUE}Deploying ${subagent} sub-agent...${NC}"
    
    # Validate source files
    if [[ ! -f "$config_file" ]]; then
        echo -e "${RED}✗ Configuration file not found: $config_file${NC}"
        return 1
    fi
    
    if [[ ! -r "$config_file" ]]; then
        echo -e "${RED}✗ Configuration file not readable: $config_file${NC}"
        return 1
    fi
    
    # Validate file content (basic check)
    if [[ ! -s "$config_file" ]]; then
        echo -e "${RED}✗ Configuration file is empty: $config_file${NC}"
        return 1
    fi
    
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would copy:${NC}"
        echo "  - $config_file → $SUBAGENTS_DIR/"
        if [[ -f "$context_file" ]]; then
            echo "  - $context_file → $SUBAGENTS_DIR/"
        fi
        return 0
    fi
    
    # Copy configuration files with error handling
    if ! cp "$config_file" "$SUBAGENTS_DIR/"; then
        echo -e "${RED}✗ Failed to copy configuration file${NC}"
        return 1
    fi
    
    if [[ -f "$context_file" ]]; then
        if [[ -r "$context_file" ]] && [[ -s "$context_file" ]]; then
            if ! cp "$context_file" "$SUBAGENTS_DIR/"; then
                echo -e "${YELLOW}⚠ Failed to copy context file (non-critical): $context_file${NC}"
            fi
        else
            echo -e "${YELLOW}⚠ Context file exists but is not readable or empty: $context_file${NC}"
        fi
    fi
    
    # Verify files were copied successfully
    local target_config
    target_config="$SUBAGENTS_DIR/$(basename "$config_file")"
    if [[ ! -f "$target_config" ]]; then
        echo -e "${RED}✗ Configuration file was not copied successfully${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✓ ${subagent} sub-agent files installed${NC}"
    return 0
}

update_settings() {
    local subagents_deployed=("$@")
    local settings_file="$CLAUDE_DIR/settings.json"

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would update settings file: $settings_file${NC}"
        return
    fi

    echo -e "${BLUE}Updating Claude Code settings...${NC}"

    if ! command -v python3 >/dev/null 2>&1; then
        echo -e "${RED}Error: python3 is required but not found${NC}"
        exit 1
    fi

    # Create backup if settings exist
    if [[ -f "$settings_file" ]]; then
        local backup_file
        backup_file="$settings_file.backup.$(date +%Y%m%d_%H%M%S)"
        if ! cp "$settings_file" "$backup_file"; then
            echo -e "${RED}Error: Failed to create backup of settings file${NC}"
            exit 1
        fi
        echo -e "${GREEN}Settings backup created: $backup_file${NC}"
    fi

    # Call external Python script
    export SETTINGS_FILE="$settings_file"
    export SUBAGENTS_DIR="$SUBAGENTS_DIR"
    export SUBAGENTS_DEPLOYED
    SUBAGENTS_DEPLOYED="$(IFS=','; echo "${subagents_deployed[*]}")"

    if ! python3 "$SCRIPT_DIR/update-subagent-settings.py"; then
        echo -e "${RED}Error: Failed to update settings file${NC}"
        exit 1
    fi

    echo -e "${GREEN}Settings updated with sub-agent configurations${NC}"
}

create_session_directories() {
    local subagents_deployed=("$@")
    
    for subagent in "${subagents_deployed[@]}"; do
        if [[ "$subagent" == "debug-specialist" ]]; then
            local sessions_dir="$CLAUDE_DIR/debug-sessions"
            
            if [[ "$DRY_RUN" == true ]]; then
                echo -e "${BLUE}[DRY RUN] Would create: $sessions_dir${NC}"
                continue
            fi
            
            if [[ ! -d "$sessions_dir" ]]; then
                mkdir -p "$sessions_dir"
                echo -e "${GREEN}✓ Debug sessions directory created${NC}"
            fi
        fi
        # Add session directories for other sub-agents as needed
    done
}

# Helper functions sourced from deploy-subagents-helpers.sh:
# test_installation, print_success_message, cleanup_on_error, validate_environment

# Set up error cleanup
trap cleanup_on_error ERR

main() {
    # Parse arguments first
    parse_arguments "$@"
    
    # Validate environment before proceeding
    validate_environment
    
    if [[ "$LIST_ONLY" == true ]]; then
        list_subagents
        exit 0
    fi
    
    echo -e "${BLUE}🔧 Deploying Claude Code Sub-Agents${NC}"
    echo "========================================="
    
    # Get list of sub-agents to deploy
    local subagents_to_deploy_str
    subagents_to_deploy_str=$(get_subagents_to_deploy)
    local subagents_to_deploy
    IFS=$'\n' read -rd '' -a subagents_to_deploy <<< "$subagents_to_deploy_str" || true
    
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}DRY RUN MODE - No changes will be made${NC}"
    fi
    
    echo "Sub-agents to deploy: ${subagents_to_deploy[*]}"
    echo ""
    
    # Setup directories
    setup_directories
    
    # Deploy each sub-agent with error handling
    local deployed_subagents=()
    local deployment_failed=false
    
    for subagent in "${subagents_to_deploy[@]}"; do
        if deploy_subagent "$subagent"; then
            deployed_subagents+=("$subagent")
        else
            echo -e "${RED}Failed to deploy $subagent${NC}"
            deployment_failed=true
            break
        fi
    done
    
    # Check if any deployments failed
    if [[ "$deployment_failed" == true ]]; then
        echo -e "${RED}Deployment failed. Exiting without updating settings.${NC}"
        exit 1
    fi
    
    # Only proceed if we have successfully deployed sub-agents
    if [[ ${#deployed_subagents[@]} -eq 0 ]]; then
        echo -e "${RED}No sub-agents were deployed successfully${NC}"
        exit 1
    fi
    
    # Update settings
    if ! update_settings "${deployed_subagents[@]}"; then
        echo -e "${RED}Failed to update settings${NC}"
        exit 1
    fi
    
    # Create session directories
    if ! create_session_directories "${deployed_subagents[@]}"; then
        echo -e "${YELLOW}Warning: Failed to create some session directories${NC}"
    fi
    
    # Test installation
    if ! test_installation "${deployed_subagents[@]}"; then
        echo -e "${RED}Installation test failed${NC}"
        exit 1
    fi
    
    # Success message
    print_success_message "${deployed_subagents[@]}"
}

# Check if running directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi