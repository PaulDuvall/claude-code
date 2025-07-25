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
    printf '%s\n' "${subagents[@]}" | sort
}

AVAILABLE_SUBAGENTS=($(detect_available_subagents))

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
$(printf "    %s\n" "${AVAILABLE_SUBAGENTS[@]}")

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
    local target_config="$SUBAGENTS_DIR/$(basename "$config_file")"
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
    
    # Validate Python is available for JSON processing
    if ! command -v python3 >/dev/null 2>&1; then
        echo -e "${RED}Error: python3 is required for settings update but not found${NC}"
        echo -e "${YELLOW}Please install Python 3 and try again${NC}"
        exit 1
    fi
    
    # Create backup if settings exist
    if [[ -f "$settings_file" ]]; then
        local backup_file="$settings_file.backup.$(date +%Y%m%d_%H%M%S)"
        if ! cp "$settings_file" "$backup_file"; then
            echo -e "${RED}Error: Failed to create backup of settings file${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Settings backup created: $backup_file${NC}"
    fi
    
    # Export environment variables for Python script
    export SETTINGS_FILE="$settings_file"
    export SUBAGENTS_DIR="$SUBAGENTS_DIR"
    export SUBAGENTS_DEPLOYED="$(IFS=','; echo "${subagents_deployed[*]}")"
    
    # Update settings with Python script - enhanced error handling
    python3 << 'EOF'
import json
import os
import sys
import traceback

try:
    settings_file = os.environ.get('SETTINGS_FILE')
    subagents_dir = os.environ.get('SUBAGENTS_DIR')
    subagents_deployed_str = os.environ.get('SUBAGENTS_DEPLOYED', '')
    
    if not all([settings_file, subagents_dir, subagents_deployed_str]):
        print('Error: Missing required environment variables', file=sys.stderr)
        sys.exit(1)
    
    # Parse deployed subagents
    subagents_deployed = [s.strip() for s in subagents_deployed_str.split(',') if s.strip()]
    
    # Read or create settings
    if os.path.exists(settings_file):
        try:
            with open(settings_file, 'r') as f:
                settings = json.load(f)
        except json.JSONDecodeError as e:
            print(f'Error: Invalid JSON in settings file: {e}', file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f'Error reading settings file: {e}', file=sys.stderr)
            sys.exit(1)
    else:
        settings = {}

    # Ensure sub_agents section exists
    if 'sub_agents' not in settings:
        settings['sub_agents'] = {}

    # Add configurations for each deployed sub-agent
    for subagent in subagents_deployed:
        if subagent == 'debug-specialist':
            settings['sub_agents']['debug-specialist'] = {
                'name': 'Debug Specialist',
                'description': 'Expert debugging assistant with persistent context and systematic troubleshooting',
                'config_file': f'{subagents_dir}/debug-specialist.md',
                'context_file': f'{subagents_dir}/debug-context.md',
                'auto_invoke_patterns': [
                    'debug', 'error', 'exception', 'troubleshoot', 'issue', 'bug',
                    'ModuleNotFoundError', 'ImportError', 'SyntaxError', 'TypeError',
                    'AttributeError', 'ValueError', 'RuntimeError'
                ],
                'tools': ['Read', 'Bash', 'Grep', 'Edit', 'Glob'],
                'priority': 'high'
            }
        # Add other sub-agents here as they're implemented
        # elif subagent == 'security-analyst':
        #     settings['sub_agents']['security-analyst'] = { ... }

    # Write updated settings with validation
    try:
        with open(settings_file, 'w') as f:
            json.dump(settings, f, indent=2)
    except Exception as e:
        print(f'Error writing settings file: {e}', file=sys.stderr)
        sys.exit(1)

    print('Settings updated successfully')

except Exception as e:
    print(f'Unexpected error: {e}', file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)
EOF
    local python_exit_code=$?
    
    # Check if Python script executed successfully
    if [[ $python_exit_code -ne 0 ]]; then
        echo -e "${RED}Error: Failed to update settings file${NC}"
        echo -e "${YELLOW}Check the error messages above for details${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Settings updated with sub-agent configurations${NC}"
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

