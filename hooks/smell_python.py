"""Python AST-based code smell checks.

Detects: cyclomatic complexity, long functions, deep nesting,
and too-many-parameters in Python source files.
"""

from __future__ import annotations

import ast

from smell_types import (
    MAX_COMPLEXITY,
    MAX_FUNCTION_LINES,
    MAX_NESTING_DEPTH,
    MAX_PARAMETERS,
    Smell,
    apply_threshold_checks,
)

_NESTING_TYPES: tuple[type, ...] = (
    ast.If, ast.For, ast.AsyncFor, ast.While,
    ast.Try, ast.With, ast.AsyncWith,
)
if hasattr(ast, "Match"):
    _NESTING_TYPES = (*_NESTING_TYPES, ast.Match)
if hasattr(ast, "TryStar"):
    _NESTING_TYPES = (*_NESTING_TYPES, ast.TryStar)

_CC_DECISION_TYPES: dict[type, str] = {
    ast.If: "single", ast.IfExp: "single",
    ast.For: "single", ast.AsyncFor: "single", ast.While: "single",
    ast.ExceptHandler: "single",
    ast.With: "single", ast.AsyncWith: "single",
    ast.Assert: "single",
    ast.BoolOp: "boolop",
}


def _py_nesting_depth(node: ast.AST) -> int:
    """Return the maximum nesting depth within *node*."""
    max_depth = 0

    def _visit(current: ast.AST, depth: int) -> None:
        nonlocal max_depth
        max_depth = max(max_depth, depth)
        for child in ast.iter_child_nodes(current):
            inc = 1 if isinstance(child, _NESTING_TYPES) else 0
            _visit(child, depth + inc)

    _visit(node, 0)
    return max_depth


def _py_func_lines(node: ast.AST) -> int:
    """Return line span of a function node."""
    start = getattr(node, "lineno", None)
    end = getattr(node, "end_lineno", None)
    if isinstance(start, int) and isinstance(end, int):
        return end - start + 1
    return 0


def _py_param_count(node: ast.FunctionDef) -> int:
    """Count user-facing parameters (excludes self/cls)."""
    args = node.args
    count = len(args.args) + len(args.posonlyargs) + len(args.kwonlyargs)
    if args.vararg:
        count += 1
    if args.kwarg:
        count += 1
    if args.args and args.args[0].arg in ("self", "cls"):
        count -= 1
    return count


def _py_complexity(node: ast.AST) -> int:
    """Calculate cyclomatic complexity for a Python function."""
    cc = 1
    for child in ast.walk(node):
        kind = _CC_DECISION_TYPES.get(type(child))
        if kind == "single":
            cc += 1
        elif kind == "boolop":
            cc += len(child.values) - 1
    return cc


def _check_py_func(node: ast.AST) -> list[Smell]:
    """Check a single Python function for all smells."""
    name: str = getattr(node, "name", "<unknown>")
    line: int = getattr(node, "lineno", 0)
    return apply_threshold_checks(name, line, [
        ("complexity", _py_complexity(node), MAX_COMPLEXITY),
        ("long_function", _py_func_lines(node), MAX_FUNCTION_LINES),
        ("deep_nesting", _py_nesting_depth(node), MAX_NESTING_DEPTH),
        ("too_many_params", _py_param_count(node), MAX_PARAMETERS),
    ])


def check_python(file_path: str, source: str) -> list[Smell]:
    """Run all AST-based smell checks on a Python file."""
    try:
        tree = ast.parse(source, filename=file_path)
    except SyntaxError:
        return []
    smells: list[Smell] = []
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            smells.extend(_check_py_func(node))
    return smells
