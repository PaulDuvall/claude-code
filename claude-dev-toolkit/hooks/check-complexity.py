#!/usr/bin/env python3
"""PostToolUse hook: detect common code smells in modified files.

Delegates all analysis to smell_checks module. Reads the PostToolUse
JSON event from stdin, checks the written file, and emits a blocking
result when violations are found.
"""

from __future__ import annotations

import json
import os
import sys

# Allow importing sibling module from the same directory.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from smell_checks import check_file, format_violations  # noqa: E402


def main() -> None:
    """Entry point: read PostToolUse event, check file, emit result."""
    try:
        event = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)
    file_path = event.get("tool_input", {}).get("file_path", "")
    if not file_path or not os.path.isfile(file_path):
        sys.exit(0)
    smells = check_file(file_path)
    if smells:
        reason = format_violations(file_path, smells)
        print(json.dumps({"decision": "block", "reason": reason}))
    sys.exit(0)


if __name__ == "__main__":
    main()
