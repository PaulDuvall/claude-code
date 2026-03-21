"""Tests for suppression module."""

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

    def test_security_namespace(self):
        smells = [_smell("secrets", 2)]
        lines = ["# security: ignore[secrets]", "key = 'abc'"]
        result = filter_suppressed(smells, lines, "security")
        assert result == []
