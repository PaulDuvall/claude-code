#!/usr/bin/env bash
# beads-orchestrator.sh -- Run Beads tasks in batched Claude context windows
#
# Usage:
#   ./scripts/beads-orchestrator.sh bd-001 bd-002 bd-003   # explicit tasks (any order)
#   ./scripts/beads-orchestrator.sh                         # auto-discover via bd ready
#
# Options (env vars):
#   GROUP_SIZE=3        Tasks per context window (default: 3)
#   MAX_TURNS=25        Claude turn limit per group (default: 25)
#   DRY_RUN=true        Show plan without executing (default: false)
#   MODEL=sonnet        Claude model to use (default: unset, uses CLI default)

set -eo pipefail

GROUP_SIZE="${GROUP_SIZE:-3}"
MAX_TURNS="${MAX_TURNS:-25}"
DRY_RUN="${DRY_RUN:-false}"
MODEL="${MODEL:-}"
ALLOWED_TOOLS="Edit,Write,Bash,Read,Grep,Glob"

TMPDIR_ORCH=$(mktemp -d)
trap 'rm -rf "$TMPDIR_ORCH"' EXIT

deps_file="$TMPDIR_ORCH/deps"
results_file="$TMPDIR_ORCH/results"
sorted_file="$TMPDIR_ORCH/sorted"
touch "$deps_file" "$results_file" "$sorted_file"

# --- Preflight ---
for cmd in jq claude bd git; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "[orchestrator] ERROR: '$cmd' not found. Install it first."; exit 1; }
done

