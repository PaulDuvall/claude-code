"""Native JS/TS token-based code smell checks.

Detects: cyclomatic complexity, long functions, deep nesting,
and too-many-parameters in JavaScript and TypeScript source files.

Uses a token-based parser (strip comments/strings, regex function
detection, brace matching) -- zero external dependencies.
"""

from __future__ import annotations

import re
from typing import NamedTuple

from smell_types import (
    MAX_COMPLEXITY,
    MAX_FUNCTION_LINES,
    MAX_NESTING_DEPTH,
    MAX_PARAMETERS,
    Smell,
    apply_threshold_checks,
)

# ---------------------------------------------------------------------------
# Layer 1 -- Tokenizer: strip comments and strings
# ---------------------------------------------------------------------------

_COMMENT_OR_STRING = re.compile(
    r"//[^\n]*"              # single-line comment
    r"|/\*[\s\S]*?\*/"       # multi-line comment
    r"|`(?:[^`\\]|\\.)*`"    # template literal
    r'|"(?:[^"\\]|\\.)*"'    # double-quoted string
    r"|'(?:[^'\\]|\\.)*'"    # single-quoted string
    r"|/(?![*/])(?:[^/\\\n]|\\.)+/[gimsuy]*"  # regex literal
)


def _strip_comments_and_strings(source: str) -> str:
    """Replace comment/string contents with spaces, preserving lines."""
    def _replacer(match: re.Match[str]) -> str:
        return re.sub(r"[^\n]", " ", match.group(0))
    return _COMMENT_OR_STRING.sub(_replacer, source)


# ---------------------------------------------------------------------------
# Layer 2 -- Function Finder
# ---------------------------------------------------------------------------

class _JsFunc(NamedTuple):
    """A detected JS/TS function."""

    name: str
    start_line: int
    end_line: int
    params_str: str
    body_source: str


_MAYBE_ASYNC = r"(?:async\s+)?"
_MAYBE_EXPORT = r"(?:export\s+)?"
_MAYBE_GENERICS = r"(?:<[^>]*>)?"
_MAYBE_RETURN_TYPE = r"(?::\s*[^{]+?)?"
_IDENT = r"(?P<name>[a-zA-Z_$][a-zA-Z0-9_$]*)"
_PARAMS = r"\((?P<params>[^)]*)\)"
_DECL_VAR = r"(?:const|let|var)"
_MAYBE_TYPE_ANN = r"(?::\s*[^=]+?)?"
_MAYBE_STAR = r"\*?\s*"

# Shared tail: <generics?> (params) <return-type?> {
_PARAMS_OPEN = r"\s*" + _MAYBE_GENERICS + r"\s*" + _PARAMS + r"\s*" + _MAYBE_RETURN_TYPE
_VAR_PREFIX = _MAYBE_EXPORT + _DECL_VAR + r"\s+" + _IDENT + r"\s*" + _MAYBE_TYPE_ANN + r"\s*=\s*"

# Patterns that detect function declarations in stripped source.
_FUNC_PATTERNS = [
    # function declaration / async function declaration
    re.compile(
        _MAYBE_EXPORT + _MAYBE_ASYNC + r"function\s*" + _MAYBE_STAR
        + _IDENT + _PARAMS_OPEN + r"\s*\{"
    ),
    # const/let/var name = function(params) {
    re.compile(
        _VAR_PREFIX + _MAYBE_ASYNC + r"function\s*" + _MAYBE_STAR
        + r"(?:[a-zA-Z_$][a-zA-Z0-9_$]*)?" + _PARAMS_OPEN + r"\s*\{"
    ),
    # const/let/var name = (params) => {
    re.compile(
        _VAR_PREFIX + _MAYBE_ASYNC + _MAYBE_GENERICS
        + r"\s*" + _PARAMS + r"\s*" + _MAYBE_RETURN_TYPE + r"\s*=>\s*\{"
    ),
    # class method: name(params) {
    re.compile(
        r"(?:(?:async|static|get|set|public|private|protected"
        r"|readonly|override|abstract)\s+)*"
        + _IDENT + _PARAMS_OPEN + r"\s*\{"
    ),
]


