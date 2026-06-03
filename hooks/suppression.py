"""Inline suppression parser for code smell and security hooks.

Supports per-line suppression comments:
  # smell: ignore[complexity,long_function]
  # security: ignore[secrets,B101]

Applies to the same line or the line immediately following the comment.
No wildcards supported -- explicit check names required.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

from smell_types import Smell

_SUPPRESS_RE = re.compile(
    r"#\s*(?P<ns>smell|security):\s*ignore\[(?P<names>[^\]]+)\]"
)
_MAX_SUPPRESSIONS_PER_FILE = 5


def _parse_suppression(line: str) -> dict[str, set[str]]:
    """Parse suppression directives from a single line.

    Returns:
        Dict mapping namespace to set of suppressed check names.
    """
    result: dict[str, set[str]] = {}
    for match in _SUPPRESS_RE.finditer(line):
        ns = match.group("ns")
        names = {n.strip() for n in match.group("names").split(",")}
        result.setdefault(ns, set()).update(names)
    return result


def _build_suppression_map(lines: list[str]) -> dict[int, dict[str, set[str]]]:
    """Build a map of line numbers to their active suppressions.

    A suppression on line N applies to line N and line N+1.
    """
    suppression_map: dict[int, dict[str, set[str]]] = {}
    for lineno, line in enumerate(lines, start=1):
        parsed = _parse_suppression(line)
        if not parsed:
            continue
        for target_line in (lineno, lineno + 1):
            existing = suppression_map.setdefault(target_line, {})
            for ns, names in parsed.items():
                existing.setdefault(ns, set()).update(names)
    return suppression_map


def _is_suppressed(smell: Smell, namespace: str, active: dict[str, set[str]]) -> bool:
    """Check if a smell is suppressed by the active suppressions."""
    names = active.get(namespace, set())
    return smell.kind in names or smell.name in names


def _warn_excessive(count: int, total_lines: int) -> None:
    """Warn to stderr if too many suppressions are used."""
    if count > _MAX_SUPPRESSIONS_PER_FILE:
        print(
            f"Warning: {count} suppression comments in file "
            f"({_MAX_SUPPRESSIONS_PER_FILE} max recommended)",
            file=sys.stderr,
        )


def _repo_root(start: str) -> str:
    """Walk up from start to the nearest .git ancestor; fall back to start."""
    current = os.path.abspath(start)
    while True:
        if os.path.isdir(os.path.join(current, ".git")):
            return current
        parent = os.path.dirname(current)
        if parent == current:
            return os.path.abspath(start)
        current = parent


def _log_suppressions(
    smells: list[Smell], namespace: str, file_path: str,
) -> None:
    """Append honored (non-secret) suppressions to the audit log, best-effort."""
    root = _repo_root(os.path.dirname(os.path.abspath(file_path)))
    log_path = Path(root) / ".quality-gate" / "suppressions.log"
    try:
        log_path.parent.mkdir(parents=True, exist_ok=True)
        with open(log_path, "a", encoding="utf-8") as handle:
            for smell in smells:
                handle.write(f"{file_path}:{smell.line} {namespace}:{smell.kind}\n")
    except OSError:
        pass


def filter_suppressed(
    smells: list[Smell], lines: list[str], namespace: str,
    file_path: str | None = None,
) -> list[Smell]:
    """Remove smells covered by inline suppression comments.

    Secrets are never suppressible. Every honored suppression is appended to
    the audit log (.quality-gate/suppressions.log) when file_path is given.
    """
    suppression_map = _build_suppression_map(lines)
    _warn_excessive(len(suppression_map), len(lines))
    kept: list[Smell] = []
    honored: list[Smell] = []
    for smell in smells:
        active = suppression_map.get(smell.line, {})
        if smell.kind != "secrets" and _is_suppressed(smell, namespace, active):
            honored.append(smell)
        else:
            kept.append(smell)
    if honored and file_path:
        _log_suppressions(honored, namespace, file_path)
    return kept
