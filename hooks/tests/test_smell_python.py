"""Tests for smell_python module."""

from smell_python import check_python


class TestCheckPython:
    def test_simple_function_no_smells(self, tmp_py_file):
        source = "def hello():\n    return 1\n"
        result = check_python("test.py", source)
        assert result == []

    def test_complex_function_detected(self, tmp_py_file):
        branches = "\n".join(
            f"    if x == {i}: return {i}" for i in range(12)
        )
        source = f"def complex_func(x):\n{branches}\n"
        result = check_python("test.py", source)
        kinds = [s.kind for s in result]
        assert "complexity" in kinds

    def test_long_function_detected(self, tmp_py_file):
        lines = "\n".join(f"    x = {i}" for i in range(25))
        source = f"def long_func():\n{lines}\n"
        result = check_python("test.py", source)
        kinds = [s.kind for s in result]
        assert "long_function" in kinds

    def test_deep_nesting_detected(self, tmp_py_file):
        source = (
            "def nested():\n"
            "    if True:\n"
            "        if True:\n"
            "            if True:\n"
            "                if True:\n"
            "                    pass\n"
        )
        result = check_python("test.py", source)
        kinds = [s.kind for s in result]
        assert "deep_nesting" in kinds

    def test_too_many_params_detected(self, tmp_py_file):
        source = "def many(a, b, c, d, e):\n    pass\n"
        result = check_python("test.py", source)
        kinds = [s.kind for s in result]
        assert "too_many_params" in kinds

    def test_self_cls_not_counted(self, tmp_py_file):
        source = "class C:\n    def method(self, a, b, c, d):\n        pass\n"
        result = check_python("test.py", source)
        kinds = [s.kind for s in result]
        assert "too_many_params" not in kinds

    def test_syntax_error_returns_empty(self, tmp_py_file):
        result = check_python("test.py", "def broken(:\n")
        assert result == []
