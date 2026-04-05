#!/bin/bash

# Deploy Claude Code Sub-Agents
# Generic script to deploy one or more sub-agents for Claude Code integration

set -euo pipefail
IFS=$'\n\t'

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUBAGENTS_SOURCE_DIR="$SCRIPT_DIR/sub-agents"
CLAUDE_DIR="$HOME/.claude"
SUBAGENTS_DIR="$CLAUDE_DIR/sub-agents"

# Default values
DRY_RUN=false
DEPLOY_ALL=false
SPECIFIC_SUBAGENTS=()
LIST_ONLY=false

##################################
# Subagent Discovery
##################################
detect_available_subagents() {
    local subagents=()
    if [[ -d "$SUBAGENTS_SOURCE_DIR" ]]; then
        while IFS= read -r -d '' file; do
            local name
            name=$(basename "$file" .md)
            [[ "$name" =~ -context$ ]] && continue
            subagents+=("$name")
        done < <(find "$SUBAGENTS_SOURCE_DIR" -name "*.md" -print0 2>/dev/null)
    fi
    if [[ ${#subagents[@]} -gt 0 ]]; then
        printf '%s\n' "${subagents[@]}" | sort
    fi
}

AVAILABLE_SUBAGENTS_OUTPUT=$(detect_available_subagents)
if [[ -n "$AVAILABLE_SUBAGENTS_OUTPUT" ]]; then
    AVAILABLE_SUBAGENTS=($AVAILABLE_SUBAGENTS_OUTPUT)
else
    AVAILABLE_SUBAGENTS=()
fi

##################################
# Usage and Listing
##################################
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
    $0 --all
    $0 --include debug-specialist
    $0 --include debug-specialist --include security-analyst
    $0 --list
    $0 --all --dry-run

AVAILABLE SUB-AGENTS:
$(if [[ ${#AVAILABLE_SUBAGENTS[@]} -gt 0 ]]; then printf "    %s\n" "${AVAILABLE_SUBAGENTS[@]}"; else echo "    (No sub-agents found)"; fi)

EOF
}

list_subagents() {
    echo -e "${BLUE}Available Sub-Agents:${NC}"
    echo "========================="

    if [[ ${#AVAILABLE_SUBAGENTS[@]} -eq 0 ]]; then
        echo -e "${YELLOW}No sub-agents found in $SUBAGENTS_SOURCE_DIR${NC}"
        return 0
    fi

    for subagent in "${AVAILABLE_SUBAGENTS[@]}"; do
        local config_file="$SUBAGENTS_SOURCE_DIR/${subagent}.md"
        if [[ -f "$config_file" ]]; then
            local description
            description=$(grep -m1 "^## Agent Description" -A1 "$config_file" 2>/dev/null | tail -n1 | sed 's/^[[:space:]]*//' || echo "")
            if [[ -z "$description" ]]; then
                description=$(grep -m1 "^Specialized\|^Expert\|^.*assistant" "$config_file" 2>/dev/null | head -n1 | sed 's/^[[:space:]]*//' || echo "Sub-agent configuration file")
            fi
            echo -e "  ${GREEN}${subagent}${NC} - $description"
        else
            echo -e "  ${RED}${subagent}${NC} - Configuration file missing"
        fi
    done
    echo ""
}

##################################
# Argument Parsing
##################################
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --all)       DEPLOY_ALL=true; shift ;;
            --include)
                if [[ -n "${2:-}" && "$2" != --* ]]; then
                    SPECIFIC_SUBAGENTS+=("$2"); shift 2
                else
                    echo -e "${RED}Error: --include requires a sub-agent name${NC}"; exit 1
                fi ;;
            --list)      LIST_ONLY=true; shift ;;
            --dry-run)   DRY_RUN=true; shift ;;
            --help)      usage; exit 0 ;;
            *)           echo -e "${RED}Error: Unknown option $1${NC}"; usage; exit 1 ;;
        esac
    done
}

##################################
# Environment Validation
##################################
validate_environment() {
    local errors=()

    [[ ! -d "$SUBAGENTS_SOURCE_DIR" ]] && errors+=("Sub-agents source directory not found: $SUBAGENTS_SOURCE_DIR")
    [[ ! -f "$SCRIPT_DIR/CLAUDE.md" ]] && errors+=("Not running from claude-code repository root")

    for cmd in python3 cp mkdir grep find; do
        command -v "$cmd" >/dev/null 2>&1 || errors+=("Required command not found: $cmd")
    done

    [[ ! -w "$HOME" ]] && errors+=("Home directory is not writable: $HOME")

    if [[ ${#errors[@]} -gt 0 ]]; then
        echo -e "${RED}Environment validation failed:${NC}"
        printf '  %s\n' "${errors[@]}"
        exit 1
    fi
}

##################################
# Deployment Selection
##################################
get_subagents_to_deploy() {
    if [[ ${#AVAILABLE_SUBAGENTS[@]} -eq 0 ]]; then
        echo -e "${RED}Error: No sub-agents found in $SUBAGENTS_SOURCE_DIR${NC}" >&2
        exit 1
    fi

    if [[ "$DEPLOY_ALL" == true ]]; then
        printf '%s\n' "${AVAILABLE_SUBAGENTS[@]}"
        return
    fi

    if [[ ${#SPECIFIC_SUBAGENTS[@]} -gt 0 ]]; then
        for subagent in "${SPECIFIC_SUBAGENTS[@]}"; do
            # Validate subagent exists in available list
            local found=false
            for available in "${AVAILABLE_SUBAGENTS[@]}"; do
                [[ "$available" == "$subagent" ]] && found=true && break
            done
            if [[ "$found" != true ]]; then
                echo -e "${RED}Error: Sub-agent '$subagent' not found${NC}" >&2
                echo -e "${YELLOW}Available: ${AVAILABLE_SUBAGENTS[*]}${NC}" >&2
                exit 1
            fi
            # Validate config file exists and is readable
            local config_file="$SUBAGENTS_SOURCE_DIR/${subagent}.md"
            if [[ ! -f "$config_file" ]] || [[ ! -r "$config_file" ]]; then
                echo -e "${RED}Error: Configuration not found or unreadable: $config_file${NC}" >&2
                exit 1
            fi
            echo "$subagent"
        done
        return
    fi

    # Default: deploy debug-specialist if available, otherwise first available
    if printf '%s\n' "${AVAILABLE_SUBAGENTS[@]}" | grep -q "^debug-specialist$"; then
        echo "debug-specialist"
    else
        echo "${AVAILABLE_SUBAGENTS[0]}"
        echo -e "${YELLOW}Warning: debug-specialist not found, deploying ${AVAILABLE_SUBAGENTS[0]}${NC}" >&2
    fi
}

##################################
# Directory Setup
##################################
setup_directories() {
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would create: $SUBAGENTS_DIR${NC}"
        return
    fi

    mkdir -p "$CLAUDE_DIR" "$SUBAGENTS_DIR" || {
        echo -e "${RED}Error: Cannot create directories${NC}"; exit 1
    }
}

##################################
# Deployment
##################################
deploy_subagent() {
    local subagent="$1"
    local config_file="$SUBAGENTS_SOURCE_DIR/${subagent}.md"
    local context_file="$SUBAGENTS_SOURCE_DIR/${subagent%%-*}-context.md"

    echo -e "${BLUE}Deploying ${subagent}...${NC}"

    if [[ ! -f "$config_file" ]] || [[ ! -r "$config_file" ]] || [[ ! -s "$config_file" ]]; then
        echo -e "${RED}✗ Configuration file invalid: $config_file${NC}"
        return 1
    fi

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would copy: $config_file → $SUBAGENTS_DIR/${NC}"
        [[ -f "$context_file" ]] && echo -e "${BLUE}[DRY RUN] Would copy: $context_file → $SUBAGENTS_DIR/${NC}"
        return 0
    fi

    cp "$config_file" "$SUBAGENTS_DIR/" || { echo -e "${RED}✗ Failed to copy config${NC}"; return 1; }

    if [[ -f "$context_file" ]] && [[ -r "$context_file" ]] && [[ -s "$context_file" ]]; then
        cp "$context_file" "$SUBAGENTS_DIR/" 2>/dev/null || echo -e "${YELLOW}⚠ Context file copy failed (non-critical)${NC}"
    fi

    [[ -f "$SUBAGENTS_DIR/$(basename "$config_file")" ]] || { echo -e "${RED}✗ Copy verification failed${NC}"; return 1; }

    echo -e "${GREEN}✓ ${subagent} installed${NC}"
}

update_settings() {
    local subagents_deployed=("$@")
    local settings_file="$CLAUDE_DIR/settings.json"

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would update: $settings_file${NC}"
        return
    fi

    echo -e "${BLUE}Updating settings...${NC}"

    if ! command -v python3 >/dev/null 2>&1; then
        echo -e "${RED}Error: python3 required${NC}"; exit 1
    fi

    # Backup existing settings
    if [[ -f "$settings_file" ]]; then
        cp "$settings_file" "$settings_file.backup.$(date +%Y%m%d_%H%M%S)" || {
            echo -e "${RED}Error: Failed to backup settings${NC}"; exit 1
        }
    fi

    export SETTINGS_FILE="$settings_file"
    export SUBAGENTS_DIR="$SUBAGENTS_DIR"
    export SUBAGENTS_DEPLOYED
    SUBAGENTS_DEPLOYED="$(IFS=','; echo "${subagents_deployed[*]}")"

    python3 "$SCRIPT_DIR/update-subagent-settings.py" || {
        echo -e "${RED}Error: Failed to update settings${NC}"; exit 1
    }

    echo -e "${GREEN}Settings updated${NC}"
}

##################################
# Installation Testing
##################################
test_installation() {
    local subagents_deployed=("$@")

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would test installation${NC}"
        return 0
    fi

    echo -e "${BLUE}Testing installation...${NC}"
    local all_good=true

    for subagent in "${subagents_deployed[@]}"; do
        local config_file="$SUBAGENTS_DIR/${subagent}.md"
        if [[ -f "$config_file" && -r "$config_file" && -s "$config_file" ]]; then
            echo -e "${GREEN}OK ${subagent}${NC}"
        else
            echo -e "${RED}FAIL ${subagent}${NC}"
            all_good=false
        fi
    done

    # Check settings file
    local settings_file="$CLAUDE_DIR/settings.json"
    if [[ -f "$settings_file" ]]; then
        if command -v python3 >/dev/null 2>&1 && python3 -m json.tool "$settings_file" >/dev/null 2>&1; then
            echo -e "${GREEN}OK Settings file valid${NC}"
        else
            echo -e "${RED}FAIL Settings file invalid${NC}"
            all_good=false
        fi
    fi

    # Check directory
    if [[ -d "$SUBAGENTS_DIR" && -w "$SUBAGENTS_DIR" ]]; then
        echo -e "${GREEN}OK Sub-agents directory${NC}"
    else
        echo -e "${RED}FAIL Sub-agents directory${NC}"
        all_good=false
    fi

    [[ "$all_good" == true ]]
}

print_success_message() {
    local subagents_deployed=("$@")

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Preview completed${NC}"
        return
    fi

    echo ""
    echo -e "${GREEN}Sub-Agent(s) deployed successfully!${NC}"
    echo "Deployed: ${subagents_deployed[*]}"
    echo ""
    echo "Usage:"
    echo "  Automatic: Sub-agents invoked based on trigger patterns"
    echo "  Manual: @[subagent-name] [your request]"
    echo ""
    echo -e "${BLUE}Files: $SUBAGENTS_DIR${NC}"
    echo -e "${BLUE}Settings: $CLAUDE_DIR/settings.json${NC}"
}

##################################
# Error Cleanup
##################################
cleanup_on_error() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        echo -e "${RED}Deployment failed (exit $exit_code)${NC}"
        echo "For help: $0 --help"
    fi
}

trap cleanup_on_error ERR

##################################
# Main
##################################
main() {
    parse_arguments "$@"
    validate_environment

    if [[ "$LIST_ONLY" == true ]]; then
        list_subagents
        exit 0
    fi

    echo -e "${BLUE}Deploying Claude Code Sub-Agents${NC}"
    echo "========================================="

    local subagents_to_deploy_str
    subagents_to_deploy_str=$(get_subagents_to_deploy)
    local subagents_to_deploy
    IFS=$'\n' read -rd '' -a subagents_to_deploy <<< "$subagents_to_deploy_str" || true

    [[ "$DRY_RUN" == true ]] && echo -e "${YELLOW}DRY RUN MODE${NC}"
    echo "Deploying: ${subagents_to_deploy[*]}"
    echo ""

    setup_directories

    local deployed_subagents=()
    for subagent in "${subagents_to_deploy[@]}"; do
        if deploy_subagent "$subagent"; then
            deployed_subagents+=("$subagent")
        else
            echo -e "${RED}Failed to deploy $subagent${NC}"
            exit 1
        fi
    done

    if [[ ${#deployed_subagents[@]} -eq 0 ]]; then
        echo -e "${RED}No sub-agents deployed${NC}"
        exit 1
    fi

    update_settings "${deployed_subagents[@]}" || { echo -e "${RED}Settings update failed${NC}"; exit 1; }
    test_installation "${deployed_subagents[@]}" || { echo -e "${RED}Installation test failed${NC}"; exit 1; }
    print_success_message "${deployed_subagents[@]}"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
