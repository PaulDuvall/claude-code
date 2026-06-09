"""Tests for scripts/wire-settings.py — idempotent, additive settings merge."""

from __future__ import annotations

import json
import os
import subprocess
import sys

_SCRIPT = os.path.join(
    os.path.dirname(__file__), "..", "..", "scripts", "wire-settings.py",
)

_SOURCE = {
    "hooks": {
        "PostToolUse": [
            {"matcher": "Write|Edit", "hooks": [
                {"type": "command", "command": "python3 ~/.claude/hooks/check-security.py"},
            ]},
        ],
    }
}


def _write(path, data):
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(data, handle)


def _run(source_path, target_path):
    return subprocess.run(
        [sys.executable, _SCRIPT, "--source", source_path, "--target", target_path],
        capture_output=True, text=True, timeout=10,
    )


def _post_commands(settings):
    groups = settings["hooks"]["PostToolUse"]
    return [h["command"] for g in groups for h in g["hooks"]]


class TestWireSettings:
    def test_merges_into_empty_target(self, tmp_path):
        src = tmp_path / "src.json"; _write(src, _SOURCE)
        tgt = tmp_path / "settings.json"
        assert _run(str(src), str(tgt)).returncode == 0
        out = json.loads(tgt.read_text())
        assert "check-security.py" in _post_commands(out)[0]

    def test_idempotent_no_duplicates(self, tmp_path):
        src = tmp_path / "src.json"; _write(src, _SOURCE)
        tgt = tmp_path / "settings.json"
        _run(str(src), str(tgt))
        _run(str(src), str(tgt))  # second run must be a no-op
        out = json.loads(tgt.read_text())
        assert len(_post_commands(out)) == 1

    def test_preserves_existing_unrelated_hooks(self, tmp_path):
        existing = {"hooks": {"UserPromptSubmit": [
            {"matcher": "", "hooks": [{"type": "command", "command": "echo keep-me"}]},
        ]}}
        src = tmp_path / "src.json"; _write(src, _SOURCE)
        tgt = tmp_path / "settings.json"; _write(tgt, existing)
        _run(str(src), str(tgt))
        out = json.loads(tgt.read_text())
        ups = out["hooks"]["UserPromptSubmit"][0]["hooks"][0]["command"]
        assert ups == "echo keep-me"  # untouched
        assert "check-security.py" in _post_commands(out)[0]  # ours added

    def test_appends_command_to_existing_matcher(self, tmp_path):
        existing = {"hooks": {"PostToolUse": [
            {"matcher": "Write|Edit", "hooks": [
                {"type": "command", "command": "python3 ~/.claude/hooks/other.py"},
            ]},
        ]}}
        src = tmp_path / "src.json"; _write(src, _SOURCE)
        tgt = tmp_path / "settings.json"; _write(tgt, existing)
        _run(str(src), str(tgt))
        cmds = _post_commands(json.loads(tgt.read_text()))
        assert any("other.py" in c for c in cmds)
        assert any("check-security.py" in c for c in cmds)
