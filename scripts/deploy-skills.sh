#!/usr/bin/env bash

# Deploy Claude Code Skills
# Copies versioned skills from this repo's skills/ directory into the user's
# ~/.claude/skills/ so local Claude Code picks them up. Idempotent: existing
# skills are backed up before being overwritten.
#
# A "skill" is a directory under skills/ that contains a SKILL.md file.

set -euo pipefail
IFS=$'\n\t'

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILLS_SOURCE_DIR="$REPO_ROOT/skills"
CLAUDE_DIR="$HOME/.claude"
SKILLS_DEST_DIR="$CLAUDE_DIR/skills"
BACKUP_DIR="$SKILLS_DEST_DIR/.backups"

# Options
DRY_RUN=false
DEPLOY_ALL=false
LIST_ONLY=false
SPECIFIC_SKILLS=()

##################################
# Skill Discovery
##################################
detect_available_skills() {
    [[ -d "$SKILLS_SOURCE_DIR" ]] || return 0
    local dir name
    for dir in "$SKILLS_SOURCE_DIR"/*/; do
        [[ -f "${dir}SKILL.md" ]] || continue
        name="$(basename "$dir")"
        echo "$name"
    done | sort
}

AVAILABLE_SKILLS=()
while IFS= read -r line; do
    [[ -n "$line" ]] && AVAILABLE_SKILLS+=("$line")
done < <(detect_available_skills)

##################################
# Usage and Listing
##################################
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy versioned skills from skills/ into ~/.claude/skills/.

OPTIONS:
    --all               Deploy all available skills (default when no skill is named)
    --include NAME      Deploy a specific skill (repeatable)
    --list              List available skills and exit
    --dry-run           Preview actions without writing anything
    --help              Show this help

EXAMPLES:
    $0                            # deploy all skills
    $0 --include loop-engineer
    $0 --list
    $0 --all --dry-run

AVAILABLE SKILLS:
$(if [[ ${#AVAILABLE_SKILLS[@]} -gt 0 ]]; then printf "    %s\n" "${AVAILABLE_SKILLS[@]}"; else echo "    (none found in $SKILLS_SOURCE_DIR)"; fi)
EOF
}

list_skills() {
    echo -e "${BLUE}Available Skills:${NC}"
    echo "================="
    if [[ ${#AVAILABLE_SKILLS[@]} -eq 0 ]]; then
        echo -e "${YELLOW}No skills found in $SKILLS_SOURCE_DIR${NC}"
        return 0
    fi
    local skill desc
    for skill in "${AVAILABLE_SKILLS[@]}"; do
        desc="$(read_skill_description "$skill")"
        echo -e "  ${GREEN}${skill}${NC} - ${desc}"
    done
}

read_skill_description() {
    local skill_md="$SKILLS_SOURCE_DIR/$1/SKILL.md"
    [[ -f "$skill_md" ]] || { echo "(SKILL.md missing)"; return; }
    # Pull the YAML frontmatter `description:` value; fall back to a placeholder.
    local desc
    desc="$(grep -m1 '^description:' "$skill_md" 2>/dev/null | sed 's/^description:[[:space:]]*//' | cut -c1-100 || true)"
    echo "${desc:-Skill}"
}

##################################
# Argument Parsing
##################################
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --all)     DEPLOY_ALL=true; shift ;;
            --include)
                [[ -n "${2:-}" && "$2" != --* ]] || { echo -e "${RED}Error: --include requires a skill name${NC}"; exit 1; }
                SPECIFIC_SKILLS+=("$2"); shift 2 ;;
            --list)    LIST_ONLY=true; shift ;;
            --dry-run) DRY_RUN=true; shift ;;
            --help)    usage; exit 0 ;;
            *)         echo -e "${RED}Error: Unknown option $1${NC}"; usage; exit 1 ;;
        esac
    done
}

