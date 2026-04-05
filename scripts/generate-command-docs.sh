#!/usr/bin/env bash
set -euo pipefail

# Generate command reference tables from slash-commands/ YAML frontmatter.
# Source of truth: slash-commands/active/*.md, slash-commands/experiments/*.md
#
# Usage:
#   bash scripts/generate-command-docs.sh          # Print tables to stdout
#   bash scripts/generate-command-docs.sh update    # Update README.md and CLAUDE.md in-place

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ACTIVE_DIR="$REPO_ROOT/slash-commands/active"
EXPERIMENTS_DIR="$REPO_ROOT/slash-commands/experiments"

extract_description() {
    sed -n '/^---$/,/^---$/p' "$1" \
        | grep '^description:' \
        | head -1 \
        | sed 's/^description: *//; s/^"//; s/"$//; s/^'"'"'//; s/'"'"'$//'
}

count_files() {
    local n
    n=$(find "$1" -maxdepth 1 -name 'x*.md' -type f 2>/dev/null | wc -l)
    echo "$n" | tr -d ' '
}

generate_table() {
    local dir="$1"
    echo "| Command | Description |"
    echo "|---------|-------------|"
    for f in "$dir"/x*.md; do
        [ -f "$f" ] || continue
        local name desc
        name="$(basename "$f" .md)"
        desc="$(extract_description "$f")"
        echo "| \`/$name\` | $desc |"
    done
}

update_between_markers() {
    local file="$1" begin_marker="$2" end_marker="$3" content="$4"
    if ! grep -q "$begin_marker" "$file"; then
        echo "WARNING: marker '$begin_marker' not found in $file" >&2
        return 1
    fi
    local tmp
    tmp="$(mktemp)"
    awk -v bm="$begin_marker" -v em="$end_marker" '
        index($0, bm) { print; skip=1; next }
        index($0, em) { skip=0 }
        !skip { print }
    ' "$file" > "$tmp"

    # Now insert the content after the begin marker
    local tmp2
    tmp2="$(mktemp)"
    while IFS= read -r line; do
        echo "$line"
        if [[ "$line" == *"$begin_marker"* ]]; then
            echo "$content"
        fi
    done < "$tmp" > "$tmp2"

    mv "$tmp2" "$file"
    rm -f "$tmp"
}

active_count="$(count_files "$ACTIVE_DIR")"
exp_count="$(count_files "$EXPERIMENTS_DIR")"
active_table="$(generate_table "$ACTIVE_DIR")"
exp_table="$(generate_table "$EXPERIMENTS_DIR")"

case "${1:-print}" in
    print)
        echo "### Active Commands ($active_count)"
        echo ""
        echo "$active_table"
        echo ""
        echo "### Experimental Commands ($exp_count)"
        echo ""
        echo "$exp_table"
        ;;
    update)
        update_between_markers "$REPO_ROOT/README.md" \
            "<!-- BEGIN:ACTIVE_COMMANDS -->" \
            "<!-- END:ACTIVE_COMMANDS -->" \
            "$active_table"

        update_between_markers "$REPO_ROOT/README.md" \
            "<!-- BEGIN:EXPERIMENTAL_COMMANDS -->" \
            "<!-- END:EXPERIMENTAL_COMMANDS -->" \
            "$exp_table"

        # CLAUDE.md gets both tables in one block
        combined="$(printf '%s\n\n### Experimental Commands (%s)\n\n%s' \
            "$active_table" "$exp_count" "$exp_table")"
        update_between_markers "$REPO_ROOT/CLAUDE.md" \
            "<!-- BEGIN:COMMANDS -->" \
            "<!-- END:COMMANDS -->" \
            "$combined"

        # Update badge counts in README.md
        sed -i '' \
            "s/active%20commands-[0-9]*-/active%20commands-${active_count}-/" \
            "$REPO_ROOT/README.md"
        sed -i '' \
            "s/experimental%20commands-[0-9]*-/experimental%20commands-${exp_count}-/" \
            "$REPO_ROOT/README.md"
        total=$((active_count + exp_count))
        sed -i '' \
            "s/total%20commands-[0-9]*-/total%20commands-${total}-/" \
            "$REPO_ROOT/README.md"

        echo "Updated README.md and CLAUDE.md (active=$active_count, experimental=$exp_count, total=$total)."
        ;;
    *)
        echo "Usage: $0 [print|update]"
        exit 1
        ;;
esac
