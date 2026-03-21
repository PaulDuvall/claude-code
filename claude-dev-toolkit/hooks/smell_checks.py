"""Code smell detection -- file-level checks, lizard checks, orchestration.

Delegates Python AST analysis to smell_python, JS/TS analysis to
smell_javascript, and shared types to smell_types.  This module
provides the public API: check_file() and format_violations().
"""

from __future__ import annotations

import os

from config import Config, DEFAULT_CONFIG, is_file_suppressed, load_config
from suppression import filter_suppressed
from smell_types import (
    DUPLICATE_MIN_LINES,
    DUPLICATE_MIN_OCCURRENCES,
    FIXES,
    MAX_PARAMETERS,
    MAX_COMPLEXITY,
    MAX_FUNCTION_LINES,
    Smell,
    apply_threshold_checks,
)
from smell_javascript import check_javascript
from smell_python import check_python
from smell_ruff import RUFF_EXTS, check_ruff

# ---------------------------------------------------------------------------
# File-level: length
# ---------------------------------------------------------------------------

def check_file_length(
    file_path: str, lines: list[str], config: Config | None = None,
) -> list[Smell]:
    """Flag files exceeding the configured max file lines."""
    limit = (config or DEFAULT_CONFIG).max_file_lines
    count = len(lines)
    if count <= limit:
        return []
    return [Smell(
        "long_file", os.path.basename(file_path), 1,
        f"file is {count} lines (max {limit})",
        FIXES["long_file"],
    )]


# ---------------------------------------------------------------------------
# File-level: duplicate blocks
# ---------------------------------------------------------------------------

_SKIP_PREFIXES = ("import ", "from ", "export ", "require(", "#", "//", "/*")
_TRIVIAL_LINES = frozenset((
    "{", "}", "(", ")", "[", "]",
    "else:", "else {", "try:", "finally:",
))


def _is_trivial(line: str) -> bool:
    """Return True for lines to skip in duplicate detection."""
    stripped = line.strip()
    if not stripped or stripped in _TRIVIAL_LINES:
        return True
    return stripped.startswith(_SKIP_PREFIXES)


def _build_fingerprints(lines: list[str]) -> dict[tuple[str, ...], list[int]]:
    """Map fingerprints of consecutive non-trivial lines to positions."""
    entries = [
        (i + 1, line.strip())
        for i, line in enumerate(lines)
        if not _is_trivial(line)
    ]
    fps: dict[tuple[str, ...], list[int]] = {}
    for i in range(len(entries) - DUPLICATE_MIN_LINES + 1):
        window = entries[i : i + DUPLICATE_MIN_LINES]
        fp = tuple(e[1] for e in window)
        fps.setdefault(fp, []).append(window[0][0])
    return fps


def _overlaps(locs: list[int], reported: set[int]) -> bool:
    """Return True if any location overlaps already-reported lines."""
    return any(
        loc + i in reported
        for loc in locs
        for i in range(DUPLICATE_MIN_LINES)
    )


def _mark_reported(locs: list[int], reported: set[int]) -> None:
    """Add all lines covered by locs into the reported set."""
    for loc in locs:
        reported.update(range(loc, loc + DUPLICATE_MIN_LINES))


def _make_dup_smell(locs: list[int]) -> Smell:
    """Create a Smell for a single duplicate block occurrence."""
    loc_str = ", ".join(str(loc) for loc in locs[:4])
    return Smell(
        "duplicate_block", "<repeated-code>", locs[0],
        f"{DUPLICATE_MIN_LINES}-line block repeated at lines {loc_str}",
        FIXES["duplicate_block"],
    )


def check_duplicate_blocks(
    file_path: str, lines: list[str], config: Config | None = None,
) -> list[Smell]:
    """Detect repeated consecutive code blocks within a file."""
    fps = _build_fingerprints(lines)
    smells: list[Smell] = []
    reported: set[int] = set()
    for _fp, locs in sorted(fps.items(), key=lambda x: x[1][0]):
        if len(locs) < DUPLICATE_MIN_OCCURRENCES:
            continue
        if _overlaps(locs, reported):
            continue
        _mark_reported(locs, reported)
        smells.append(_make_dup_smell(locs))
        if len(smells) >= 3:
            break
    return smells


