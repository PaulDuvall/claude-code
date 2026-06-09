"""Tests for hooks/precommit_checks.py — Tier 1 pre-commit logic."""

from __future__ import annotations

import precommit_checks

# Assembled at runtime so this test file is not itself flagged as a secret.
# Avoids false-positive words (example/test/dummy/...) so detection fires.
_SECRET = "AKIA" + "IOSFODNN7ABCDQRST"


def _write(tmp_path, name: str, content: str) -> str:
    path = tmp_path / name
    path.write_text(content, encoding="utf-8")
    return str(path)


class TestSecrets:
    def test_staged_secret_blocks(self, tmp_path, capsys):
        path = _write(tmp_path, "app.py", f"key = '{_SECRET}'\n")
        assert precommit_checks.main([path]) == 1
        assert "BLOCKED secret" in capsys.readouterr().err

    def test_clean_source_passes(self, tmp_path, capsys):
        path = _write(tmp_path, "app.py", "x = 1\nprint(x)\n")
        assert precommit_checks.main([path]) == 0
        assert capsys.readouterr().out == ""


class TestApplicability:
    def test_non_source_commit_is_silent(self, tmp_path, capsys):
        path = _write(tmp_path, "README.md", "# Title\n")
        assert precommit_checks.main([path]) == 0
        out = capsys.readouterr()
        assert out.out == "" and out.err == ""

    def test_empty_file_list_exits_zero(self):
        assert precommit_checks.main([]) == 0

    def test_nonexistent_files_ignored(self):
        assert precommit_checks.main(["/no/such/file.tf"]) == 0


class TestIacGating:
    def test_uvx_missing_warns_not_blocks(self, tmp_path, capsys, monkeypatch):
        monkeypatch.setattr(precommit_checks.shutil, "which", lambda _name: None)
        path = _write(tmp_path, "main.tf", 'resource "x" "y" {}\n')
        assert precommit_checks.main([path]) == 0
        assert "uvx not found" in capsys.readouterr().err

    def test_iac_findings_block(self, tmp_path, monkeypatch):
        monkeypatch.setattr(precommit_checks.shutil, "which", lambda _n: "/bin/uvx")
        monkeypatch.setattr(precommit_checks, "check_iac", lambda _files: 1)
        path = _write(tmp_path, "main.tf", 'resource "x" "y" {}\n')
        assert precommit_checks.main([path]) == 1

    def test_readme_does_not_invoke_checkov(self, tmp_path, monkeypatch):
        called = {"n": 0}

        def _boom(_files):
            called["n"] += 1
            return 0

        monkeypatch.setattr(precommit_checks, "check_iac", _boom)
        path = _write(tmp_path, "README.md", "# Title\n")
        precommit_checks.main([path])
        assert called["n"] == 0
