#!/usr/bin/env python3
"""PostToolUse hook: detect security violations in modified files.

Delegates analysis to security_checks module. Reads the PostToolUse
JSON event from stdin, checks the written file, and emits a blocking
result when violations are found.
"""

from __future__ import annotations

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from security_checks import check_security, format_security_violations  # noqa: E402
from smell_types import blocks_commit, severity_for  # noqa: E402


def _format_report(file_path: str, smells: list) -> str:
    """Build a non-blocking notice for sub-HIGH security findings."""
    head = f"SECURITY NOTICE (non-blocking) in {file_path}:"
    rows = [
        f"  [{severity_for(s.kind).upper()}] {s.name} line {s.line}: {s.detail}"
        for s in smells
    ]
    return "\n".join([head, *rows])


def _emit(file_path: str, smells: list) -> None:
    """Block on secrets/HIGH+; report sub-HIGH findings without blocking."""
    blocking = [s for s in smells if blocks_commit(s)]
    if blocking:
        reason = format_security_violations(file_path, smells)
        print(json.dumps({"decision": "block", "reason": reason}))
    else:
        print(_format_report(file_path, smells), file=sys.stderr)


def main() -> None:
    """Entry point: read PostToolUse event, check file, emit result."""
    try:
        event = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)
    file_path = event.get("tool_input", {}).get("file_path", "")
    if not file_path or not os.path.isfile(file_path):
        sys.exit(0)
    smells = check_security(file_path)
    if smells:
        _emit(file_path, smells)
    sys.exit(0)


if __name__ == "__main__":
    main()
