"""Per-project configuration loader for code smell and security hooks.

Searches for .smellrc.json walking up from the target file's directory.
Falls back to defaults matching the hardcoded thresholds in smell_types.
"""

from __future__ import annotations

import fnmatch
import json
import os
from dataclasses import dataclass, field
from functools import lru_cache


@dataclass(frozen=True)
class Config:
    """Immutable configuration for all hooks."""

    max_complexity: int = 10
    max_function_lines: int = 20
    max_nesting_depth: int = 3
    max_parameters: int = 4
    max_file_lines: int = 300
    duplicate_min_lines: int = 4
    security_enabled: bool = True
    trojan_enabled: bool = True
    suppress_files: tuple[str, ...] = ()


DEFAULT_CONFIG = Config()


def _find_config_file(start_dir: str) -> str | None:
    """Walk up from start_dir looking for .smellrc.json."""
    current = os.path.abspath(start_dir)
    root = os.path.dirname(current)
    while current != root:
        candidate = os.path.join(current, ".smellrc.json")
        if os.path.isfile(candidate):
            return candidate
        root = current
        current = os.path.dirname(current)
    return None


def _parse_config(path: str) -> Config:
    """Parse a .smellrc.json file into a Config object."""
    with open(path, "r", encoding="utf-8") as fh:
        raw = json.load(fh)
    thresholds = raw.get("thresholds", {})
    security = raw.get("security", {})
    suppress = raw.get("suppress_files", [])
    return Config(
        max_complexity=thresholds.get("max_complexity", DEFAULT_CONFIG.max_complexity),
        max_function_lines=thresholds.get("max_function_lines", DEFAULT_CONFIG.max_function_lines),
        max_nesting_depth=thresholds.get("max_nesting_depth", DEFAULT_CONFIG.max_nesting_depth),
        max_parameters=thresholds.get("max_parameters", DEFAULT_CONFIG.max_parameters),
        max_file_lines=thresholds.get("max_file_lines", DEFAULT_CONFIG.max_file_lines),
        duplicate_min_lines=thresholds.get("duplicate_min_lines", DEFAULT_CONFIG.duplicate_min_lines),
        security_enabled=security.get("enabled", DEFAULT_CONFIG.security_enabled),
        trojan_enabled=security.get("trojan_enabled", DEFAULT_CONFIG.trojan_enabled),
        suppress_files=tuple(suppress),
    )


@lru_cache(maxsize=32)
def _cached_load(config_path: str) -> Config:
    """Load and cache a config file by its resolved path."""
    return _parse_config(config_path)


def load_config(file_path: str) -> Config:
    """Load config for a given source file.

    Args:
        file_path: Path to the source file being checked.

    Returns:
        Config from nearest .smellrc.json, or DEFAULT_CONFIG.
    """
    start = os.path.dirname(os.path.abspath(file_path))
    config_path = _find_config_file(start)
    if config_path is None:
        return DEFAULT_CONFIG
    try:
        return _cached_load(config_path)
    except (json.JSONDecodeError, OSError, KeyError, TypeError):
        return DEFAULT_CONFIG


def is_file_suppressed(file_path: str, config: Config) -> bool:
    """Check if a file matches any suppress_files glob patterns.

    Args:
        file_path: Path to check against suppression globs.
        config: Config with suppress_files patterns.

    Returns:
        True if the file should be skipped.
    """
    if not config.suppress_files:
        return False
    basename = os.path.basename(file_path)
    for pattern in config.suppress_files:
        if fnmatch.fnmatch(basename, pattern):
            return True
        if fnmatch.fnmatch(file_path, pattern):
            return True
    return False