##################################
# Environment Validation
##################################
validate_environment() {
    local errors=()
    [[ -d "$SKILLS_SOURCE_DIR" ]] || errors+=("Skills source directory not found: $SKILLS_SOURCE_DIR")
    [[ -f "$REPO_ROOT/CLAUDE.md" ]] || errors+=("Not running from the claude-code repository root")
    [[ -w "$HOME" ]] || errors+=("Home directory is not writable: $HOME")
    local cmd
    for cmd in cp mkdir grep find basename; do
        command -v "$cmd" >/dev/null 2>&1 || errors+=("Required command not found: $cmd")
    done
    [[ ${#errors[@]} -eq 0 ]] && return 0
    echo -e "${RED}Environment validation failed:${NC}"
    printf '  %s\n' "${errors[@]}"
    exit 1
}

##################################
# Deployment Selection
##################################
resolve_skills_to_deploy() {
    if [[ ${#AVAILABLE_SKILLS[@]} -eq 0 ]]; then
        echo -e "${RED}Error: No skills found in $SKILLS_SOURCE_DIR${NC}" >&2
        exit 1
    fi
    if [[ ${#SPECIFIC_SKILLS[@]} -gt 0 ]]; then
        validate_requested_skills
        printf '%s\n' "${SPECIFIC_SKILLS[@]}"
        return
    fi
    # Default (no --include): deploy everything. --all is implied for convenience.
    printf '%s\n' "${AVAILABLE_SKILLS[@]}"
}

validate_requested_skills() {
    local requested found available
    for requested in "${SPECIFIC_SKILLS[@]}"; do
        found=false
        for available in "${AVAILABLE_SKILLS[@]}"; do
            [[ "$available" == "$requested" ]] && found=true && break
        done
        [[ "$found" == true ]] && continue
        echo -e "${RED}Error: Skill '$requested' not found${NC}" >&2
        echo -e "${YELLOW}Available: ${AVAILABLE_SKILLS[*]}${NC}" >&2
        exit 1
    done
}

##################################
# Deployment
##################################
backup_existing_skill() {
    local skill="$1" dest="$SKILLS_DEST_DIR/$1"
    [[ -d "$dest" ]] || return 0
    local stamp backup
    stamp="$(date +%Y%m%d_%H%M%S)"
    backup="$BACKUP_DIR/${skill}-${stamp}"
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would back up existing $dest -> $backup${NC}"
        return 0
    fi
    mkdir -p "$BACKUP_DIR"
    cp -R "$dest" "$backup"
    echo -e "${YELLOW}  backed up existing -> ${backup}${NC}"
}

deploy_skill() {
    local skill="$1"
    local src="$SKILLS_SOURCE_DIR/$1"
    local dest="$SKILLS_DEST_DIR/$1"
    echo -e "${BLUE}Deploying ${skill}...${NC}"
    [[ -f "$src/SKILL.md" ]] || { echo -e "${RED}✗ $src/SKILL.md missing${NC}"; return 1; }
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would sync: $src/ -> $dest/${NC}"
        return 0
    fi
    backup_existing_skill "$skill"
    rm -rf "$dest"
    mkdir -p "$dest"
    cp -R "$src/." "$dest/"
    [[ -f "$dest/SKILL.md" ]] || { echo -e "${RED}✗ Copy verification failed${NC}"; return 1; }
    echo -e "${GREEN}✓ ${skill} installed${NC}"
}

##################################
# Main
##################################
main() {
    parse_arguments "$@"
    validate_environment

    if [[ "$LIST_ONLY" == true ]]; then
        list_skills
        exit 0
    fi

    echo -e "${BLUE}Deploying Claude Code Skills${NC}"
    echo "==================================="
    [[ "$DRY_RUN" == true ]] && echo -e "${YELLOW}DRY RUN MODE${NC}"

    local skills_to_deploy=()
    while IFS= read -r line; do
        [[ -n "$line" ]] && skills_to_deploy+=("$line")
    done < <(resolve_skills_to_deploy)

    echo "Target: $SKILLS_DEST_DIR"
    echo "Deploying: ${skills_to_deploy[*]}"
    echo ""

    [[ "$DRY_RUN" == true ]] || mkdir -p "$SKILLS_DEST_DIR"
    local skill
    for skill in "${skills_to_deploy[@]}"; do
        deploy_skill "$skill" || { echo -e "${RED}Failed to deploy $skill${NC}"; exit 1; }
    done

    echo ""
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Preview complete. Re-run without --dry-run to apply.${NC}"
    else
        echo -e "${GREEN}Skill(s) deployed: ${skills_to_deploy[*]}${NC}"
        echo -e "${BLUE}Location: $SKILLS_DEST_DIR${NC}"
    fi
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
