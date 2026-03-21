"""Tests for check-complexity.py entry point."""

import json
import subprocess
import sys


def _run_hook(stdin_data: dict) -> subprocess.CompletedProcess:
    """Run check-complexity.py with JSON on stdin."""
    return subprocess.run(
        [sys.executable, "hooks/check-complexity.py"],
        input=json.dumps(stdin_data),
        capture_output=True, text=True, timeout=10,
    )


class TestCheckComplexityEntryPoint:
    def test_clean_file_no_output(self, tmp_py_file):
        path = tmp_py_file("def f():\n    return 1\n")
        result = _run_hook({"tool_input": {"file_path": path}})
        assert result.stdout.strip() == ""

    def test_smelly_file_blocks(self, tmp_py_file):
        lines = "\n".join(f"    x = {i}" for i in range(25))
        path = tmp_py_file(f"def long():\n{lines}\n")
        result = _run_hook({"tool_input": {"file_path": path}})
        output = json.loads(result.stdout)
        assert output["decision"] == "block"

    def test_invalid_json_exits_cleanly(self):
        result = subprocess.run(
            [sys.executable, "hooks/check-complexity.py"],
            input="not json",
            capture_output=True, text=True, timeout=10,
        )
        assert result.returncode == 0

    def test_missing_file_exits_cleanly(self):
        result = _run_hook({"tool_input": {"file_path": "/no/such/file.py"}})
        assert result.returncode == 0
        assert result.stdout.strip() == ""