def _match_brace(source: str, open_pos: int) -> int:
    """Return index of the closing } that matches the { at open_pos."""
    depth = 1
    for i in range(open_pos + 1, len(source)):
        if source[i] == "{":
            depth += 1
            continue
        if source[i] != "}":
            continue
        depth -= 1
        if depth == 0:
            return i
    return len(source) - 1


def _line_of(source: str, char_index: int) -> int:
    """Return 1-based line number for char_index in source."""
    return source[:char_index].count("\n") + 1


def _overlaps_existing(start: int, ranges: list[tuple[int, int]]) -> bool:
    """Return True if start falls inside an already-claimed range."""
    return any(r_start <= start < r_end for r_start, r_end in ranges)


def _collect_raw_matches(stripped: str) -> list[tuple[int, int, str, str]]:
    """Scan stripped source for all function matches, deduped by range."""
    found: list[tuple[int, int, str, str]] = []
    used: list[tuple[int, int]] = []
    for pattern in _FUNC_PATTERNS:
        for match in pattern.finditer(stripped):
            start = match.start()
            if _overlaps_existing(start, used):
                continue
            brace_pos = stripped.index("{", match.end() - 1)
            close_pos = _match_brace(stripped, brace_pos)
            found.append((start, close_pos, match.group("name"), match.group("params")))
            used.append((start, close_pos))
    found.sort(key=lambda x: x[0])
    return found


def _find_functions(stripped: str) -> list[_JsFunc]:
    """Find all functions in the stripped source."""
    results: list[_JsFunc] = []
    for start, close, name, params in _collect_raw_matches(stripped):
        start_line = _line_of(stripped, start)
        end_line = _line_of(stripped, close)
        body = stripped[start:close + 1]
        results.append(_JsFunc(name, start_line, end_line, params, body))
    return results


# ---------------------------------------------------------------------------
# Layer 3 -- Metric functions
# ---------------------------------------------------------------------------

_CC_KEYWORDS = re.compile(
    r"\b(?:if|else\s+if|case|catch|for|while|do)\b"
)
_CC_OPERATORS = re.compile(r"&&|\|\||\?\?|\?\.")
_CC_TERNARY_REAL = re.compile(r"\?(?![.:])")


def _js_complexity(body: str) -> int:
    """Calculate cyclomatic complexity for a JS/TS function body."""
    cc = 1
    cc += len(_CC_KEYWORDS.findall(body))
    cc += len(_CC_OPERATORS.findall(body))
    cc += len(_CC_TERNARY_REAL.findall(body))
    return cc


def _js_func_lines(start: int, end: int) -> int:
    """Return line count for a function."""
    return end - start + 1


def _js_nesting_depth(body: str) -> int:
    """Calculate max nesting depth within a function body."""
    max_depth = 0
    depth = 0
    for ch in body:
        if ch == "{":
            depth += 1
            max_depth = max(max_depth, depth)
        elif ch == "}":
            depth = max(depth - 1, 0)
    # Subtract 1 for the function's own braces
    return max(max_depth - 1, 0)


_TS_TYPE_ANNOTATION = re.compile(r"\s*[?!]?\s*:\s*[^,)]+")


def _js_param_count(params_str: str) -> int:
    """Count parameters, stripping TS type annotations."""
    params = params_str.strip()
    if not params:
        return 0
    cleaned = _TS_TYPE_ANNOTATION.sub("", params)
    parts = [p.strip() for p in cleaned.split(",") if p.strip()]
    return len(parts)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def _check_js_func(func: _JsFunc) -> list[Smell]:
    """Check a single JS/TS function for all smells."""
    return apply_threshold_checks(func.name, func.start_line, [
        ("complexity", _js_complexity(func.body_source), MAX_COMPLEXITY),
        ("long_function", _js_func_lines(func.start_line, func.end_line),
         MAX_FUNCTION_LINES),
        ("deep_nesting", _js_nesting_depth(func.body_source),
         MAX_NESTING_DEPTH),
        ("too_many_params", _js_param_count(func.params_str),
         MAX_PARAMETERS),
    ])


def check_javascript(file_path: str, source: str) -> list[Smell]:
    """Run all token-based smell checks on a JS/TS file."""
    try:
        stripped = _strip_comments_and_strings(source)
        funcs = _find_functions(stripped)
    except Exception:
        return []
    smells: list[Smell] = []
    for func in funcs:
        smells.extend(_check_js_func(func))
    return smells
