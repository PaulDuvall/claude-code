#!/usr/bin/env python3
"""Fail the ASH gate when a suppression expiration has lapsed.

ASH validates every ``expiration`` in ``.ash/ash.yaml`` at config load and
rejects the ENTIRE file if any one of them is not in the future:

    YYYY-MM-DD: expiration date must be in the future
    WARNING  Using default configuration due to validation error

It then scans with built-in defaults, which silently discards every
suppression and every ignore_path -- not just the expired entry. The scan goes
red, but with a wall of triaged false positives rather than the one-line cause.
That happened on 2026-09-01: two lapsed dates turned a green gate into 149
"actionable" findings with no code change behind them.

This check runs BEFORE ASH and names the real cause. It also warns while an
expiration is still valid but close, so the renew-or-harden decision happens on
purpose instead of on the morning the gate breaks.

Stdlib only and Python 3.9 compatible, matching the rest of hooks/: these run in
pre-push and in CI, where PyYAML is not installed.

Usage:
    python3 hooks/check_ash_expirations.py [--config PATH]
                                           [--warn-days N] [--fail-days N]

Exit codes:
    0  no expiration lapsed (warnings may have been emitted)
    1  an expiration has lapsed, is malformed, or the config is missing
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from datetime import date, timedelta

DEFAULT_CONFIG = ".ash/ash.yaml"
DEFAULT_WARN_DAYS = 14
DEFAULT_FAIL_DAYS = 0

# expiration: "2026-12-01" | expiration: 2026-12-01 | expiration: '2026-12-01'
_EXPIRATION_RE = re.compile(
    r"""^(?P<indent>\s*)expiration:\s*(?P<quote>["']?)(?P<value>[^"'#\s]*)(?P=quote)\s*(?:\#.*)?$"""
)
# A key introducing a block scalar: `reason: >-`, `reason: |`, `note: >+`, ...
_BLOCK_SCALAR_RE = re.compile(r"^(?P<indent>\s*)[\w.-]+:\s*[|>][-+]?\d*\s*(?:\#.*)?$")


def _iter_expiration_lines(text: str):
    """Yield (line_number, raw_value) for each real ``expiration:`` key.

    Skips matches inside block scalars, so an ``expiration:`` written in prose
    under ``reason: >-`` is not mistaken for a key.
    """
    block_indent = None
    for lineno, line in enumerate(text.splitlines(), start=1):
        stripped = line.strip()

        if block_indent is not None:
            # Blank lines stay inside the block; the block ends at the first
            # non-blank line indented no deeper than the key that opened it.
            if not stripped:
                continue
            if len(line) - len(line.lstrip()) > block_indent:
                continue
            block_indent = None

        block = _BLOCK_SCALAR_RE.match(line)
        if block:
            block_indent = len(block.group("indent"))
            continue

        match = _EXPIRATION_RE.match(line)
        if match:
            yield lineno, match.group("value")


def _parse_date(value: str):
    """Return the parsed date, or None when the value is not YYYY-MM-DD."""
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value or ""):
        return None
    try:
        year, month, day = (int(part) for part in value.split("-"))
        return date(year, month, day)
    except ValueError:
        return None


def _annotate(level: str, config: str, lineno: int, message: str) -> None:
    """Print a GitHub Actions annotation in CI, plain text everywhere else."""
    if os.environ.get("GITHUB_ACTIONS") == "true":
        print("::{0} file={1},line={2}::{3}".format(level, config, lineno, message))
    else:
        print("{0}: {1}:{2}: {3}".format(level.upper(), config, lineno, message))


def check(config: str, today: date, warn_days: int, fail_days: int) -> int:
    """Check every expiration in ``config``. Returns a process exit code."""
    try:
        with open(config, encoding="utf-8") as handle:
            text = handle.read()
    except OSError as exc:
        print("ERROR: cannot read ASH config {0}: {1}".format(config, exc))
        return 1

    fail_before = today + timedelta(days=fail_days)
    warn_before = today + timedelta(days=warn_days)
    failures = 0
    checked = 0

    for lineno, raw in _iter_expiration_lines(text):
        checked += 1
        expires = _parse_date(raw)

        if expires is None:
            _annotate(
                "error", config, lineno,
                "expiration {0!r} is not a YYYY-MM-DD date; ASH will reject the "
                "whole config and scan with defaults".format(raw),
            )
            failures += 1
            continue

        # ASH requires the date to be in the future, so today itself is lapsed.
        if expires <= fail_before:
            remaining = (expires - today).days
            detail = (
                "lapsed {0} day(s) ago".format(-remaining) if remaining < 0
                else "expires today" if remaining == 0
                else "expires in {0} day(s)".format(remaining)
            )
            _annotate(
                "error", config, lineno,
                "suppression expiration {0} {1}. ASH rejects the entire config "
                "when any expiration is not in the future, dropping every "
                "suppression and ignore_path. Renew the date or land the "
                "hardening it is holding open.".format(expires.isoformat(), detail),
            )
            failures += 1
        elif expires <= warn_before:
            _annotate(
                "warning", config, lineno,
                "suppression expiration {0} is {1} day(s) away. When it lapses, "
                "ASH discards every suppression and ignore_path in this file.".format(
                    expires.isoformat(), (expires - today).days
                ),
            )

    if failures:
        print(
            "\n{0}: {1} of {2} expiration(s) lapsed or malformed. "
            "ASH would fall back to default configuration.".format(
                config, failures, checked
            )
        )
        return 1

    print("{0}: {1} expiration(s) valid.".format(config, checked))
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="Fail when an ASH suppression expiration has lapsed."
    )
    parser.add_argument("--config", default=DEFAULT_CONFIG, help="path to ash.yaml")
    parser.add_argument(
        "--warn-days", type=int, default=DEFAULT_WARN_DAYS,
        help="warn when an expiration is this many days away (default: 14)",
    )
    parser.add_argument(
        "--fail-days", type=int, default=DEFAULT_FAIL_DAYS,
        help="fail this many days before expiry; 0 fails only once lapsed",
    )
    args = parser.parse_args(argv)
    return check(args.config, date.today(), args.warn_days, args.fail_days)


if __name__ == "__main__":
    sys.exit(main())
