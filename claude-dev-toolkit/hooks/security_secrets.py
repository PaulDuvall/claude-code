"""Hardcoded secrets detection via regex patterns.

Scans source lines for common secret patterns: API keys, tokens,
private key headers, and credential URLs. Skips known false positives.
"""

from __future__ import annotations

import re

from smell_types import FIXES, Smell

# ---------------------------------------------------------------------------
# Secret patterns -- each is (compiled_regex, description)
# ---------------------------------------------------------------------------

_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"AKIA[0-9A-Z]{16}"), "AWS access key"),
    (re.compile(r"ghp_[0-9a-zA-Z]{36}"), "GitHub personal access token"),
    (re.compile(r"gho_[0-9a-zA-Z]{36}"), "GitHub OAuth token"),
    (re.compile(r"xoxb-[0-9]{10,13}-[0-9a-zA-Z-]+"), "Slack bot token"),
    (re.compile(r"xoxp-[0-9]{10,13}-[0-9a-zA-Z-]+"), "Slack user token"),
    (re.compile(r"sk_live_[0-9a-zA-Z]{24,}"), "Stripe secret key"),
    (re.compile(r"rk_live_[0-9a-zA-Z]{24,}"), "Stripe restricted key"),
    (re.compile(r"AIza[0-9A-Za-z_-]{35}"), "Google API key"),
    (re.compile(r"sk-[0-9a-zA-Z]{20,}T3BlbkFJ[0-9a-zA-Z]+"), "OpenAI API key"),
    (re.compile(r"-----BEGIN\s+(RSA |EC |DSA )?PRIVATE KEY-----"), "private key"),
    (re.compile(r"[a-zA-Z+]+://[^:]+:[^@]+@[^\s]+"), "credentials in URL"),
]

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
