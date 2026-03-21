"""Tests for security_secrets module."""

from security_secrets import check_secrets


class TestCheckSecrets:
    def test_no_secrets_clean(self):
        lines = ["x = 1", "y = 'hello'", "print(x)"]
        assert check_secrets(lines) == []

    def test_aws_key_detected(self):
        lines = ["aws_key = 'AKIAIOSFODNN7ZZZZZZZ'"]
        result = check_secrets(lines)
        assert len(result) == 1
        assert "AWS" in result[0].detail

    def test_github_pat_detected(self):
        lines = ["token = 'ghp_ABCDEFghijklmnopqrstuvwxyz0123456789'"]
        result = check_secrets(lines)
        assert len(result) == 1
        assert "GitHub" in result[0].detail

    def test_stripe_key_detected(self):
        lines = ["key = 'sk_live_" + "a1b2c3d4e5f6g7h8i9j0k1l2m3'"]
        result = check_secrets(lines)
        assert len(result) == 1
        assert "Stripe" in result[0].detail

    def test_private_key_detected(self):
        lines = ["-----BEGIN RSA PRIVATE KEY-----"]
        result = check_secrets(lines)
        assert len(result) == 1
        assert "private key" in result[0].detail

    def test_credential_url_detected(self):
        lines = ["db = 'postgres://user:pass123@host/db'"]
        result = check_secrets(lines)
        assert len(result) == 1

    def test_comment_skipped(self):
        lines = ["# aws_key = 'AKIAIOSFODNN7ZZZZZZZ'"]
        assert check_secrets(lines) == []

    def test_placeholder_skipped(self):
        lines = ["aws_key = 'AKIAIOSFODNN7ZZZZZZZ'  # example key"]
        assert check_secrets(lines) == []

    def test_test_value_skipped(self):
        lines = ["key = 'AKIAIOSFODNN7ZZZZZZZ'  # test"]
        assert check_secrets(lines) == []

    def test_line_number_correct(self):
        lines = ["clean", "clean", "key = 'AKIAIOSFODNN7ZZZZZZZ'"]
        result = check_secrets(lines)
        assert result[0].line == 3
