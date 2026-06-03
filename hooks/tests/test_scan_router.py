"""Tests for hooks/scan_router.py — applicability routing + IaC checks."""

from __future__ import annotations

import scan_router


def _write(tmp_path, name: str, content: str) -> str:
    """Create a file under tmp_path and return its string path."""
    path = tmp_path / name
    path.write_text(content, encoding="utf-8")
    return str(path)


CFN_YAML = (
    "AWSTemplateFormatVersion: '2010-09-09'\n"
    "Resources:\n"
    "  Bucket:\n"
    "    Type: AWS::S3::Bucket\n"
)
CFN_YAML_NO_VERSION = (
    "Resources:\n"
    "  Bucket:\n"
    "    Type: \"AWS::S3::Bucket\"\n"
)
GHA_WORKFLOW = (
    "name: CI\n"
    "on:\n"
    "  push:\n"
    "    branches: [main]\n"
    "jobs:\n"
    "  build:\n"
    "    runs-on: ubuntu-latest\n"
)
K8S_MANIFEST = (
    "apiVersion: apps/v1\n"
    "kind: Deployment\n"
    "metadata:\n"
    "  name: web\n"
)


class TestCfnDetection:
    def test_cfn_yaml_with_version(self, tmp_path):
        path = _write(tmp_path, "template.yaml", CFN_YAML)
        assert scan_router.is_cfn_template(path) is True

    def test_cfn_yaml_without_version_uses_resource_type(self, tmp_path):
        path = _write(tmp_path, "stack.yml", CFN_YAML_NO_VERSION)
        assert scan_router.is_cfn_template(path) is True

    def test_github_actions_workflow_is_not_cfn(self, tmp_path):
        path = _write(tmp_path, "ci.yml", GHA_WORKFLOW)
        assert scan_router.is_cfn_template(path) is False

    def test_k8s_manifest_is_not_cfn(self, tmp_path):
        path = _write(tmp_path, "deploy.yaml", K8S_MANIFEST)
        assert scan_router.is_cfn_template(path) is False

    def test_cfn_json(self, tmp_path):
        body = '{"AWSTemplateFormatVersion": "2010-09-09", "Resources": {}}'
        path = _write(tmp_path, "t.json", body)
        assert scan_router.is_cfn_template(path) is True

    def test_plain_json_is_not_cfn(self, tmp_path):
        path = _write(tmp_path, "package.json", '{"name": "x"}')
        assert scan_router.is_cfn_template(path) is False


class TestK8sDetection:
    def test_k8s_manifest_detected(self, tmp_path):
        path = _write(tmp_path, "deploy.yaml", K8S_MANIFEST)
        assert scan_router.is_k8s_manifest(path) is True

    def test_gha_workflow_is_not_k8s(self, tmp_path):
        path = _write(tmp_path, "ci.yml", GHA_WORKFLOW)
        assert scan_router.is_k8s_manifest(path) is False


class TestIacFile:
    def test_terraform_is_iac(self, tmp_path):
        path = _write(tmp_path, "main.tf", 'resource "x" "y" {}\n')
        assert scan_router.is_iac_file(path) is True

    def test_dockerfile_is_iac(self, tmp_path):
        path = _write(tmp_path, "Dockerfile", "FROM alpine\n")
        assert scan_router.is_iac_file(path) is True

    def test_cfn_yaml_is_iac(self, tmp_path):
        path = _write(tmp_path, "template.yaml", CFN_YAML)
        assert scan_router.is_iac_file(path) is True

    def test_gha_workflow_is_not_iac(self, tmp_path):
        path = _write(tmp_path, "ci.yml", GHA_WORKFLOW)
        assert scan_router.is_iac_file(path) is False

    def test_readme_is_not_iac(self, tmp_path):
        path = _write(tmp_path, "README.md", "# Hello\n")
        assert scan_router.is_iac_file(path) is False


class TestApplicableScanners:
    def test_python_file_routes_to_bandit_semgrep_secrets(self, tmp_path):
        path = _write(tmp_path, "app.py", "x = 1\n")
        result = scan_router.applicable_scanners([path])
        assert result == {"bandit", "semgrep", "detect-secrets"}

    def test_terraform_routes_to_checkov_and_secrets(self, tmp_path):
        path = _write(tmp_path, "main.tf", 'resource "x" "y" {}\n')
        result = scan_router.applicable_scanners([path])
        assert "checkov" in result
        assert "cfn-nag" not in result

    def test_cfn_routes_to_checkov_and_cfn_nag(self, tmp_path):
        path = _write(tmp_path, "template.yaml", CFN_YAML)
        result = scan_router.applicable_scanners([path])
        assert {"checkov", "cfn-nag"} <= result

    def test_gha_workflow_does_not_route_to_cfn_nag(self, tmp_path):
        path = _write(tmp_path, "ci.yml", GHA_WORKFLOW)
        result = scan_router.applicable_scanners([path])
        assert "cfn-nag" not in result
        assert "checkov" not in result

    def test_readme_routes_only_to_secrets(self, tmp_path):
        path = _write(tmp_path, "README.md", "# Hello\n")
        result = scan_router.applicable_scanners([path])
        assert result == {"detect-secrets"}

    def test_lockfile_routes_to_npm_audit_and_grype(self, tmp_path):
        path = _write(tmp_path, "package-lock.json", '{"name": "x"}')
        result = scan_router.applicable_scanners([path])
        assert {"npm-audit", "grype"} <= result

    def test_editing_source_does_not_trigger_grype(self, tmp_path):
        path = _write(tmp_path, "app.py", "x = 1\n")
        assert "grype" not in scan_router.applicable_scanners([path])

    def test_empty_change_set_yields_no_scanners(self):
        assert scan_router.applicable_scanners([]) == set()

    def test_binary_asset_is_not_text(self, tmp_path):
        path = _write(tmp_path, "logo.png", "not really a png")
        assert "detect-secrets" not in scan_router.applicable_scanners([path])


class TestMainCli:
    def test_no_files_exits_silently(self, capsys):
        assert scan_router.main(["--print-scanners"]) == 0
        assert capsys.readouterr().out == ""

    def test_nonexistent_files_exit_silently(self, capsys):
        assert scan_router.main(["--print-scanners", "--files", "/no/such"]) == 0
        assert capsys.readouterr().out == ""

    def test_print_scanners_for_python(self, tmp_path, capsys):
        path = _write(tmp_path, "app.py", "x = 1\n")
        scan_router.main(["--print-scanners", "--files", path])
        out = capsys.readouterr().out.split()
        assert "bandit" in out

    def test_readme_prints_only_secrets(self, tmp_path, capsys):
        path = _write(tmp_path, "README.md", "# Hi\n")
        scan_router.main(["--print-scanners", "--files", path])
        assert capsys.readouterr().out.strip() == "detect-secrets"

    def test_check_iac_silent_when_no_iac(self, tmp_path, capsys):
        path = _write(tmp_path, "README.md", "# Hi\n")
        assert scan_router.main(["--check-iac", "--files", path]) == 0
        assert capsys.readouterr().out == ""
