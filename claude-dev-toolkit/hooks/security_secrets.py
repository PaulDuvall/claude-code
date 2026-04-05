"""Hardcoded secrets detection via regex patterns.

Scans source lines for common secret patterns: API keys, tokens,
private key headers, and credential URLs. Skips known false positives.

Patterns are loaded from hooks/lib/credential-patterns.conf (shared
source of truth with shell hooks). Falls back to inline defaults if
the shared file is missing.
"""

from __future__ import annotations

import re
from pathlib import Path

from smell_types import FIXES, Smell

# ---------------------------------------------------------------------------
# Secret patterns -- loaded from shared conf, with inline fallback
# ---------------------------------------------------------------------------


def _load_patterns() -> list[tuple[re.Pattern[str], str]]:
    """Load credential patterns from shared conf file."""
    conf = Path(__file__).parent / "lib" / "credential-patterns.conf"
    if not conf.exists():
        return _FALLBACK_PATTERNS

    patterns: list[tuple[re.Pattern[str], str]] = []
    for line in conf.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("|", 3)
        if len(parts) == 4:
            _name, _confidence, regex, description = parts
            patterns.append((re.compile(regex), description))
    return patterns or _FALLBACK_PATTERNS


# Inline fallback — used only when credential-patterns.conf is missing
_FALLBACK_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"AKIA[0-9A-Z]{16}"), "AWS access key"),
    (re.compile(r"ghp_[0-9a-zA-Z]{36}"), "GitHub personal access token"),
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"), "private key"),
    (re.compile(r"[a-zA-Z+]+://[^:]+:[^@]+@[^\s]+"), "credentials in URL"),
]

_PATTERNS: list[tuple[re.Pattern[str], str]] = _load_patterns()

# ---------------------------------------------------------------------------
# False-positive skip heuristics
# ---------------------------------------------------------------------------

_FP_WORDS = re.compile(
    r"(example|fake|test|dummy|placeholder|xxxx|TODO|CHANGEME)",
    re.IGNORECASE,
)


def _is_false_positive(line: str) -> bool:
    """Return True if the line looks like a placeholder or example."""
    stripped = line.strip()
    if stripped.startswith(("#", "//", "/*", "*")):
        return True
    return bool(_FP_WORDS.search(stripped))


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def _match_line(line: str, lineno: int) -> Smell | None:
    """Check a single line against all secret patterns."""
    if _is_false_positive(line):
        return None
    for pattern, desc in _PATTERNS:
        if pattern.search(line):
            return Smell(
                "secrets", desc, lineno,
                f"possible {desc} detected",
                FIXES["secrets"],
            )
    return None


def check_secrets(lines: list[str]) -> list[Smell]:
    """Scan lines for hardcoded secret patterns.

    Args:
        lines: Source file lines to scan.

    Returns:
        List of Smell objects for detected secrets.
    """
    smells: list[Smell] = []
    for lineno, line in enumerate(lines, start=1):
        smell = _match_line(line, lineno)
        if smell is not None:
            smells.append(smell)
    return smells
