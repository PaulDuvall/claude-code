#!/bin/bash

# Deploy Subagents Helper Functions
#
# Provides validation, testing, and utility functions
# for the deploy-subagents.sh script.
# Extracted from deploy-subagents.sh.

# Include guard
[[ -n "${_DEPLOY_HELPERS_LOADED:-}" ]] && return 0
_DEPLOY_HELPERS_LOADED=1

validate_environment() {
    local errors=()

    if [[ ! -d "$SUBAGENTS_SOURCE_DIR" ]]; then
        errors+=("Sub-agents source directory not found: $SUBAGENTS_SOURCE_DIR")
    fi

    if [[ ! -f "$SCRIPT_DIR/CLAUDE.md" ]]; then
        errors+=("Not running from claude-code repository root (CLAUDE.md not found)")
    fi

    local required_commands=("python3" "cp" "mkdir" "grep" "find")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            errors+=("Required command not found: $cmd")
        fi
    done

    if [[ ! -w "$HOME" ]]; then
        errors+=("Home directory is not writable: $HOME")
    fi

    if [[ ${#errors[@]} -gt 0 ]]; then
        echo -e "${RED}Environment validation failed:${NC}"
        printf '  %s\n' "${errors[@]}"
        echo ""
        echo -e "${YELLOW}Please fix these issues and try again.${NC}"
        exit 1
    fi
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

    for subagent in "${subagents_deployed[@]}"; do
        local config_file="$SUBAGENTS_DIR/${subagent}.md"
        if [[ -f "$config_file" && -r "$config_file" && -s "$config_file" ]]; then
            echo -e "${GREEN}OK ${subagent} configuration file${NC}"
            test_results+=("${subagent}: OK")
        else
            echo -e "${RED}FAIL ${subagent} configuration file${NC}"
            test_results+=("${subagent}: FAILED")
            all_good=false
        fi
    done

    test_settings_file
    local settings_ok=$?
    [[ $settings_ok -ne 0 ]] && all_good=false

    test_directory_structure
    local dir_ok=$?
    [[ $dir_ok -ne 0 ]] && all_good=false

    if [[ "$all_good" == true ]]; then
        echo -e "${GREEN}All installation tests passed${NC}"
        return 0
    fi

    echo -e "${RED}Installation test failed${NC}"
    return 1
}

test_settings_file() {
    local settings_file="$CLAUDE_DIR/settings.json"
    if [[ ! -f "$settings_file" || ! -r "$settings_file" ]]; then
        echo -e "${RED}FAIL Settings file not found${NC}"
        return 1
    fi

    if command -v python3 >/dev/null 2>&1; then
        if python3 -m json.tool "$settings_file" >/dev/null 2>&1; then
            echo -e "${GREEN}OK Settings file valid JSON${NC}"
            return 0
        fi
        echo -e "${RED}FAIL Settings file invalid JSON${NC}"
        return 1
    fi

    echo -e "${GREEN}OK Settings file exists${NC}"
    return 0
}

test_directory_structure() {
    if [[ -d "$SUBAGENTS_DIR" && -w "$SUBAGENTS_DIR" ]]; then
        echo -e "${GREEN}OK Sub-agents directory writable${NC}"
        return 0
    fi
    echo -e "${RED}FAIL Sub-agents directory missing or not writable${NC}"
    return 1
}

print_success_message() {
    local subagents_deployed=("$@")

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Deployment preview completed${NC}"
        return
    fi

    echo ""
    echo -e "${GREEN}Sub-Agent(s) deployed successfully!${NC}"
    echo ""
    echo "Deployed sub-agents:"
    for subagent in "${subagents_deployed[@]}"; do
        echo "  - $subagent"
    done
    echo ""
    echo "Usage:"
    echo "  Automatic: Sub-agents will be invoked based on trigger patterns"
    echo "  Manual: @[subagent-name] [your request]"
    echo ""
    echo -e "${BLUE}Sub-agent files location: $SUBAGENTS_DIR${NC}"
    echo -e "${BLUE}Settings file: $CLAUDE_DIR/settings.json${NC}"
}

cleanup_on_error() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        echo ""
        echo -e "${RED}Deployment failed with exit code: $exit_code${NC}"
        echo -e "${YELLOW}You may need to manually clean up:${NC}"
        echo -e "${BLUE}  $SUBAGENTS_DIR${NC}"
        echo -e "${BLUE}  $CLAUDE_DIR/settings.json${NC}"
        echo ""
        echo "For troubleshooting, run: ./deploy-subagents.sh --help"
    fi
}
