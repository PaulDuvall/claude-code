"""Shared test fixtures for hooks test suite."""

from __future__ import annotations

import json
import os
import sys
from io import StringIO

import pytest

# Ensure hooks/ is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


def _make_tmp_file_factory(tmp_path, default_name: str):
    """Return a factory that creates temp files with given content."""
    def _create(content: str, name: str = default_name) -> str:
        path = tmp_path / name
        path.write_text(content, encoding="utf-8")
        return str(path)
    return _create


@pytest.fixture()
def tmp_py_file(tmp_path):
    """Create a temporary Python file with given content."""
    return _make_tmp_file_factory(tmp_path, "test_file.py")


@pytest.fixture()
def tmp_js_file(tmp_path):
    """Create a temporary JavaScript file with given content."""
    return _make_tmp_file_factory(tmp_path, "test_file.js")


@pytest.fixture()
def smellrc(tmp_path):
    """Create a .smellrc.json config file in tmp_path."""
    def _create(config: dict) -> str:
        path = tmp_path / ".smellrc.json"
        path.write_text(json.dumps(config), encoding="utf-8")
        return str(path)
    return _create


@pytest.fixture()
def mock_stdin():
    """Replace stdin with a StringIO containing JSON."""
    def _mock(data: dict) -> StringIO:
        stream = StringIO(json.dumps(data))
        return stream
    return _mock
