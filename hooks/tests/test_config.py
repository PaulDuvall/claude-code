"""Tests for config module."""

import json

from config import DEFAULT_CONFIG, Config, is_file_suppressed, load_config


class TestConfig:
    def test_default_values(self):
        assert DEFAULT_CONFIG.max_complexity == 10
        assert DEFAULT_CONFIG.max_function_lines == 20
        assert DEFAULT_CONFIG.security_enabled is True
        assert DEFAULT_CONFIG.trojan_enabled is True

    def test_frozen(self):
        with __import__("pytest").raises(AttributeError):
            DEFAULT_CONFIG.max_complexity = 99


def _make_py_in(tmp_path: object) -> str:
    """Create a dummy .py file in tmp_path and return its str path."""
    path = tmp_path / "test.py"
    path.write_text("pass")
    return str(path)


class TestLoadConfig:
    def test_no_config_returns_default(self, tmp_path):
        assert load_config(_make_py_in(tmp_path)) == DEFAULT_CONFIG

    def test_loads_smellrc(self, tmp_path, smellrc):
        smellrc({"thresholds": {"max_complexity": 15}})
        result = load_config(_make_py_in(tmp_path))
        assert result.max_complexity == 15
        assert result.max_function_lines == 20

    def test_invalid_json_returns_default(self, tmp_path):
        (tmp_path / ".smellrc.json").write_text("{invalid json")
        assert load_config(_make_py_in(tmp_path)) == DEFAULT_CONFIG

    def test_security_config(self, tmp_path, smellrc):
        smellrc({"security": {"enabled": False, "trojan_enabled": False}})
        result = load_config(_make_py_in(tmp_path))
        assert result.security_enabled is False
        assert result.trojan_enabled is False


class TestIsFileSuppressed:
    def test_no_patterns_not_suppressed(self):
        assert not is_file_suppressed("test.py", DEFAULT_CONFIG)

    def test_matching_glob_suppressed(self):
        config = Config(suppress_files=("*.test.py",))
        assert is_file_suppressed("foo.test.py", config)

    def test_non_matching_not_suppressed(self):
        config = Config(suppress_files=("*.test.py",))
        assert not is_file_suppressed("foo.py", config)
