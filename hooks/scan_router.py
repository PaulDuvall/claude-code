#!/usr/bin/env python3
"""Applicability router for the tiered ASH scanner integration.

Single source of truth for "which scanner applies to which file type",
shared by the tiered git hooks (pre-commit, pre-push) and mirrored by
``.ash/ash.yaml``. A scanner is applicable only when the change set contains
a file type it analyzes; an empty or non-applicable change set yields no
scanners and produces no output.

Also provides the single-file IaC checker (``checkov -f``) used at Tier 1
(pre-commit). Benchmarked at ~1.5s per file on this repo, which exceeds the
300ms Tier-0 budget, so the IaC check lives at Tier 1+ and the PostToolUse
path stays Python/secrets-only. See docs/ash-integration.md.

CloudFormation is detected by content (``Resources`` plus an
``AWSTemplateFormatVersion`` or an ``AWS::``-style resource type), not by
extension, so GitHub Actions and Kubernetes YAML are never cfn-nag targets.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from functools import lru_cache

# ---------------------------------------------------------------------------
# File-type classification — the applicability mapping lives here, once.
# ---------------------------------------------------------------------------

_SEMGREP_EXTS = frozenset((
    ".py", ".js", ".jsx", ".ts", ".tsx", ".go", ".rb", ".java", ".php",
))
_YAMLISH = frozenset((".yaml", ".yml"))
_NPM_FILES = frozenset(("package.json", "package-lock.json"))
# Dependency manifests / lockfiles that Grype (SCA) understands.
_MANIFESTS = frozenset((
    "package.json", "package-lock.json", "yarn.lock", "requirements.txt",
    "pipfile.lock", "poetry.lock", "go.sum", "gemfile.lock", "cargo.lock",
    "pom.xml",
))
# Binary/asset extensions detect-secrets and friends should never read.
_BINARY_EXTS = frozenset((
    ".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip", ".gz", ".tgz", ".ico",
    ".woff", ".woff2", ".ttf", ".so", ".dylib", ".dll", ".bin", ".jar",
))

_CFN_TYPE_RE = re.compile(r"""Type:\s*["']?(?:AWS|Custom|Alexa)::""")
_TOP_RESOURCES_RE = re.compile(r"(?m)^Resources:\s*(?:#.*)?$")
_TOP_KEY_RE = re.compile(r"(?m)^(?P<key>[A-Za-z][\w-]*):")
_CHECKOV_TIMEOUT = 20


def _ext(path: str) -> str:
    """Return the lowercased file extension including the dot."""
    return os.path.splitext(path)[1].lower()


@lru_cache(maxsize=256)
def _read_text(path: str) -> str | None:
    """Read a file as text, returning None on failure (cached per run)."""
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as handle:
            return handle.read()
    except OSError:
        return None


def _top_level_keys(text: str) -> set[str]:
    """Return the set of unindented top-level keys in a YAML-ish document."""
    return {match.group("key") for match in _TOP_KEY_RE.finditer(text)}


def is_text_file(path: str) -> bool:
    """Return True for files detect-secrets can meaningfully scan."""
    if _ext(path) in _BINARY_EXTS:
        return False
    return _read_text(path) is not None


def is_dockerfile(path: str) -> bool:
    """Return True if the path names a Dockerfile."""
    base = os.path.basename(path).lower()
    return base == "dockerfile" or base.endswith((".dockerfile", "-dockerfile"))


def _json_is_cfn(text: str) -> bool:
    """Detect a JSON CloudFormation template by structure."""
    try:
        data = json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return False
    if not isinstance(data, dict) or not isinstance(data.get("Resources"), dict):
        return False
    if "AWSTemplateFormatVersion" in data:
        return True
    return any(
        isinstance(res, dict) and str(res.get("Type", "")).startswith(
            ("AWS::", "Custom::", "Alexa::"))
        for res in data["Resources"].values()
    )


def _yaml_is_cfn(text: str) -> bool:
    """Detect a YAML CloudFormation template by content heuristics."""
    if not _TOP_RESOURCES_RE.search(text):
        return False
    return "AWSTemplateFormatVersion" in text or bool(_CFN_TYPE_RE.search(text))


def _yaml_text(path: str) -> str | None:
    """Return the text of a YAML file, or None if not YAML or unreadable."""
    if _ext(path) not in _YAMLISH:
        return None
    return _read_text(path)


