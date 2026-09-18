"""Tests for the ASH suppression expiration check."""

from __future__ import annotations

from datetime import date, timedelta

import pytest

from check_ash_expirations import check, main

TODAY = date(2026, 9, 18)


@pytest.fixture(autouse=True)
def plain_output(monkeypatch):
    """Pin the output format to the non-CI form.

    ``_annotate`` switches on ``GITHUB_ACTIONS``, which the pytest-hooks job
    sets, so tests that assert on plain text would pass locally and fail in CI.
    Each test opts into the annotation form explicitly instead.
    """
    monkeypatch.delenv("GITHUB_ACTIONS", raising=False)


def _config(tmp_path, body: str) -> str:
    path = tmp_path / "ash.yaml"
    path.write_text(body, encoding="utf-8")
    return str(path)


def _suppression(expiration: str) -> str:
    return (
        "global_settings:\n"
        "  suppressions:\n"
        "    - path: .github/workflows/**\n"
        "      rule_id: CKV2_GHA_1\n"
        "      reason: Hardening tracked elsewhere.\n"
        '      expiration: "{0}"\n'.format(expiration)
    )


def _days_out(days: int) -> str:
    return (TODAY + timedelta(days=days)).isoformat()


def test_no_expirations_passes(tmp_path, capsys):
    config = _config(tmp_path, "global_settings:\n  suppressions:\n    - path: a/**\n")
    assert check(config, TODAY, warn_days=14, fail_days=0) == 0
    assert "0 expiration(s) valid" in capsys.readouterr().out


def test_far_future_expiration_passes_without_warning(tmp_path, capsys):
    config = _config(tmp_path, _suppression(_days_out(90)))
    assert check(config, TODAY, warn_days=14, fail_days=0) == 0
    out = capsys.readouterr().out
    assert "1 expiration(s) valid" in out
    assert "WARNING" not in out


def test_expiration_inside_warn_window_warns_but_passes(tmp_path, capsys):
    config = _config(tmp_path, _suppression(_days_out(7)))
    assert check(config, TODAY, warn_days=14, fail_days=0) == 0
    out = capsys.readouterr().out
    assert "WARNING" in out
    assert "7 day(s) away" in out


@pytest.mark.parametrize("offset", [-30, -1, 0])
def test_lapsed_or_today_expiration_fails(tmp_path, capsys, offset):
    """ASH requires the date to be in the future, so today is already lapsed."""
    config = _config(tmp_path, _suppression(_days_out(offset)))
    assert check(config, TODAY, warn_days=14, fail_days=0) == 1
    out = capsys.readouterr().out
    assert "ERROR" in out
    assert "default configuration" in out


def test_malformed_expiration_fails(tmp_path, capsys):
    config = _config(tmp_path, _suppression("not-a-date"))
    assert check(config, TODAY, warn_days=14, fail_days=0) == 1
    assert "not a YYYY-MM-DD date" in capsys.readouterr().out


def test_impossible_date_fails(tmp_path, capsys):
    config = _config(tmp_path, _suppression("2026-02-30"))
    assert check(config, TODAY, warn_days=14, fail_days=0) == 1
    assert "not a YYYY-MM-DD date" in capsys.readouterr().out


def test_expiration_in_block_scalar_prose_is_ignored(tmp_path, capsys):
    """`expiration:` inside a reason block is prose, not a key."""
    config = _config(
        tmp_path,
        "global_settings:\n"
        "  suppressions:\n"
        "    - path: a/**\n"
        "      reason: >-\n"
        "        Documented decision. The field\n"
        '        expiration: "2020-01-01" is described here, not set.\n'
        "    - path: b/**\n"
        '      expiration: "{0}"\n'.format(_days_out(90)),
    )
    assert check(config, TODAY, warn_days=14, fail_days=0) == 0
    assert "1 expiration(s) valid" in capsys.readouterr().out


def test_fail_days_fails_ahead_of_lapse(tmp_path):
    config = _config(tmp_path, _suppression(_days_out(10)))
    assert check(config, TODAY, warn_days=14, fail_days=0) == 0
    assert check(config, TODAY, warn_days=14, fail_days=30) == 1


def test_unquoted_and_single_quoted_dates_are_read(tmp_path, capsys):
    config = _config(
        tmp_path,
        "global_settings:\n"
        "  suppressions:\n"
        "    - path: a/**\n"
        "      expiration: {0}\n"
        "    - path: b/**\n"
        "      expiration: '{1}'\n".format(_days_out(-1), _days_out(90)),
    )
    assert check(config, TODAY, warn_days=14, fail_days=0) == 1
    assert "1 of 2 expiration(s) lapsed" in capsys.readouterr().out


def test_missing_config_fails(tmp_path, capsys):
    assert check(str(tmp_path / "absent.yaml"), TODAY, 14, 0) == 1
    assert "cannot read ASH config" in capsys.readouterr().out


def test_github_annotation_format(tmp_path, capsys, monkeypatch):
    monkeypatch.setenv("GITHUB_ACTIONS", "true")
    config = _config(tmp_path, _suppression(_days_out(-1)))
    assert check(config, TODAY, warn_days=14, fail_days=0) == 1
    assert "::error file={0},line=6::".format(config) in capsys.readouterr().out


def test_repo_config_has_no_lapsed_expirations(capsys):
    """The committed .ash/ash.yaml must be valid as of the real today."""
    import os

    repo_config = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        ".ash", "ash.yaml",
    )
    assert check(repo_config, date.today(), warn_days=14, fail_days=0) == 0


def test_main_uses_defaults(tmp_path):
    config = _config(tmp_path, _suppression(_days_out(-1)))
    assert main(["--config", config]) == 1
