"""Tests for security_checks orchestrator."""

from config import Config
from security_checks import check_security, format_security_violations
from smell_types import Smell


class TestCheckSecurity:
    def test_clean_file(self, tmp_py_file):
        path = tmp_py_file("x = 1\nprint(x)\n")
        assert check_security(path) == []

    def test_detects_secrets(self, tmp_py_file):
        path = tmp_py_file("key = 'AKIAIOSFODNN7ZZZZZZZ'\n")
        result = check_security(path)
        kinds = [s.kind for s in result]
        assert "secrets" in kinds

    def test_detects_bandit_issues(self, tmp_py_file):
        path = tmp_py_file("exec('bad')\n")
        result = check_security(path)
        kinds = [s.kind for s in result]
        assert "B102" in kinds

    def test_respects_security_disabled(self, tmp_py_file):
        config = Config(security_enabled=False)
        path = tmp_py_file("key = 'AKIAIOSFODNN7ZZZZZZZ'\n")
        assert check_security(path, config) == []

    def test_respects_trojan_disabled(self, tmp_py_file):
        config = Config(trojan_enabled=False)
        path = tmp_py_file("x = '\u200b'\n")
        assert check_security(path, config) == []

    def test_skips_unsupported_extension(self, tmp_path):
        path = tmp_path / "data.bin"
        path.write_bytes(b"\x00\x01")
        assert check_security(str(path)) == []

    def test_skips_suppressed_file(self, tmp_py_file):
        config = Config(suppress_files=("test_file.py",))
        path = tmp_py_file("exec('bad')\n")
        assert check_security(path, config) == []


class TestFormatSecurityViolations:
    def test_includes_header(self):
        smells = [Smell("secrets", "AWS key", 1, "detected", "fix")]
        result = format_security_violations("test.py", smells)
        assert "SECURITY VIOLATIONS" in result

    def test_includes_fix(self):
        smells = [Smell("secrets", "key", 1, "d", "use env vars")]
        result = format_security_violations("test.py", smells)
        assert "use env vars" in result
