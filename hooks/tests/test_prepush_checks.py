"""Tests for hooks/prepush_checks.py — Tier 2 pre-push logic.

ASH itself is never invoked here (it has a ~10s floor); _run_ash and
changed_files are monkeypatched so the routing/gating logic is tested in
isolation.
"""

from __future__ import annotations

import prepush_checks


class TestApplicabilityGate:
    def test_no_changed_files_silent(self, monkeypatch, capsys):
        monkeypatch.setattr(prepush_checks, "changed_files", lambda: [])
        assert prepush_checks.main() == 0
        out = capsys.readouterr()
        assert out.out == "" and out.err == ""

    def test_docs_only_push_does_not_invoke_ash(self, monkeypatch, capsys):
        monkeypatch.setattr(prepush_checks, "changed_files", lambda: ["README.md"])

        def _boom(*_a, **_k):
            raise AssertionError("ASH must not run for a docs-only push")

        monkeypatch.setattr(prepush_checks, "_run_ash", _boom)
        assert prepush_checks.main() == 0
        out = capsys.readouterr()
        assert out.out == "" and out.err == ""

    def test_code_change_invokes_ash(self, monkeypatch):
        monkeypatch.setattr(prepush_checks, "changed_files", lambda: ["app.py"])
        seen = {}

        def _fake(_src, scanners):
            seen["scanners"] = scanners
            return 0, ""

        monkeypatch.setattr(prepush_checks, "_run_ash", _fake)
        monkeypatch.setattr(prepush_checks.shutil, "which", lambda _n: "/bin/uvx")
        monkeypatch.setattr(prepush_checks, "_stage", lambda _f: "/tmp/x")
        monkeypatch.setattr(prepush_checks.shutil, "rmtree", lambda *_a, **_k: None)
        assert prepush_checks.main() == 0
        assert "bandit" in seen["scanners"]


class TestFailPolicy:
    def _wire(self, monkeypatch, code, output=""):
        monkeypatch.setattr(prepush_checks, "changed_files", lambda: ["main.tf"])
        monkeypatch.setattr(prepush_checks, "_stage", lambda _f: "/tmp/x")
        monkeypatch.setattr(prepush_checks.shutil, "rmtree", lambda *_a, **_k: None)
        monkeypatch.setattr(prepush_checks, "_run_ash", lambda *_a: (code, output))

    def test_findings_block(self, monkeypatch):
        self._wire(monkeypatch, 2, "checkov: FAILED CKV_AWS_1\n")
        monkeypatch.setattr(prepush_checks.shutil, "which", lambda _n: "/bin/uvx")
        assert prepush_checks.main() == 1

    def test_clean_passes(self, monkeypatch):
        self._wire(monkeypatch, 0, "")
        monkeypatch.setattr(prepush_checks.shutil, "which", lambda _n: "/bin/uvx")
        assert prepush_checks.main() == 0

    def test_uvx_missing_warns_not_blocks(self, monkeypatch, capsys):
        monkeypatch.setattr(prepush_checks, "changed_files", lambda: ["main.tf"])
        monkeypatch.setattr(prepush_checks.shutil, "which", lambda _n: None)
        assert prepush_checks.main() == 0
        assert "uvx not found" in capsys.readouterr().err


class TestChangedFiles:
    def test_falls_back_to_default_branch_when_no_push_ref(self, monkeypatch):
        calls = []

        def _fake_git(args):
            calls.append(args)
            if args[:3] == ["diff", "--name-only", "--diff-filter=ACM"]:
                rev = args[3]
                if rev == "@{push}":
                    return None  # new branch: no upstream push ref
                return "app.py\n"
            if args[0] == "symbolic-ref":
                return "refs/remotes/origin/main\n"
            return None

        monkeypatch.setattr(prepush_checks, "_run_git", _fake_git)
        monkeypatch.setattr(prepush_checks.os.path, "isfile", lambda _p: True)
        result = prepush_checks.changed_files()
        assert result == ["app.py"]
        # Confirms it never diffs the whole tree (always against a ref).
        assert ["diff", "--name-only", "--diff-filter=ACM", "@{push}"] in calls