test_installation() {
    local subagents_deployed=("$@")
    
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would test installation${NC}"
        return 0
    fi
    
    echo -e "${BLUE}Testing installation...${NC}"
    
    local all_good=true
    local test_results=()
    
    # Test each deployed sub-agent
    for subagent in "${subagents_deployed[@]}"; do
        local config_file="$SUBAGENTS_DIR/${subagent}.md"
        if [[ -f "$config_file" && -r "$config_file" && -s "$config_file" ]]; then
            echo -e "${GREEN}✓ ${subagent} configuration file exists and is readable${NC}"
            test_results+=("${subagent}: OK")
        else
            echo -e "${RED}✗ ${subagent} configuration file missing, unreadable, or empty${NC}"
            test_results+=("${subagent}: FAILED")
            all_good=false
        fi
    done
    
    # Test settings file
    local settings_file="$CLAUDE_DIR/settings.json"
    if [[ -f "$settings_file" && -r "$settings_file" ]]; then
        # Validate JSON syntax
        if command -v python3 >/dev/null 2>&1; then
            if python3 -m json.tool "$settings_file" >/dev/null 2>&1; then
                echo -e "${GREEN}✓ Settings file exists and contains valid JSON${NC}"
                test_results+=("settings.json: OK")
            else
                echo -e "${RED}✗ Settings file contains invalid JSON${NC}"
                test_results+=("settings.json: INVALID JSON")
                all_good=false
            fi
        else
            echo -e "${GREEN}✓ Settings file exists${NC}"
            test_results+=("settings.json: EXISTS (JSON not validated)")
        fi
    else
        echo -e "${RED}✗ Settings file not found or not readable${NC}"
        test_results+=("settings.json: FAILED")
        all_good=false
    fi
    
    # Test directory structure
    if [[ -d "$SUBAGENTS_DIR" && -w "$SUBAGENTS_DIR" ]]; then
        echo -e "${GREEN}✓ Sub-agents directory is writable${NC}"
        test_results+=("sub-agents directory: OK")
    else
        echo -e "${RED}✗ Sub-agents directory missing or not writable${NC}"
        test_results+=("sub-agents directory: FAILED")
        all_good=false
    fi
    
    # Summary
    if [[ "$all_good" == true ]]; then
        echo -e "${GREEN}✓ All installation tests passed${NC}"
        return 0
    else
        echo -e "${RED}✗ Installation test failed${NC}"
        echo -e "${YELLOW}Test Results Summary:${NC}"
        printf '  %s\n' "${test_results[@]}"
        return 1
    fi
}

print_success_message() {
    local subagents_deployed=("$@")
    
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Deployment preview completed${NC}"
        return
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Sub-Agent(s) deployed successfully!${NC}"
    echo ""
    echo "Deployed sub-agents:"
    for subagent in "${subagents_deployed[@]}"; do
        echo "  • $subagent"
    done
    echo ""
    echo "Usage:"
    echo "  • Automatic: Sub-agents will be invoked based on trigger patterns"
    echo "  • Manual: @[subagent-name] [your request]"
    echo "  • Via slash commands: Complex issues will be automatically delegated"
    echo ""
    echo -e "${BLUE}Sub-agent files location: $SUBAGENTS_DIR${NC}"
    echo -e "${BLUE}Settings file: $CLAUDE_DIR/settings.json${NC}"
}

cleanup_on_error() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        echo ""
        echo -e "${RED}Deployment failed with exit code: $exit_code${NC}"
        echo -e "${YELLOW}You may need to manually clean up partial installations${NC}"
        echo -e "${BLUE}Check: $SUBAGENTS_DIR${NC}"
        echo -e "${BLUE}Check: $CLAUDE_DIR/settings.json${NC}"
        echo ""
        echo "For troubleshooting, run: ./deploy-subagents.sh --help"
    fi
}

# Set up error cleanup
trap cleanup_on_error ERR

validate_environment() {
    local errors=()
    
    # Check if source directory exists
    if [[ ! -d "$SUBAGENTS_SOURCE_DIR" ]]; then
        errors+=("Sub-agents source directory not found: $SUBAGENTS_SOURCE_DIR")
    fi
    
    # Check if we're in the right directory structure
    if [[ ! -f "$SCRIPT_DIR/CLAUDE.md" ]]; then
        errors+=("Not running from claude-code repository root (CLAUDE.md not found)")
    fi
    
    # Check required commands
    local required_commands=("python3" "cp" "mkdir" "grep" "find")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            errors+=("Required command not found: $cmd")
        fi
    done
    
    # Check home directory is writable
    if [[ ! -w "$HOME" ]]; then
        errors+=("Home directory is not writable: $HOME")
    fi
    
    # Report errors if any
    if [[ ${#errors[@]} -gt 0 ]]; then
        echo -e "${RED}Environment validation failed:${NC}"
        printf '  %s\n' "${errors[@]}"
        echo ""
        echo -e "${YELLOW}Please fix these issues and try again.${NC}"
        exit 1
    fi
}

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