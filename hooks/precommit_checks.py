#!/usr/bin/env python3
"""Tier 1 pre-commit checks: secrets (always block) + IaC (warn if uvx absent).

Invoked by the chained .git/hooks/pre-commit shim with the staged file list
(see hooks/git/pre-commit). Applicability-gated and silent when nothing
applies. Secrets are dependency-free and always block; the checkov IaC scan
warns but does not block when uvx is unavailable (CI Tier 3 enforces).
"""

from __future__ import annotations

import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scan_router import check_iac, iac_files, is_text_file  # noqa: E402
from security_secrets import check_secrets  # noqa: E402


def _existing(paths: list[str]) -> list[str]:
    """Keep only paths that are real files on disk."""
    return [path for path in paths if os.path.isfile(path)]


def _read_lines(path: str) -> list[str]:
    """Read a file's lines, returning [] on failure."""
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as handle:
            return handle.read().splitlines()
    except OSError:
        return []


def scan_secrets(files: list[str]) -> bool:
    """Block (return True) if any staged text file contains a secret."""
    blocked = False
    for path in (f for f in files if is_text_file(f)):
        for smell in check_secrets(_read_lines(path)):
            sys.stderr.write(f"BLOCKED secret: {path}:{smell.line} {smell.detail}\n")
            blocked = True
    return blocked


def scan_iac(files: list[str]) -> int:
    """Run checkov on staged IaC; warn (not block) when uvx is unavailable."""
    targets = iac_files(files)
    if not targets:
        return 0
    if shutil.which("uvx") is None:
        sys.stderr.write(
            "pre-commit: uvx not found; skipping IaC scan (CI Tier 3 enforces)\n"
        )
        return 0
    return check_iac(targets)


def main(argv: list[str]) -> int:
    """Run secrets + IaC checks on the staged file list."""
    files = _existing(argv)
    if not files:
        return 0
    secret_block = scan_secrets(files)
    iac_code = scan_iac(files)
    return 1 if (secret_block or iac_code) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
