"""Python AST-based security checks inspired by Bandit.

Detects common security anti-patterns without external dependencies:
B101 (assert), B102 (exec/eval), B105/B106 (hardcoded passwords),
B110 (try-except-pass), B301 (pickle), B602 (subprocess shell=True).
"""

from __future__ import annotations

import ast
import os

from smell_types import FIXES, Smell

# ---------------------------------------------------------------------------
# Individual check functions
# ---------------------------------------------------------------------------

_PASSWORD_NAMES = frozenset((
    "password", "passwd", "pwd", "secret", "token", "api_key",
))


def _is_test_file(file_path: str) -> bool:
    """Return True if file looks like a test file."""
    base = os.path.basename(file_path)
    return base.startswith("test_") or base.endswith("_test.py")


def _check_assert(node: ast.Assert, file_path: str) -> Smell | None:
    """B101: assert used outside test files."""
    if _is_test_file(file_path):
        return None
    return Smell(
        "B101", "assert", node.lineno,
        "assert used in non-test code",
        FIXES["B101"],
    )


def _check_exec_eval(node: ast.Call) -> Smell | None:
    """B102: exec() or eval() call detected."""
    func = node.func
    if isinstance(func, ast.Name) and func.id in ("exec", "eval"):
        return Smell(
            "B102", func.id, node.lineno,
            f"{func.id}() call detected",
            FIXES["B102"],
        )
    return None


def _check_hardcoded_password(node: ast.Assign) -> Smell | None:
    """B105/B106: hardcoded string assigned to password-like variable."""
    if not isinstance(node.value, ast.Constant):
        return None
    if not isinstance(node.value.value, str):
        return None
    if not node.value.value or len(node.value.value) < 2:
        return None
    for target in node.targets:
        name = _extract_name(target)
        if name and name.lower() in _PASSWORD_NAMES:
            return Smell(
                "B105", name, node.lineno,
                f"hardcoded value assigned to '{name}'",
                FIXES["B105"],
            )
    return None


def _extract_name(node: ast.AST) -> str | None:
    """Extract variable name from an assignment target."""
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        return node.attr
    return None


def _check_except_pass(node: ast.ExceptHandler) -> Smell | None:
    """B110: except block that only contains pass."""
    if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
        return Smell(
            "B110", "except-pass", node.lineno,
            "except block silently passes",
            FIXES["B110"],
        )
    return None


def _check_pickle(node: ast.Call) -> Smell | None:
    """B301: pickle.loads/load call detected."""
    func = node.func
    if not isinstance(func, ast.Attribute):
        return None
    if func.attr not in ("load", "loads"):
        return None
    if isinstance(func.value, ast.Name) and func.value.id == "pickle":
        return Smell(
            "B301", "pickle", node.lineno,
            f"pickle.{func.attr}() used on potentially untrusted data",
            FIXES["B301"],
        )
    return None


def _check_subprocess_shell(node: ast.Call) -> Smell | None:
    """B602: subprocess call with shell=True."""
    func = node.func
    if not isinstance(func, ast.Attribute):
        return None
    if func.attr not in ("call", "run", "Popen", "check_output"):
        return None
    if not (isinstance(func.value, ast.Name) and func.value.id == "subprocess"):
        return None
    for kw in node.keywords:
        if kw.arg == "shell" and _is_true_constant(kw.value):
            return Smell(
                "B602", f"subprocess.{func.attr}", node.lineno,
                "subprocess call with shell=True",
                FIXES["B602"],
            )
    return None


def _is_true_constant(node: ast.AST) -> bool:
    """Return True if the node is the constant True."""
    return isinstance(node, ast.Constant) and node.value is True


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def check_bandit(file_path: str, source: str) -> list[Smell]:
    """Run AST-based security checks on Python source.

    Args:
        file_path: Path for context (test file detection).
        source: Python source code string.

    Returns:
        List of detected security violations.
    """
    try:
        tree = ast.parse(source, filename=file_path)
    except SyntaxError:
        return []
    smells: list[Smell] = []
    for node in ast.walk(tree):
        smell = _dispatch_check(node, file_path)
        if smell is not None:
            smells.append(smell)
    return smells


def _dispatch_check(node: ast.AST, file_path: str) -> Smell | None:
    """Route an AST node to the appropriate security check."""
    if isinstance(node, ast.Assert):
        return _check_assert(node, file_path)
    if isinstance(node, ast.Call):
        return _check_call(node)
    if isinstance(node, ast.Assign):
        return _check_hardcoded_password(node)
    if isinstance(node, ast.ExceptHandler):
        return _check_except_pass(node)
    return None


def _check_call(node: ast.Call) -> Smell | None:
    """Run all Call-node security checks, return first match."""
    for checker in (_check_exec_eval, _check_pickle, _check_subprocess_shell):
        result = checker(node)
        if result is not None:
            return result
    return None
