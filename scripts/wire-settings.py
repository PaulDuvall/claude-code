#!/usr/bin/env python3
"""Idempotently merge the Claude Code hook config into a settings.json.

Opt-in: invoked only by ``setup-hooks.sh --wire-settings``. Adds the
PostToolUse / PreToolUse / Stop / UserPromptSubmit hook commands from
hooks/settings.example.json into the target settings.json WITHOUT removing or
overwriting any existing hooks (matched by command string). Safe to run
repeatedly — re-running is a no-op once wired.
"""

from __future__ import annotations

import argparse
import json
import os
import sys


def _load(path: str) -> dict:
    """Load a JSON file, returning {} when missing or unparseable."""
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, json.JSONDecodeError):
        return {}


def _commands(group: dict) -> set:
    """Return the set of command strings already present in a hook group."""
    return {hook.get("command") for hook in group.get("hooks", [])}


def _merge_group(target_groups: list, src_group: dict) -> None:
    """Add a source group's commands into a matching target group, or append."""
    matcher = src_group.get("matcher", "")
    for group in target_groups:
        if group.get("matcher", "") == matcher:
            have = _commands(group)
            for hook in src_group.get("hooks", []):
                if hook.get("command") not in have:
                    group.setdefault("hooks", []).append(hook)
            return
    target_groups.append(src_group)


def merge(target: dict, source: dict) -> dict:
    """Merge source hooks into target additively; mutate and return target."""
    target_hooks = target.setdefault("hooks", {})
    for event, groups in source.get("hooks", {}).items():
        dest = target_hooks.setdefault(event, [])
        for group in groups:
            _merge_group(dest, group)
    return target


def _write(path: str, data: dict) -> None:
    """Write JSON to path, creating parent directories as needed."""
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2)
        handle.write("\n")


def main(argv: list[str] | None = None) -> int:
    """Merge --source hook config into --target settings.json (idempotent)."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True)
    parser.add_argument("--target", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)
    merged = merge(_load(args.target), _load(args.source))
    if args.dry_run:
        print(json.dumps(merged, indent=2))
        return 0
    _write(args.target, merged)
    print(f"wired hook config into {args.target}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
