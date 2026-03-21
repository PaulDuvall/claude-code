"""Unicode trojan source detection.

Detects bidirectional override characters and zero-width characters
that can be used to disguise malicious code. BOM at file start is allowed.
"""

from __future__ import annotations

import re

from smell_types import FIXES, Smell

# Bidi overrides: U+202A-U+202E
_BIDI_OVERRIDES = re.compile(r"[\u202A-\u202E]")
# Bidi isolates: U+2066-U+2069
_BIDI_ISOLATES = re.compile(r"[\u2066-\u2069]")
# Zero-width chars: U+200B-U+200F, U+FEFF (BOM)
_ZERO_WIDTH = re.compile(r"[\u200B-\u200F\uFEFF]")


def _check_bidi(line: str, lineno: int) -> Smell | None:
    """Check a single line for bidi override/isolate characters."""
    if _BIDI_OVERRIDES.search(line) or _BIDI_ISOLATES.search(line):
        return Smell(
            "trojan_bidi", "bidi-override", lineno,
            "Unicode bidi override character detected",
            FIXES["trojan_bidi"],
        )
    return None


def _check_zero_width(line: str, lineno: int) -> Smell | None:
    """Check a single line for zero-width characters."""
    match = _ZERO_WIDTH.search(line)
    if not match:
        return None
    if lineno == 1 and match.start() == 0 and match.group() == "\uFEFF":
        return None
    return Smell(
        "trojan_zero_width", "zero-width-char", lineno,
        "zero-width Unicode character detected",
        FIXES["trojan_zero_width"],
    )


def check_trojan(lines: list[str]) -> list[Smell]:
    """Scan lines for trojan source Unicode characters.

    Args:
        lines: Source file lines to scan.

    Returns:
        List of Smell objects for detected trojan characters.
    """
    smells: list[Smell] = []
    for lineno, line in enumerate(lines, start=1):
        for checker in (_check_bidi, _check_zero_width):
            result = checker(line, lineno)
            if result is not None:
                smells.append(result)
    return smells
