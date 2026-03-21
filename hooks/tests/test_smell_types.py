"""Tests for smell_types module."""

from smell_types import FIXES, Smell, apply_threshold_checks, make_smell


class TestSmell:
    def test_smell_is_frozen(self):
        smell = Smell("complexity", "foo", 1, "detail", "fix")
        with __import__("pytest").raises(AttributeError):
            smell.kind = "other"

    def test_smell_fields(self):
        smell = Smell("complexity", "func", 10, "cc=15", "fix it")
        assert smell.kind == "complexity"
        assert smell.name == "func"
        assert smell.line == 10


class TestMakeSmell:
    def test_complexity_detail(self):
        smell = make_smell("complexity", "foo", 5, 15)
        assert "15" in smell.detail
        assert "max" in smell.detail
        assert smell.fix == FIXES["complexity"]

    def test_long_function_detail(self):
        smell = make_smell("long_function", "bar", 1, 30)
        assert "30 lines" in smell.detail


class TestApplyThresholdChecks:
    def test_returns_smells_over_threshold(self):
        checks = [("complexity", 15, 10), ("long_function", 10, 20)]
        result = apply_threshold_checks("fn", 1, checks)
        assert len(result) == 1
        assert result[0].kind == "complexity"

    def test_returns_empty_at_threshold(self):
        checks = [("complexity", 10, 10)]
        result = apply_threshold_checks("fn", 1, checks)
        assert result == []

    def test_returns_empty_below_threshold(self):
        checks = [("complexity", 5, 10)]
        result = apply_threshold_checks("fn", 1, checks)
        assert result == []
