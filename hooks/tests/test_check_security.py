"""Tests for check-security.py entry point."""

import json
import subprocess
import sys


def _run_hook(stdin_data: dict) -> subprocess.CompletedProcess:
    """Run check-security.py with JSON on stdin."""
    return subprocess.run(
        [sys.executable, "hooks/check-security.py"],
        input=json.dumps(stdin_data),
        capture_output=True, text=True, timeout=10,
    )


class TestCheckSecurityEntryPoint:
    def test_clean_file_no_output(self, tmp_py_file):
        path = tmp_py_file("x = 1\nprint(x)\n")
        result = _run_hook({"tool_input": {"file_path": path}})
        assert result.stdout.strip() == ""

    def test_secret_blocks(self, tmp_py_file):
        path = tmp_py_file("key = 'AKIAIOSFODNN7ZZZZZZZ'\n")
        result = _run_hook({"tool_input": {"file_path": path}})
        output = json.loads(result.stdout)
        assert output["decision"] == "block"

    def test_invalid_json_exits_cleanly(self):
        result = subprocess.run(
            [sys.executable, "hooks/check-security.py"],
            input="not json",
            capture_output=True, text=True, timeout=10,
        )
        assert result.returncode == 0

    def test_missing_file_exits_cleanly(self):
        result = _run_hook({"tool_input": {"file_path": "/no/such/f.py"}})
        assert result.returncode == 0
        assert result.stdout.strip() == ""
