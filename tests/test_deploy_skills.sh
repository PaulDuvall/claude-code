#!/usr/bin/env bash
set -uo pipefail

# Test Suite: scripts/deploy-skills.sh
#
# Purpose: Validate that versioned skills deploy from skills/ into ~/.claude/skills/
# Tests: discovery, listing, dry-run safety, real deploy, idempotent backup, errors
#
# Testing Philosophy:
# - Deploy into a throwaway HOME so the real ~/.claude is never touched
# - Assert FUNCTIONAL OUTCOMES (files land, backups happen) over log strings

##################################
# Test Configuration
##################################
TEST_NAME="scripts/deploy-skills.sh Test Suite"
TEST_DIR="/tmp/test-deploy-skills-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_SCRIPT="$SCRIPT_DIR/scripts/deploy-skills.sh"
source "$(dirname "$0")/lib/test-helpers.sh"

# Run the deploy script against an isolated HOME inside TEST_DIR.
run_deploy() {
    local fake_home="$TEST_DIR/home"
    mkdir -p "$fake_home"
    HOME="$fake_home" bash "$DEPLOY_SCRIPT" "$@"
}

skills_dest() { echo "$TEST_DIR/home/.claude/skills"; }

##################################
# Existence and Syntax
##################################
test_script_exists_and_executable() {
    [[ -f "$DEPLOY_SCRIPT" ]] && [[ -x "$DEPLOY_SCRIPT" ]]
}

test_script_syntax_valid() {
    bash -n "$DEPLOY_SCRIPT" 2>/dev/null
}

test_source_skill_is_versioned() {
    [[ -f "$SCRIPT_DIR/skills/loop-engineer/SKILL.md" ]]
}

##################################
# Listing and Help
##################################
test_help_exits_zero() {
    run_deploy --help >/dev/null 2>&1
}

test_list_shows_loop_engineer() {
    run_deploy --list 2>/dev/null | grep -q "loop-engineer"
}

##################################
# Dry Run Safety
##################################
test_dry_run_writes_nothing() {
    run_deploy --all --dry-run >/dev/null 2>&1
    [[ ! -d "$(skills_dest)/loop-engineer" ]]
}

##################################
# Real Deploy
##################################
test_deploy_lands_skill_md() {
    run_deploy --include loop-engineer >/dev/null 2>&1
    [[ -f "$(skills_dest)/loop-engineer/SKILL.md" ]]
}

test_deploy_lands_templates() {
    run_deploy --include loop-engineer >/dev/null 2>&1
    [[ -f "$(skills_dest)/loop-engineer/templates/fan-out-audit.workflow.js" ]] &&
    [[ -f "$(skills_dest)/loop-engineer/templates/deterministic_guard.py" ]]
}

test_deployed_matches_source() {
    run_deploy --include loop-engineer >/dev/null 2>&1
    diff -rq "$SCRIPT_DIR/skills/loop-engineer" "$(skills_dest)/loop-engineer" >/dev/null 2>&1
}

##################################
# Idempotent re-deploy backs up the prior copy
##################################
test_redeploy_creates_backup() {
    run_deploy --include loop-engineer >/dev/null 2>&1
    run_deploy --include loop-engineer >/dev/null 2>&1
    local backups
    backups="$(find "$(skills_dest)/.backups" -maxdepth 1 -type d -name 'loop-engineer-*' 2>/dev/null | wc -l)"
    [[ "$backups" -ge 1 ]]
}

##################################
# Error Handling
##################################
test_unknown_skill_fails() {
    ! run_deploy --include does-not-exist >/dev/null 2>&1
}

##################################
# Main
##################################
main() {
    print_test_header

    echo "Existence and Syntax Tests:"
    run_test "deploy-skills.sh exists and is executable" test_script_exists_and_executable
    run_test "deploy-skills.sh passes bash syntax check" test_script_syntax_valid
    run_test "loop-engineer is versioned under skills/" test_source_skill_is_versioned

    echo ""
    echo "Listing and Help Tests:"
    run_test "--help exits zero" test_help_exits_zero
    run_test "--list shows loop-engineer" test_list_shows_loop_engineer

    echo ""
    echo "Dry Run Tests:"
    run_test "--dry-run writes nothing" test_dry_run_writes_nothing

    echo ""
    echo "Deploy Tests:"
    run_test "deploy lands SKILL.md" test_deploy_lands_skill_md
    run_test "deploy lands template files" test_deploy_lands_templates
    run_test "deployed copy matches source" test_deployed_matches_source
    run_test "re-deploy backs up prior copy" test_redeploy_creates_backup

    echo ""
    echo "Error Handling Tests:"
    run_test "unknown skill name fails" test_unknown_skill_fails

    cleanup_test_environment
    print_test_summary
}

setup_test_trap
main "$@"