def is_cfn_template(path: str) -> bool:
    """Detect a CloudFormation template by content, not by extension.

    GitHub Actions workflows (top-level ``on``/``jobs``) and Kubernetes
    manifests (top-level ``kind``/``apiVersion``) lack a ``Resources`` block
    and are deliberately excluded.
    """
    if _ext(path) == ".json":
        text = _read_text(path)
        return text is not None and _json_is_cfn(text)
    text = _yaml_text(path)
    return text is not None and _yaml_is_cfn(text)


def is_k8s_manifest(path: str) -> bool:
    """Detect a Kubernetes manifest by its top-level apiVersion + kind keys."""
    text = _yaml_text(path)
    return text is not None and {"apiVersion", "kind"} <= _top_level_keys(text)


def is_iac_file(path: str) -> bool:
    """Return True if checkov should scan this file (Terraform/CFN/k8s/Docker)."""
    ext = _ext(path)
    if ext == ".tf" or is_dockerfile(path):
        return True
    if ext in _YAMLISH or ext == ".json":
        return is_cfn_template(path) or is_k8s_manifest(path)
    return False


def _scanners_for_file(path: str) -> set[str]:
    """Return the scanner names applicable to a single file."""
    scanners: set[str] = set()
    ext = _ext(path)
    base = os.path.basename(path).lower()
    if is_text_file(path):
        scanners.add("detect-secrets")
    if ext == ".py":
        scanners.add("bandit")
    if ext in _SEMGREP_EXTS:
        scanners.add("semgrep")
    if is_iac_file(path):
        scanners.add("checkov")
    if is_cfn_template(path):
        scanners.add("cfn-nag")
    if base in _NPM_FILES:
        scanners.add("npm-audit")
    if base in _MANIFESTS:
        scanners.add("grype")
    return scanners


def applicable_scanners(files: list[str]) -> set[str]:
    """Compute the set of scanners applicable to a change set.

    Args:
        files: The tier-scoped change set (already filtered to real files).

    Returns:
        The union of scanners applicable to any file in the change set.
        Empty when the change set is empty or analyzes nothing.
    """
    result: set[str] = set()
    for path in files:
        result |= _scanners_for_file(path)
    return result


def iac_files(files: list[str]) -> list[str]:
    """Filter a change set down to the IaC files checkov should scan."""
    return [path for path in files if is_iac_file(path)]


# ---------------------------------------------------------------------------
# Tier 1 single-file IaC checker (checkov -f)
# ---------------------------------------------------------------------------

def run_checkov_file(path: str) -> tuple[int, str]:
    """Run checkov on a single IaC file via uvx; return (returncode, stdout).

    Uses list-form subprocess (never shell=True). Tool/IO failures degrade to
    a clean (0, "") so a missing checkov never blocks a commit spuriously.
    """
    cmd = [
        "uvx", "--from", "checkov", "checkov",
        "-f", path, "--compact", "--quiet",
    ]
    try:
        proc = subprocess.run(
            cmd, capture_output=True, text=True, timeout=_CHECKOV_TIMEOUT,
        )
    except (OSError, subprocess.TimeoutExpired):
        return 0, ""
    return proc.returncode, proc.stdout


def check_iac(files: list[str]) -> int:
    """Run checkov on each applicable IaC file; print only real findings.

    Returns a non-zero exit code when checkov reports findings, 0 (silent)
    when nothing is applicable or everything passes.
    """
    targets = iac_files(files)
    if not targets:
        return 0
    failed = False
    for path in targets:
        code, output = run_checkov_file(path)
        if code != 0 and output.strip():
            sys.stdout.write(output if output.endswith("\n") else output + "\n")
            failed = True
    return 1 if failed else 0


# ---------------------------------------------------------------------------
# CLI — internal plumbing for the shell git hooks
# ---------------------------------------------------------------------------

def _parse_args(argv: list[str]) -> argparse.Namespace:
    """Parse the router CLI arguments."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--files", nargs="*", default=[])
    parser.add_argument("--print-scanners", action="store_true")
    parser.add_argument("--check-iac", action="store_true")
    return parser.parse_args(argv)


def _existing_files(paths: list[str]) -> list[str]:
    """Keep only paths that are real files on disk."""
    return [path for path in paths if os.path.isfile(path)]


def main(argv: list[str]) -> int:
    """Route a change set to scanner names or run the Tier-1 IaC check."""
    args = _parse_args(argv)
    files = _existing_files(args.files)
    if not files:
        return 0
    if args.check_iac:
        return check_iac(files)
    if args.print_scanners:
        scanners = applicable_scanners(files)
        if scanners:
            sys.stdout.write(" ".join(sorted(scanners)) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
