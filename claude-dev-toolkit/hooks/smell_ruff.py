"""Ruff lint + format integration for code smell hooks.

Auto-fixes fixable issues (unused imports, formatting), then reports
any remaining unfixable violations as blocking smells.
"""

from __future__ import annotations

import os
import shutil
import subprocess

from smell_types import Smell

RUFF_EXTS = frozenset((".py",))


def _ruff_cmd(project_root: str | None = None) -> list[str] | None:
    """Return command prefix for ruff, or None if unavailable."""
    if shutil.which("ruff"):
        return ["ruff"]
    if project_root:
        venv_ruff = os.path.join(project_root, ".venv", "bin", "ruff")
        if os.path.isfile(venv_ruff):
            return [venv_ruff]
    return None


def _run_ruff_cmd(cmd: list[str], cwd: str | None = None) -> tuple[int, str]:
    """Run a ruff command in the given directory."""
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=30, cwd=cwd,
        )
        return result.returncode, (result.stdout + result.stderr).strip()
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return 0, ""


def _parse_ruff_output(output: str) -> list[Smell]:
    """Convert remaining ruff output lines into Smell objects."""
    return [
        Smell("ruff_lint", "<ruff>", 0, line.strip(),
              "Fix the ruff lint violation manually.")
        for line in output.splitlines()
        if line.strip() and not line.strip().startswith("Found ")
    ]


def _find_project_root(file_path: str) -> str | None:
    """Walk up from file_path to find a pyproject.toml directory."""
    directory = os.path.dirname(os.path.abspath(file_path))
    while directory != os.path.dirname(directory):
        if os.path.isfile(os.path.join(directory, "pyproject.toml")):
            return directory
        directory = os.path.dirname(directory)
    return None


def check_ruff(file_path: str) -> list[Smell]:
    """Auto-fix with ruff, then report any remaining unfixable issues."""
    cwd = _find_project_root(file_path)
    prefix = _ruff_cmd(cwd)
    if not prefix:
        return []
    _run_ruff_cmd(prefix + ["check", "--fix", "--quiet", file_path], cwd)
    _run_ruff_cmd(prefix + ["format", "--quiet", file_path], cwd)
    check_cmd = prefix + ["check", "--output-format", "concise", file_path]
    code, out = _run_ruff_cmd(check_cmd, cwd)
    return _parse_ruff_output(out) if code != 0 else []
