"""Tests for security_trojan module."""

from security_trojan import check_trojan


class TestBidiDetection:
    def test_clean_file(self):
        lines = ["x = 1", "print(x)"]
        assert check_trojan(lines) == []

    def test_bidi_override_detected(self):
        lines = ["x = '\u202a' + y"]
        result = check_trojan(lines)
        assert len(result) == 1
        assert result[0].kind == "trojan_bidi"

    def test_bidi_isolate_detected(self):
        lines = ["x = '\u2066hidden\u2069'"]
        result = check_trojan(lines)
        assert len(result) >= 1
        assert result[0].kind == "trojan_bidi"


class TestZeroWidthDetection:
    def test_zero_width_space_detected(self):
        lines = ["normal", "x\u200b = 1"]
        result = check_trojan(lines)
        assert len(result) == 1
        assert result[0].kind == "trojan_zero_width"
        assert result[0].line == 2

    def test_bom_at_file_start_allowed(self):
        lines = ["\ufeffimport os"]
        assert check_trojan(lines) == []

    def test_bom_not_at_start_detected(self):
        lines = ["import os", "x\ufeff = 1"]
        result = check_trojan(lines)
        assert len(result) == 1
        assert result[0].line == 2

    def test_bom_mid_first_line_detected(self):
        lines = ["x = \ufeff1"]
        result = check_trojan(lines)
        assert len(result) == 1
