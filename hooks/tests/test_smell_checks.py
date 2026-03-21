"""Tests for smell_checks module."""

from config import Config
from smell_checks import (
    check_duplicate_blocks,
    check_file,
    check_file_length,
    format_violations,
)
from smell_types import Smell


class TestCheckFileLength:
    def test_short_file_no_smell(self):
        lines = ["x"] * 100
        assert check_file_length("f.py", lines) == []

    def test_over_limit_detected(self):
        lines = ["x"] * 301
        result = check_file_length("f.py", lines)
        assert len(result) == 1
        assert result[0].kind == "long_file"

    def test_respects_config(self):
        config = Config(max_file_lines=50)
        lines = ["x"] * 60
        result = check_file_length("f.py", lines, config)
        assert len(result) == 1


class TestCheckDuplicateBlocks:
    def test_no_duplicates(self):
        lines = [f"line_{i}" for i in range(20)]
        assert check_duplicate_blocks("f.py", lines) == []

    def test_duplicates_detected(self):
        block = ["result = compute(x)", "validate(result)", "store(result)", "log(result)"]
        lines = block + ["other = 1"] + block
        result = check_duplicate_blocks("f.py", lines)
        assert len(result) >= 1
        assert result[0].kind == "duplicate_block"


class TestCheckFile:
    def test_skips_unsupported_extension(self, tmp_path):
        path = tmp_path / "readme.md"
        path.write_text("# hello")
        assert check_file(str(path)) == []

    def test_skips_suppressed_file(self, tmp_py_file):
        config = Config(suppress_files=("test_file.py",))
        path = tmp_py_file("def f():\n    pass\n")
        assert check_file(path, config) == []

    def test_detects_python_smells(self, tmp_py_file):
        lines = "\n".join(f"    x = {i}" for i in range(25))
        path = tmp_py_file(f"def long():\n{lines}\n")
        result = check_file(path)
        kinds = [s.kind for s in result]
        assert "long_function" in kinds


class TestFormatViolations:
    def test_format_includes_header(self):
        smells = [Smell("complexity", "f", 1, "cc=15", "fix")]
        result = format_violations("test.py", smells)
        assert "CODE SMELL VIOLATIONS" in result
        assert "test.py" in result

    def test_format_includes_fix(self):
        smells = [Smell("complexity", "f", 1, "cc=15", "my fix")]
        result = format_violations("test.py", smells)
        assert "my fix" in result