# --- Collect task IDs ---
TASK_IDS=()
if [[ $# -gt 0 ]]; then
  for arg in "$@"; do
    TASK_IDS+=("$arg")
  done
else
  echo "[orchestrator] Discovering tasks via bd ready..."
  while IFS= read -r id; do
    [[ -n "$id" ]] && TASK_IDS+=("$id")
  done < <(bd ready --json | jq -r '.[].id')
fi

if [[ ${#TASK_IDS[@]} -eq 0 ]]; then
  echo "[orchestrator] No tasks found. Exiting."
  exit 0
fi

echo "[orchestrator] ${#TASK_IDS[@]} tasks: ${TASK_IDS[*]}"

# --- File-based helpers (Bash 3.2 safe) ---
file_contains() {
  grep -qx "$1" "$2" 2>/dev/null
}

# --- Resolve dependency order ---
# Write one file per task with its blocked-by deps
for id in "${TASK_IDS[@]}"; do
  deps=$(bd show "$id" --json 2>/dev/null | jq -r '(.blocked_by // [])[] // empty' 2>/dev/null || true)
  echo "$deps" > "$TMPDIR_ORCH/dep_${id}"
done

# Write all task IDs to a file for membership checks
printf '%s\n' "${TASK_IDS[@]}" > "$TMPDIR_ORCH/all_ids"

# Topological sort: tasks whose deps are satisfied go first
remaining_file="$TMPDIR_ORCH/remaining"
cp "$TMPDIR_ORCH/all_ids" "$remaining_file"

max_passes=${#TASK_IDS[@]}
for ((pass=0; pass<max_passes; pass++)); do
  [[ ! -s "$remaining_file" ]] && break
  next_remaining="$TMPDIR_ORCH/next_remaining"
  : > "$next_remaining"

  while IFS= read -r id; do
    [[ -z "$id" ]] && continue
    blocked=false

    # Read this task's deps
    if [[ -f "$TMPDIR_ORCH/dep_${id}" ]]; then
      while IFS= read -r dep; do
        [[ -z "$dep" ]] && continue
        # Only block if dep is in our task set AND not yet sorted
        if file_contains "$dep" "$TMPDIR_ORCH/all_ids" && ! file_contains "$dep" "$sorted_file"; then
          blocked=true
          break
        fi
      done < "$TMPDIR_ORCH/dep_${id}"
    fi

    if $blocked; then
      echo "$id" >> "$next_remaining"
    else
      echo "$id" >> "$sorted_file"
    fi
  done < "$remaining_file"

  cp "$next_remaining" "$remaining_file"
done

# Circular deps -- append whatever remains
if [[ -s "$remaining_file" ]]; then
  cat "$remaining_file" >> "$sorted_file"
fi

# Read sorted order into array
SORTED=()
while IFS= read -r id; do
  [[ -n "$id" ]] && SORTED+=("$id")
done < "$sorted_file"

echo "[orchestrator] Execution order: ${SORTED[*]}"

# --- Build groups ---
BATCHES=()
for ((i=0; i<${#SORTED[@]}; i+=GROUP_SIZE)); do
  group=""
  for ((j=i; j<i+GROUP_SIZE && j<${#SORTED[@]}; j++)); do
    [[ -n "$group" ]] && group+=" "
    group+="${SORTED[$j]}"
  done
  BATCHES+=("$group")
done

echo "[orchestrator] ${#BATCHES[@]} groups of up to $GROUP_SIZE"

# --- Build model flag ---
MODEL_FLAG=""
if [[ -n "$MODEL" ]]; then
  MODEL_FLAG="--model $MODEL"
fi

# --- Execute groups ---
TOTAL_OK=0
TOTAL_ERR=0

for ((g=0; g<${#BATCHES[@]}; g++)); do
  IFS=' ' read -ra group_tasks <<< "${BATCHES[$g]}"

  echo ""
  echo "=========================================="
  echo "[orchestrator] Group $((g+1))/${#BATCHES[@]}: ${group_tasks[*]}"
  echo "=========================================="

  task_list=""
  for tid in "${group_tasks[@]}"; do
    task_list+="  - $tid"$'\n'
  done

  PROMPT="You have been given a set of Beads tasks to execute. Complete them in the order listed.

Tasks:
${task_list}
For each task:
1. Run: bd show <id> --json -- read the description, acceptance criteria, and dependencies
2. Run: bd update <id> --status in_progress
3. Make the required code changes
4. Run relevant tests or verification
5. If tests fail, fix until they pass
6. Stage only the specific files you changed (never git add -A)
7. Commit: git commit -m 'type(scope): description [<id>]'
8. Close: bd close <id> --reason 'Completed'

Rules:
- One commit per task. Small, focused commits.
- Do not modify CLAUDE.md, AGENTS.md, or project configuration files.
- If a task is unclear or cannot be completed, skip it and move to the next.
- Do not push to remote.

Begin."

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[orchestrator] DRY RUN -- would execute:"
    echo "  claude -p <prompt> --max-turns $MAX_TURNS --allowed-tools $ALLOWED_TOOLS $MODEL_FLAG"
    for tid in "${group_tasks[@]}"; do
      echo "${tid}=dry_run" >> "$results_file"
    done
    continue
  fi

  # Fresh context window per group
  # shellcheck disable=SC2086
  if claude -p "$PROMPT" \
    --max-turns "$MAX_TURNS" \
    --allowed-tools "$ALLOWED_TOOLS" \
    $MODEL_FLAG \
    2>"/tmp/beads-group-${g}.stderr"; then
    echo "[orchestrator] Group $((g+1)) completed."
  else
    echo "[orchestrator] Group $((g+1)) exited non-zero. Check /tmp/beads-group-${g}.stderr"
  fi

  # Verify each task's status via bd
  for tid in "${group_tasks[@]}"; do
    status=$(bd show "$tid" --json 2>/dev/null | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
    if [[ "$status" == "closed" || "$status" == "done" ]]; then
      echo "${tid}=done" >> "$results_file"
      ((TOTAL_OK++)) || true
    else
      echo "${tid}=${status}" >> "$results_file"
      ((TOTAL_ERR++)) || true
    fi
  done
done

# --- Report ---
echo ""
echo "=========================================="
echo "[orchestrator] RESULTS"
echo "=========================================="
echo "  Completed: $TOTAL_OK"
echo "  Incomplete: $TOTAL_ERR"
echo ""
for tid in "${SORTED[@]}"; do
  result=$(grep "^${tid}=" "$results_file" 2>/dev/null | tail -1 | cut -d= -f2-)
  printf "  %-12s %s\n" "$tid" "${result:-unknown}"
done

if [[ $TOTAL_ERR -gt 0 ]]; then
  echo ""
  echo "[orchestrator] Re-run with incomplete tasks:"
  incomplete=""
  for tid in "${SORTED[@]}"; do
    result=$(grep "^${tid}=" "$results_file" 2>/dev/null | tail -1 | cut -d= -f2-)
    [[ "$result" != "done" && "$result" != "dry_run" ]] && incomplete+=" $tid"
  done
  echo "  ./scripts/beads-orchestrator.sh$incomplete"
fi
