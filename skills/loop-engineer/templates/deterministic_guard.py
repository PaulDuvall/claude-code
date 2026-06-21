"""GUARD template: the cheap, no-LLM invariant checker that complements an
agent loop.

The agent loop DISCOVERS and REPAIRS drift; this checker PREVENTS REGRESSION and
runs free on every commit. Encode only high-value, machine-checkable invariants
(facts shared by code and docs/specs). Exit non-zero and print each violation
when they disagree. Location-independent: resolve paths from the repo root.

This Python is one *instance* of the pattern, not the pattern itself. In a JS
repo, encode the same invariant as a vitest/jest test; in a shell repo, as a
bats assertion in your suite runner. What matters is: cheap, no-LLM, runs on
every commit, fails loud on drift.

Wire it into the suite so drift fails fast on every test run, not just CI:

    # tests/test_invariants.py
    import sys; from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
    import deterministic_guard
    def test_invariants_hold():
        v = deterministic_guard.check_all()
        assert v == [], "Drift:\\n" + "\\n".join(v)

And as a cheap CI gate (no Claude needed) on PR + a nightly schedule.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _read(rel_path: str) -> str:
    """Read a repo-relative text file."""
    return (ROOT / rel_path).read_text(encoding="utf-8")


# ── Each check returns a list of human-readable violation strings (empty = ok). ──
def check_example_constant_matches_doc() -> list[str]:
    """Example: a constant in code must match what a doc claims about it."""
    violations: list[str] = []
    match = re.search(r"EXCLUDED\s*=\s*\{([^}]*)\}", _read("src/example.py"))
    code_set = set(re.findall(r'"([^"]+)"', match.group(1))) if match else set()
    expected = {"A", "B"}  # the invariant
    if code_set != expected:
        violations.append(f"src/example.py EXCLUDED={code_set or 'unparsed'} != {expected}")
    if "A and B" not in _read("docs/example.md"):
        violations.append("docs/example.md no longer documents the A/B invariant")
    return violations


CHECKS = [check_example_constant_matches_doc]


def check_all() -> list[str]:
    """Run every invariant check; return a flat list of violations."""
    violations: list[str] = []
    for check in CHECKS:
        violations.extend(check())
    return violations


def main() -> int:
    """Print results; 0 = clean, 1 = drift."""
    violations = check_all()
    if not violations:
        print(f"OK: {len(CHECKS)} invariant group(s) hold.")
        return 0
    print(f"DRIFT: {len(violations)} violation(s):")
    for violation in violations:
        print(f"  - {violation}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
