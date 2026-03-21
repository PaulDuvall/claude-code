"""Tests for check-commit-signing.py entry point."""

import json
import subprocess
import sys


def _run_hook(stdin_data: dict) -> subprocess.CompletedProcess:
    """Run check-commit-signing.py with JSON on stdin."""
    return subprocess.run(
        [sys.executable, "hooks/check-commit-signing.py"],
        input=json.dumps(stdin_data),
        capture_output=True, text=True, timeout=10,
    )


class TestCheckCommitSigningEntryPoint:
    def test_non_git_command_passes(self):
        result = _run_hook({"tool_input": {"command": "ls -la"}})
        assert result.returncode == 0
        assert result.stdout.strip() == ""

    def test_invalid_json_exits_cleanly(self):
        result = subprocess.run(
            [sys.executable, "hooks/check-commit-signing.py"],
            input="not json",
            capture_output=True, text=True, timeout=10,
        )
        assert result.returncode == 0

    def test_git_commit_checked(self):
        data = {"tool_input": {"command": "git commit -m 'test'"}}
        result = _run_hook(data)
        assert result.returncode == 0
        # Either blocks (signing not configured) or passes (signing configured)
        if result.stdout.strip():
            output = json.loads(result.stdout)
            assert output["decision"] == "block"
            assert "commit.gpgsign" in output["reason"]

    def test_remediation_includes_ssh_key_creation(self):
        data = {"tool_input": {"command": "git commit -m 'test'"}}
        result = _run_hook(data)
        if result.stdout.strip():
            output = json.loads(result.stdout)
            reason = output["reason"]
            assert "ssh-keygen -t ed25519" in reason
            assert "allowed_signers" in reason
            assert "gh ssh-key add" in reason

    def test_git_non_commit_passes(self):
        result = _run_hook({"tool_input": {"command": "git status"}})
        assert result.returncode == 0
        assert result.stdout.strip() == ""
