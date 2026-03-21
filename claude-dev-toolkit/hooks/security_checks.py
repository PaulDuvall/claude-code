"""Security check orchestrator -- runs secrets, bandit, and trojan checks.

Reads a source file, runs applicable security checks, and returns
Smell objects for any violations. Respects per-project config.
"""

from __future__ import annotations

import os

from config import Config, load_config, is_file_suppressed
from security_bandit import check_bandit
from security_secrets import check_secrets
from security_trojan import check_trojan
from smell_types import Smell
from suppression import filter_suppressed

PYTHON_EXTS = frozenset((".py",))
ALL_EXTS = frozenset((
    ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".go",
    ".rs", ".c", ".cpp", ".cs", ".rb", ".sh", ".yaml", ".yml",
    ".json", ".toml", ".env", ".cfg", ".ini", ".conf",
))
SKIP_DIRS = frozenset((
    "node_modules", "__pycache__", ".git", "dist", "build", ".next",
))


def _should_skip(file_path: str) -> bool:
    """Return True for paths in ignored directories."""
    parts = set(file_path.replace("\\", "/").split("/"))
    return bool(SKIP_DIRS & parts)


def _read_source(file_path: str) -> str | None:
    """Read file contents, returning None on failure."""
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as fh:
            return fh.read()
    except OSError:
        return None


def _run_checks(file_path: str, source: str, config: Config) -> list[Smell]:
    """Run applicable security checks on file contents."""
    lines = source.splitlines()
    smells = _collect_violations(file_path, source, lines, config)
    return filter_suppressed(smells, lines, "security")


def _collect_violations(
    file_path: str, source: str, lines: list[str], config: Config,
) -> list[Smell]:
    """Gather raw violations before suppression filtering."""
    smells: list[Smell] = []
    if config.security_enabled:
        smells.extend(check_secrets(lines))
    ext = os.path.splitext(file_path)[1]
    if ext in PYTHON_EXTS and config.security_enabled:
        smells.extend(check_bandit(file_path, source))
    if config.trojan_enabled:
        smells.extend(check_trojan(lines))
    return smells


def _is_excluded(file_path: str, ext: str, config: Config) -> bool:
    """Return True if file should be excluded from security checks."""
    if ext not in ALL_EXTS or _should_skip(file_path):
        return True
    return is_file_suppressed(file_path, config)


def check_security(file_path: str, config: Config | None = None) -> list[Smell]:
    """Run all security checks on a single file."""
    if config is None:
        config = load_config(file_path)
    ext = os.path.splitext(file_path)[1]
    if _is_excluded(file_path, ext, config):
        return []
    source = _read_source(file_path)
    if source is None:
        return []
    return _run_checks(file_path, source, config)


def format_security_violations(file_path: str, smells: list[Smell]) -> str:
    """Build the feedback message for security violations."""
    header = f"\nSECURITY VIOLATIONS in {file_path}:"
    details = []
    for s in smells:
        tag = s.kind.upper().replace("_", " ")
        details.append(f"  [{tag}] {s.name} line {s.line}: {s.detail}")
    fixes = ["\nFix these security issues before moving on:"]
    for fix in dict.fromkeys(s.fix for s in smells):
        fixes.append(f"  - {fix}")
    fixes.append("Then notify the user what you fixed and why.")
    return "\n".join([header, *details, *fixes])
