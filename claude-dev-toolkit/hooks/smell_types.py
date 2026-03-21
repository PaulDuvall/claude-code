"""Shared types, thresholds, and helpers for code smell detection."""

from __future__ import annotations

from dataclasses import dataclass

# ---------------------------------------------------------------------------
# Thresholds
# ---------------------------------------------------------------------------
MAX_COMPLEXITY = 10
MAX_FUNCTION_LINES = 20
MAX_NESTING_DEPTH = 3
MAX_PARAMETERS = 4
MAX_FILE_LINES = 300
DUPLICATE_MIN_LINES = 4
DUPLICATE_MIN_OCCURRENCES = 2

FIXES = {
    "complexity": "Use extract-method, early returns, guard clauses, or lookup tables.",
    "long_function": "Extract helper functions for distinct logical steps.",
    "deep_nesting": "Use guard clauses and early returns to flatten control flow.",
    "too_many_params": "Group related parameters into a dataclass or options object.",
    "duplicate_block": "Extract repeated code into a shared helper function.",
    "long_file": "Split into smaller modules with clear single responsibilities.",
    "secrets": "Move secrets to environment variables or a secrets manager.",
    "B101": "Remove assert from non-test code; use proper validation instead.",
    "B102": "Replace exec/eval with safer alternatives.",
    "B105": "Move hardcoded passwords to environment variables.",
    "B106": "Move hardcoded passwords to environment variables.",
    "B110": "Handle exceptions explicitly instead of using bare except-pass.",
    "B301": "Avoid pickle for untrusted data; use json or safer serialization.",
    "B602": "Avoid shell=True; pass command as a list to subprocess.",
    "trojan_bidi": "Remove Unicode bidi override characters that can disguise code.",
    "trojan_zero_width": "Remove zero-width Unicode characters that hide content.",
    "ruff_lint": "Fix the ruff lint violation manually.",
}


@dataclass(frozen=True)
class Smell:
    """A single code-smell violation."""

    kind: str
    name: str
    line: int
    detail: str
    fix: str


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

_DETAIL_TEMPLATES = {
    "complexity": ("complexity={value} (max {max})", MAX_COMPLEXITY),
    "long_function": ("{value} lines (max {max})", MAX_FUNCTION_LINES),
    "deep_nesting": ("nesting depth {value} (max {max})", MAX_NESTING_DEPTH),
    "too_many_params": ("{value} params (max {max})", MAX_PARAMETERS),
}


def make_smell(kind: str, name: str, line: int, value: int) -> Smell:
    """Create a Smell with a formatted detail string."""
    tpl, mx = _DETAIL_TEMPLATES[kind]
    return Smell(kind, name, line, tpl.format(value=value, max=mx), FIXES[kind])


def apply_threshold_checks(
    name: str, line: int, checks: list[tuple[str, int, int]],
) -> list[Smell]:
    """Return Smell for each (kind, value, threshold) where value > threshold."""
    return [make_smell(k, name, line, v) for k, v, t in checks if v > t]
