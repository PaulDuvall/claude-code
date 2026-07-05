#!/usr/bin/env bash
# Claude Code Hook: Prevent Credential Exposure (PreToolUse: Edit|Write|MultiEdit)
#
# Reads the hook payload as JSON on stdin (the protocol Claude Code actually uses),
# logs the real tool name, scans the about-to-be-written content for credential
# patterns, and BLOCKS with exit code 2 on a hit. Exit 0 allows the operation.
#
# History: the prior version read CLAUDE_TOOL/CLAUDE_FILE/CLAUDE_CONTENT env vars
# that are never set, so it logged "tool: unknown" and caught nothing (fail-open),
# and it exited 1 (non-blocking) instead of 2. Rewritten 2026-07-05 (L0 repair).
set -uo pipefail

HOOK_NAME="prevent-credential-exposure"
LOG_FILE="$HOME/.claude/logs/security-hooks.log"
VIOLATION_LOG="$HOME/.claude/logs/credential-violations.log"
mkdir -p "$(dirname "$LOG_FILE")"
ts() { date +'%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] [$HOOK_NAME] $*" >>"$LOG_FILE" 2>/dev/null || true; }

raw="$(cat 2>/dev/null || true)"

# Parse tool name + file path (line 1, tab-separated) and any matched pattern
# names (subsequent lines) via a single python3 pass. Payload goes through a temp
# file so large file contents never hit ARG_MAX / env-size limits.
tmp="$(mktemp 2>/dev/null || echo /tmp/cred-hook.$$)"
printf '%s' "$raw" >"$tmp" 2>/dev/null || true
result="$(python3 - "$tmp" 2>/dev/null <<'PYEOF'
import sys, json, re
try:
    raw = open(sys.argv[1], encoding="utf-8", errors="replace").read()
    d = json.loads(raw) if raw.strip() else {}
except Exception:
    d = {}
tool = str(d.get("tool_name", "") or "")
ti = d.get("tool_input", {}) or {}
fp = str(ti.get("file_path", "") or "")
parts = []
if ti.get("content"):
    parts.append(str(ti["content"]))
if ti.get("new_string"):
    parts.append(str(ti["new_string"]))
for e in (ti.get("edits") or []):
    if isinstance(e, dict) and e.get("new_string"):
        parts.append(str(e["new_string"]))
content = "\n".join(parts)
PATTERNS = [
    ("aws_access_key_id",     r"AKIA[0-9A-Z]{16}"),
    ("aws_secret_access_key", r"(?i)aws_secret_access_key\s*[=:]\s*\S{8,}"),
    ("private_key_block",     r"-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----"),
    ("url_with_credentials",  r"https?://[^:/\s]+:[^@/\s]+@"),
    ("slack_token",           r"xox[baprs]-[0-9A-Za-z-]{10,}"),
    ("github_token",          r"gh[pousr]_[0-9A-Za-z]{20,}"),
    ("hardcoded_secret",      r"(?i)(api[_-]?key|client[_-]?secret|secret[_-]?key|access[_-]?token|auth[_-]?token|password|passwd)\s*[=:]\s*['\"][A-Za-z0-9/\+=_\-]{16,}"),
]
hits = [name for name, rx in PATTERNS if content and re.search(rx, content)]
sys.stdout.write(tool + "\t" + fp + "\n")
sys.stdout.write("\n".join(hits))
PYEOF
)"
rm -f "$tmp" 2>/dev/null || true

header="$(printf '%s' "$result" | head -1)"
tool_name="$(printf '%s' "$header" | cut -f1)"
file_path="$(printf '%s' "$header" | cut -f2)"
hits="$(printf '%s' "$result" | tail -n +2 | sed '/^[[:space:]]*$/d')"

# Legacy env-var fallback (kept for compatibility; normally unused).
tool_name="${tool_name:-${CLAUDE_TOOL:-unknown}}"
file_path="${file_path:-${CLAUDE_FILE:-stdin}}"

log "Hook triggered for tool: ${tool_name:-unknown}"

case "${tool_name:-}" in
    Edit | Write | MultiEdit) ;;
    *)
        log "Skipping non-file tool: ${tool_name:-unknown}"
        exit 0
        ;;
esac

if [[ -n "$hits" ]]; then
    count="$(printf '%s\n' "$hits" | grep -c . || true)"
    joined="$(printf '%s' "$hits" | tr '\n' ',' | sed 's/,$//')"
    echo "[$(ts)] VIOLATION: [$joined] in ${file_path:-stdin}" >>"$VIOLATION_LOG" 2>/dev/null || true
    log "BLOCKED: $count credential pattern(s) in ${file_path:-stdin}: $joined"
    {
        echo "🚨 SECURITY VIOLATION: credential exposure detected in ${file_path:-stdin}"
        echo "Matched pattern(s): $joined"
        echo "Operation BLOCKED. Move secrets to environment variables or a secrets"
        echo "manager, or use placeholder values in examples, then retry."
    } >&2
    exit 2
fi

log "Security scan passed for ${file_path:-stdin}"
exit 0