# ---------------------------------------------------------------------------
# Lizard-based checks (non-JS/TS languages)
# ---------------------------------------------------------------------------

def _check_lizard_func(func: object) -> list[Smell]:
    """Check a single lizard function result for smells."""
    name = getattr(func, "name", "<unknown>")
    line = getattr(func, "start_line", 0)
    return apply_threshold_checks(name, line, [
        ("complexity", getattr(func, "cyclomatic_complexity", 0), MAX_COMPLEXITY),
        ("long_function", getattr(func, "nloc", 0), MAX_FUNCTION_LINES),
        ("too_many_params", len(getattr(func, "parameters", [])), MAX_PARAMETERS),
    ])


def check_with_lizard(file_path: str) -> list[Smell]:
    """Use lizard for CC, function length, and parameter count."""
    try:
        import lizard
    except ImportError:
        return []
    try:
        analysis = lizard.analyze_file(file_path)
    except Exception:
        return []
    smells: list[Smell] = []
    for func in analysis.function_list:
        smells.extend(_check_lizard_func(func))
    return smells


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

PYTHON_EXTS = frozenset((".py",))
JS_EXTS = frozenset((".js", ".jsx", ".ts", ".tsx"))
LIZARD_EXTS = frozenset((".java", ".go", ".rs", ".c", ".cpp", ".cs"))
ALL_EXTS = PYTHON_EXTS | JS_EXTS | LIZARD_EXTS
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


def _run_lang_checks(ext: str, file_path: str, source: str) -> list[Smell]:
    """Run language-specific checks based on file extension."""
    if ext in PYTHON_EXTS:
        return check_python(file_path, source)
    if ext in JS_EXTS:
        return check_javascript(file_path, source)
    if ext in LIZARD_EXTS:
        return check_with_lizard(file_path)
    return []


def _ruff_then_reread(
    ext: str, file_path: str, source: str,
) -> tuple[list[Smell], str, list[str]]:
    """Run ruff on Python files and re-read; return smells + fresh source."""
    if ext not in RUFF_EXTS:
        return [], source, source.splitlines()
    smells = check_ruff(file_path)
    fresh = _read_source(file_path)
    if fresh is None:
        return smells, source, source.splitlines()
    return smells, fresh, fresh.splitlines()


def check_file(file_path: str, config: Config | None = None) -> list[Smell]:
    """Run all applicable smell checks on a single file."""
    if config is None:
        config = load_config(file_path)
    ext = os.path.splitext(file_path)[1]
    if ext not in ALL_EXTS or _should_skip(file_path):
        return []
    if is_file_suppressed(file_path, config):
        return []
    source = _read_source(file_path)
    if source is None:
        return []
    smells, source, lines = _ruff_then_reread(ext, file_path, source)
    smells.extend(check_file_length(file_path, lines, config))
    smells.extend(check_duplicate_blocks(file_path, lines, config))
    smells.extend(_run_lang_checks(ext, file_path, source))
    return filter_suppressed(smells, lines, "smell")


def format_violations(file_path: str, smells: list[Smell]) -> str:
    """Build the feedback message for Claude."""
    header = f"\nCODE SMELL VIOLATIONS in {file_path}:"
    details = []
    for s in smells:
        tag = s.kind.upper().replace("_", " ")
        details.append(f"  [{tag}] {s.name}() line {s.line}: {s.detail}")
    fixes = ["\nFix these code smells before moving on:"]
    for fix in dict.fromkeys(s.fix for s in smells):
        fixes.append(f"  - {fix}")
    fixes.append("Then notify the user what you fixed and why.")
    return "\n".join([header, *details, *fixes])
