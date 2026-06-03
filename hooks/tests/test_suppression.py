"""Tests for suppression module."""

from pathlib import Path

from smell_types import Smell
from suppression import filter_suppressed


def _smell(kind: str, line: int, name: str = "fn") -> Smell:
    """Create a minimal Smell for testing."""
    return Smell(kind, name, line, "detail", "fix")


class TestFilterSuppressed:
    def test_no_suppressions_passes_all(self):
        smells = [_smell("complexity", 5)]
        lines = ["x = 1"] * 10
        result = filter_suppressed(smells, lines, "smell")
        assert len(result) == 1

    def test_same_line_suppression(self):
        smells = [_smell("complexity", 3)]
        lines = ["x = 1", "y = 2", "z = 3  # smell: ignore[complexity]"]
        result = filter_suppressed(smells, lines, "smell")
        assert result == []

    def test_preceding_line_suppression(self):
        smells = [_smell("complexity", 3)]
        lines = ["x = 1", "# smell: ignore[complexity]", "def f(): pass"]
        result = filter_suppressed(smells, lines, "smell")
        assert result == []

    def test_wrong_namespace_not_suppressed(self):
        smells = [_smell("complexity", 2)]
        lines = ["# security: ignore[complexity]", "def f(): pass"]
        result = filter_suppressed(smells, lines, "smell")
        assert len(result) == 1

    def test_wrong_check_name_not_suppressed(self):
        smells = [_smell("complexity", 2)]
        lines = ["# smell: ignore[long_function]", "def f(): pass"]
        result = filter_suppressed(smells, lines, "smell")
        assert len(result) == 1

    def test_multiple_check_names(self):
        smells = [_smell("complexity", 2), _smell("long_function", 2)]
        lines = ["# smell: ignore[complexity,long_function]", "def f(): pass"]
        result = filter_suppressed(smells, lines, "smell")
        assert result == []

    def test_security_namespace_suppresses_non_secret(self):
        smells = [_smell("B101", 2)]
        lines = ["# security: ignore[B101]", "assert x"]
        result = filter_suppressed(smells, lines, "security")
        assert result == []

    def test_secrets_are_never_suppressible(self):
        # Secrets must NOT be suppressible even with a matching ignore.
        smells = [_smell("secrets", 2)]
        lines = ["# security: ignore[secrets]", "key = 'abc'"]
        result = filter_suppressed(smells, lines, "security")
        assert result == smells


class TestSuppressionAuditLog:
    def test_honored_suppression_is_logged(self, tmp_path):
        target = tmp_path / "mod.py"
        target.write_text("# smell: ignore[complexity]\ndef f(): pass\n")
        smells = [_smell("complexity", 2)]
        lines = ["# smell: ignore[complexity]", "def f(): pass"]
        result = filter_suppressed(smells, lines, "smell", str(target))
        assert result == []
        log = tmp_path / ".quality-gate" / "suppressions.log"
        assert log.exists()
        assert f"{target}:2 smell:complexity" in log.read_text()

    def test_suppressed_secret_is_not_logged(self, tmp_path):
        target = tmp_path / "mod.py"
        target.write_text("key = 'abc'  # security: ignore[secrets]\n")
        smells = [_smell("secrets", 1)]
        lines = ["key = 'abc'  # security: ignore[secrets]"]
        result = filter_suppressed(smells, lines, "security", str(target))
        # Secret kept (never suppressed) -> nothing honored -> no log file.
        assert result == smells
        assert not (tmp_path / ".quality-gate" / "suppressions.log").exists()

    def test_no_file_path_skips_logging(self):
        smells = [_smell("complexity", 1)]
        lines = ["x = 1  # smell: ignore[complexity]"]
        assert filter_suppressed(smells, lines, "smell") == []
