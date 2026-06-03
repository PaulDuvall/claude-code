#!/usr/bin/env python3
"""Tier 2 pre-push: ASH (precommit mode) scoped to the push range.

Resolves the push range (``git diff @{push}`` with a fallback to the default
branch on a new branch — never the whole tree), applies the same applicability
gate as Tier 1, stages the changed files into a temp directory (ASH scans a
directory, not a file list), and runs ASH's Python-only ``precommit`` mode
pinned to the recorded commit SHA.

Benchmarked on this repo: ASH precommit has a ~10s warm orchestration floor
(one-time ~82s cold provisioning) regardless of input size, and pays that floor
even with zero matching input — so applicability is gated HERE, before ASH is
invoked at all. Warns (does not block) when uvx is unavailable; the un-bypassable
CI Tier 3 enforces. Silent when nothing applies.
"""

from __future__ import annotations

import os
import shutil
import subprocess  # noqa: S404 - list-form calls only, no shell=True
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scan_router import applicable_scanners  # noqa: E402

# Immutable pin (== tag v3.2.6); kept consistent with .ash/ash.yaml & /xsecurity.
ASH_REF = "1dca6b3d10ff274115a159d869bdff8b98624b62"
ASH_URL = f"git+https://github.com/awslabs/automated-security-helper@{ASH_REF}"
# precommit mode runs Python-based scanners only; this is what ASH may run.
_PRECOMMIT_SCANNERS = frozenset(("bandit", "semgrep", "detect-secrets", "checkov"))
# Only invoke ASH when a code/IaC scanner applies. detect-secrets alone (e.g. a
# docs-only push) does NOT trigger the ~10s ASH floor here: secrets are already
# gated dependency-free at Tier 0/1, and the CI Tier 3 container re-checks them.
_GATE_SCANNERS = frozenset(("bandit", "semgrep", "checkov"))
_UVX_MISSING = "pre-push: uvx not found; skipping ASH scan (CI Tier 3 enforces)\n"
_ASH_TIMEOUT = 120


def _run_git(args: list[str]) -> str | None:
    """Run a git command; return stdout on success, else None."""
    try:
        proc = subprocess.run(
            ["git", *args], capture_output=True, text=True, timeout=30,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    return proc.stdout if proc.returncode == 0 else None


def _default_branch() -> str:
    """Resolve the remote default branch name, defaulting to 'main'."""
    ref = _run_git(["symbolic-ref", "refs/remotes/origin/HEAD"])
    return ref.strip().rsplit("/", 1)[-1] if ref else "main"


def _diff_names(rev: str) -> str | None:
    """Return changed file names against rev (added/copied/modified only)."""
    return _run_git(["diff", "--name-only", "--diff-filter=ACM", rev])


def changed_files() -> list[str]:
    """Resolve the push-range changed files; never the whole tree."""
    out = _diff_names("@{push}")
    if out is None:
        base = _default_branch()
        out = _diff_names(f"origin/{base}") or _diff_names(base)
    if out is None:
        return []
    return [f for f in out.splitlines() if f and os.path.isfile(f)]


def _stage(files: list[str]) -> str:
    """Copy changed files into a temp dir, preserving relative paths."""
    tmp = tempfile.mkdtemp(prefix="ash-prepush-")
    for rel in files:
        dest = os.path.join(tmp, rel)
        os.makedirs(os.path.dirname(dest) or tmp, exist_ok=True)
        try:
            shutil.copy2(rel, dest)
        except OSError:
            pass
    return tmp


def _run_ash(src: str, scanners: set[str]) -> tuple[int, str]:
    """Run ASH precommit mode over the staged dir; degrade safe on failure."""
    cmd = [
        "uvx", "--from", ASH_URL, "ash", "--mode", "precommit",
        "--source-dir", src, "--output-dir", os.path.join(src, "_ashout"),
        "--scanners", ",".join(sorted(scanners)),
    ]
    try:
        proc = subprocess.run(
            cmd, capture_output=True, text=True, timeout=_ASH_TIMEOUT,
        )
    except (OSError, subprocess.TimeoutExpired):
        return 0, ""
    return proc.returncode, proc.stdout + proc.stderr


def _scan(files: list[str], scanners: set[str]) -> int:
    """Stage, scan, clean up; block (1) on findings, else 0."""
    src = _stage(files)
    try:
        code, output = _run_ash(src, scanners)
    finally:
        shutil.rmtree(src, ignore_errors=True)
    if code != 0 and output.strip():
        sys.stderr.write(output if output.endswith("\n") else output + "\n")
    return 1 if code != 0 else 0


def main() -> int:
    """Run the Tier 2 pre-push ASH scan, applicability-gated."""
    files = changed_files()
    if not files:
        return 0
    applicable = applicable_scanners(files)
    if not (applicable & _GATE_SCANNERS):
        return 0
    if shutil.which("uvx") is None:
        sys.stderr.write(_UVX_MISSING)
        return 0
    return _scan(files, applicable & _PRECOMMIT_SCANNERS)


if __name__ == "__main__":
    sys.exit(main())
