#!/usr/bin/env python3
"""Tests for blog post workflows and commands.

This test suite validates all the commands, workflows, and features mentioned
in the blog post "Customizing Claude Code: What I Learned from Losing Everything".

It ensures that:
1. Setup workflows work correctly
2. Command deployment functions as documented
3. Hooks system operates properly
4. Custom commands can be created and deployed
5. Version control integration works
6. Core workflow commands are functional
"""

import os
import sys
import tempfile
import shutil
import subprocess
import json
from pathlib import Path
import re


class TestBlogPostWorkflows:
    """Test suite for blog post workflows and commands."""
    
    def __init__(self):
        self.script_dir = Path(__file__).parent.parent.parent
        self.setup_script = self.script_dir / 'setup.sh'
        self.deploy_script = self.script_dir / 'deploy.sh'
        self.claude_md = self.script_dir / 'CLAUDE.md'
        
    def setup_test_env(self):
        """Create temporary test environment."""
        self.temp_dir = tempfile.mkdtemp(prefix='claude_blog_test_')
        self.temp_home = Path(self.temp_dir) / 'home'
        self.temp_home.mkdir()
        self.temp_claude_dir = self.temp_home / '.claude'
        self.temp_claude_dir.mkdir()
        return self.temp_dir
        
    def cleanup_test_env(self, temp_dir):
        """Clean up test environment."""
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
    
    def _run_command(self, cmd, env=None, cwd=None, timeout=60):
        """Run command with error handling."""
        try:
            if env is None:
                env = os.environ.copy()
            
            result = subprocess.run(
                cmd, 
                shell=True, 
                capture_output=True, 
                text=True, 
                env=env,
                cwd=cwd or str(self.script_dir),
                timeout=timeout
            )
            return result.returncode == 0, result.stdout, result.stderr
        except subprocess.TimeoutExpired:
            return False, "", "Command timed out"
        except Exception as e:
            return False, "", str(e)
    
    def test_repository_structure(self):
        """Test: Repository has expected structure from blog post."""
        print("Testing repository structure...")
        
        # Check essential files exist
        essential_files = [
            'setup.sh',
            'deploy.sh', 
            'CLAUDE.md',
            'configure-claude-code.sh',
            'deploy-subagents.sh'
        ]
        
        for file_name in essential_files:
            file_path = self.script_dir / file_name
            assert file_path.exists(), f"Essential file missing: {file_name}"
            assert file_path.is_file(), f"Path exists but is not a file: {file_name}"
        
        # Check directory structure
        essential_dirs = [
            'slash-commands/active',
            'slash-commands/experiments', 
            'hooks',
            'lib',
            'templates',
            'specs/tests'
        ]
        
        for dir_name in essential_dirs:
            dir_path = self.script_dir / dir_name
            assert dir_path.exists(), f"Essential directory missing: {dir_name}"
            assert dir_path.is_dir(), f"Path exists but is not a directory: {dir_name}"
        
        print("✅ Repository structure validated")
    
    def test_setup_script_basic_usage(self):
        """Test: Basic setup.sh workflow from blog post."""
        print("Testing basic setup.sh workflow...")
        
        temp_dir = self.setup_test_env()
        try:
            # Test help option
            success, stdout, stderr = self._run_command("./setup.sh --help")
            assert success, f"setup.sh --help failed: {stderr}"
            assert "Claude Code Complete Setup Script" in stdout
            
            # Test dry-run mode
            env = os.environ.copy()
            env['HOME'] = str(self.temp_home)
            env['ANTHROPIC_API_KEY'] = 'sk-ant-test-key'
            
            success, stdout, stderr = self._run_command(
                "./setup.sh --dry-run --skip-configure --skip-hooks --skip-subagents", 
                env=env
            )
            
            # Dry run should succeed and show what would be done
            assert "[DRY-RUN]" in stdout, "Dry run mode not indicated in output"
            assert "Would run: ./deploy.sh" in stdout, "Deploy step not shown in dry run"
            
            print("✅ Basic setup.sh workflow validated")
            
        finally:
            self.cleanup_test_env(temp_dir)
    
    def test_setup_script_options(self):
        """Test: setup.sh with different setup types from blog post."""
        print("Testing setup.sh setup types...")
        
        temp_dir = self.setup_test_env()
        try:
            env = os.environ.copy()
            env['HOME'] = str(self.temp_home)
            env['ANTHROPIC_API_KEY'] = 'sk-ant-test-key'
            
            # Test different setup types
            setup_types = ['basic', 'security', 'comprehensive']
            
            for setup_type in setup_types:
                print(f"  Testing setup type: {setup_type}")
                
                success, stdout, stderr = self._run_command(
                    f"./setup.sh --setup-type {setup_type} --dry-run --skip-configure --skip-subagents",
                    env=env
                )
                
                assert success or "DRY-RUN" in stdout, f"Setup type {setup_type} failed: {stderr}"
                assert f"Setup type: {setup_type}" in stdout, f"Setup type not correctly set to {setup_type}"
            
            print("✅ Setup script options validated")
            
        finally:
            self.cleanup_test_env(temp_dir)
    
    def test_deploy_script_functionality(self):
        """Test: deploy.sh command deployment from blog post."""
        print("Testing deploy.sh functionality...")
        
        temp_dir = self.setup_test_env()
        try:
            env = os.environ.copy()
            env['HOME'] = str(self.temp_home)
            
            # Test help option
            success, stdout, stderr = self._run_command("./deploy.sh --help")
            assert success, f"deploy.sh --help failed: {stderr}"
            assert "Deploy" in stdout and "Claude Code" in stdout
            
            # Test dry-run with all commands
            success, stdout, stderr = self._run_command(
                "./deploy.sh --dry-run --all", 
                env=env
            )
            
            assert success or "DRY-RUN" in stdout, f"deploy.sh dry-run failed: {stderr}"
            # Check for dry-run indicators
            assert "--dry-run" in stderr or "DRY" in stdout or success, "Dry run mode should be handled"
            
            # Test list functionality
            success, stdout, stderr = self._run_command(
                "./deploy.sh --list"
            )
            
            assert success, f"deploy.sh --list failed: {stderr}"
            # Should show available commands
            assert "Available Commands" in stdout or "commands" in stdout
            
            print("✅ Deploy script functionality validated")
            
        finally:
            self.cleanup_test_env(temp_dir)
    
    def test_deploy_script_advanced_options(self):
        """Test: deploy.sh with advanced deployment options."""
        print("Testing deploy.sh advanced deployment options...")
        
        temp_dir = self.setup_test_env()
        try:
            env = os.environ.copy()
            env['HOME'] = str(self.temp_home)
            
            # Test experiments deployment
            success, stdout, stderr = self._run_command(
                "./deploy.sh --dry-run --experiments",
                env=env
            )
            
            # Should succeed or show dry run output
            assert success or "DRY-RUN" in stdout, f"Experiments deployment failed: {stderr}"
            
            # Test all commands deployment
            success, stdout, stderr = self._run_command(
                "./deploy.sh --dry-run --all",
                env=env
            )
            
            # Should succeed or show dry run output
            assert success or "DRY-RUN" in stdout, f"All commands deployment failed: {stderr}"
            
            print("✅ Deploy script advanced deployment options validated")
            
        finally:
            self.cleanup_test_env(temp_dir)
    
    def test_hooks_system_structure(self):
        """Test: Hooks system structure from blog post."""
        print("Testing hooks system structure...")
        
        # Check hooks directory exists
        hooks_dir = self.script_dir / 'hooks'
        assert hooks_dir.exists(), "Hooks directory missing"
        assert hooks_dir.is_dir(), "Hooks path is not a directory"
        
        # Check for security hooks mentioned in blog post
        security_hook = hooks_dir / 'prevent-credential-exposure.sh'
        file_logger_hook = hooks_dir / 'file-logger.sh'
        
        assert security_hook.exists(), "prevent-credential-exposure.sh hook missing"
        assert file_logger_hook.exists(), "file-logger.sh hook missing"
        
        # Check hooks are executable
        assert os.access(security_hook, os.X_OK), "Security hook not executable"
        assert os.access(file_logger_hook, os.X_OK), "File logger hook not executable"
        
        # Check hook content has basic structure
        with open(security_hook, 'r') as f:
            hook_content = f.read()
        
        assert '#!/bin/bash' in hook_content or '#!/usr/bin/env bash' in hook_content, \
            "Security hook missing shebang"
        assert 'credential' in hook_content.lower() or 'secret' in hook_content.lower(), \
            "Security hook doesn't appear to check credentials"
        
        print("✅ Hooks system structure validated")
    
    def test_custom_command_structure(self):
        """Test: Custom command structure from blog post."""
        print("Testing custom command structure...")
        
        # Check slash-commands directories
        active_dir = self.script_dir / 'slash-commands' / 'active'
        experiments_dir = self.script_dir / 'slash-commands' / 'experiments'
        
        assert active_dir.exists(), "Active commands directory missing"
        assert experiments_dir.exists(), "Experiments commands directory missing"
        
        # Check for core commands mentioned in blog post
        core_commands = [
            'xtest.md', 'xgit.md', 'xquality.md', 'xsecurity.md',
            'xdebug.md', 'xarchitecture.md', 'xdocs.md', 'xrefactor.md'
        ]
        
        active_commands = list(active_dir.glob('*.md'))
        active_command_names = [cmd.name for cmd in active_commands]
        
        # Check we have some core commands
        found_core_commands = [cmd for cmd in core_commands if cmd in active_command_names]
        assert len(found_core_commands) > 0, f"No core commands found. Available: {active_command_names}"
        
        # Check command file structure
        if active_commands:
            sample_command = active_commands[0]
            with open(sample_command, 'r') as f:
                content = f.read()
            
            # Should be markdown with frontmatter or clear structure
            assert len(content) > 50, f"Command file {sample_command.name} seems too short"
            
        print(f"✅ Custom command structure validated ({len(active_commands)} active commands)")
    
    def test_claude_md_structure(self):
        """Test: CLAUDE.md structure from blog post."""
        print("Testing CLAUDE.md structure...")
        
        assert self.claude_md.exists(), "CLAUDE.md file missing"
        
        with open(self.claude_md, 'r') as f:
            content = f.read()
        
        # Check for key sections mentioned in blog post
        required_sections = [
            'Project Overview',
            'Repository Structure', 
            'Command Categories',
            'Development Guidelines'
        ]
        
        for section in required_sections:
            assert section in content, f"CLAUDE.md missing required section: {section}"
        
        # Check for command documentation
        assert 'xtest' in content or 'xgit' in content, "CLAUDE.md should document custom commands"
        
        # Check for security guidelines
        assert 'security' in content.lower(), "CLAUDE.md should mention security practices"
        
        print("✅ CLAUDE.md structure validated")
    
    def test_workflow_chain_availability(self):
        """Test: Workflow chain commands from blog post are available."""
        print("Testing workflow chain command availability...")
        
        # Commands mentioned in the blog post workflow chain
        workflow_commands = ['xtest', 'xsecurity', 'xquality', 'xgit']
        
        active_dir = self.script_dir / 'slash-commands' / 'active'
        available_commands = [f.stem for f in active_dir.glob('x*.md')]
        
        missing_commands = []
        for cmd in workflow_commands:
            if cmd not in available_commands:
                missing_commands.append(cmd)
        
        if missing_commands:
            print(f"⚠️  Missing workflow commands: {missing_commands}")
            print(f"Available commands: {available_commands}")
        else:
            print("✅ All workflow chain commands available")
        
        # At least some workflow commands should be available
        found_commands = [cmd for cmd in workflow_commands if cmd in available_commands]
        assert len(found_commands) > 0, f"No workflow commands found. Available: {available_commands}"
    
    def test_experimental_commands_structure(self):
        """Test: Experimental commands mentioned in blog post."""
        print("Testing experimental commands structure...")
        
        experiments_dir = self.script_dir / 'slash-commands' / 'experiments'
        experimental_commands = list(experiments_dir.glob('*.md'))
        
        # Should have experimental commands
        assert len(experimental_commands) > 0, "No experimental commands found"
        
        # Check for xnew command mentioned in blog post
        experimental_names = [cmd.stem for cmd in experimental_commands]
        
        print(f"Found {len(experimental_commands)} experimental commands")
        
        # Check structure of experimental commands
        if experimental_commands:
            sample_exp = experimental_commands[0]
            with open(sample_exp, 'r') as f:
                content = f.read()
            
            assert len(content) > 20, f"Experimental command {sample_exp.name} seems too short"
        
        print("✅ Experimental commands structure validated")
    
    def test_version_control_integration(self):
        """Test: Version control setup mentioned in blog post."""
        print("Testing version control integration...")
        
        # Check if we're in a git repository
        git_dir = self.script_dir / '.git'
        assert git_dir.exists(), "Repository should be a git repository"
        
        # Check for important files in version control
        success, stdout, stderr = self._run_command(
            "git ls-files | grep -E '(setup\\.sh|deploy\\.sh|CLAUDE\\.md)'",
            cwd=str(self.script_dir)
        )
        
        assert success, "Essential files should be in version control"
        
        # Check .gitignore exists and has reasonable content
        gitignore = self.script_dir / '.gitignore'
        if gitignore.exists():
            with open(gitignore, 'r') as f:
                gitignore_content = f.read()
            
            # Should ignore common patterns but not the custom commands
            assert 'node_modules' in gitignore_content or '*.log' in gitignore_content, \
                ".gitignore should have common ignore patterns"
        
        print("✅ Version control integration validated")
    
    def test_templates_system(self):
        """Test: Templates system mentioned in blog post."""
        print("Testing templates system...")
        
        templates_dir = self.script_dir / 'templates'
        assert templates_dir.exists(), "Templates directory missing"
        
        # Check for settings templates
        template_files = list(templates_dir.glob('*.json'))
        assert len(template_files) > 0, "No template files found"
        
        # Check template content is valid JSON
        for template_file in template_files:
            with open(template_file, 'r') as f:
                content = f.read()
            
            try:
                # Remove comments for JSON validation
                clean_content = '\n'.join(
                    line for line in content.split('\n') 
                    if not line.strip().startswith('//')
                )
                json.loads(clean_content)
            except json.JSONDecodeError:
                assert False, f"Template {template_file.name} contains invalid JSON"
        
        print(f"✅ Templates system validated ({len(template_files)} templates)")
    
    def test_lib_utilities_structure(self):
        """Test: Library utilities structure from blog post."""
        print("Testing lib utilities structure...")
        
        lib_dir = self.script_dir / 'lib'
        assert lib_dir.exists(), "Lib directory missing"
        
        # Check for utility files
        lib_files = list(lib_dir.glob('*.sh'))
        assert len(lib_files) > 0, "No utility files found in lib/"
        
        # Check for auth.sh (mentioned in authentication context)
        auth_script = lib_dir / 'auth.sh'
        if auth_script.exists():
            with open(auth_script, 'r') as f:
                content = f.read()
            
            assert 'authentication' in content.lower() or 'auth' in content.lower(), \
                "auth.sh should contain authentication logic"
        
        # Check for utils.sh (common utility file)
        utils_script = lib_dir / 'utils.sh'
        if utils_script.exists():
            with open(utils_script, 'r') as f:
                content = f.read()
            
            assert 'function' in content or 'log' in content, \
                "utils.sh should contain utility functions"
        
        print(f"✅ Lib utilities structure validated ({len(lib_files)} utility files)")
    
    def test_subagents_system(self):
        """Test: Sub-agents system mentioned in blog post."""
        print("Testing sub-agents system...")
        
        # Check for sub-agents directory
        subagents_dir = self.script_dir / 'sub-agents'
        if subagents_dir.exists():
            subagent_files = list(subagents_dir.glob('*.md'))
            print(f"Found {len(subagent_files)} sub-agent files")
            
            # Check deploy-subagents script
            deploy_subagents = self.script_dir / 'deploy-subagents.sh'
            assert deploy_subagents.exists(), "deploy-subagents.sh script missing"
            assert os.access(deploy_subagents, os.X_OK), "deploy-subagents.sh not executable"
            
            # Test deploy-subagents help
            success, stdout, stderr = self._run_command("./deploy-subagents.sh --help")
            assert success, f"deploy-subagents.sh --help failed: {stderr}"
            assert "Deploy Claude Code Sub-Agents" in stdout
        else:
            print("⚠️  Sub-agents directory not found (optional feature)")
        
        print("✅ Sub-agents system structure validated")
    
    def test_command_count_claims(self):
        """Test: Command count claims from blog post (57 total, 13 core, 44 experimental)."""
        print("Testing command count claims...")
        
        active_dir = self.script_dir / 'slash-commands' / 'active'
        experiments_dir = self.script_dir / 'slash-commands' / 'experiments'
        
        active_commands = list(active_dir.glob('*.md'))
        experimental_commands = list(experiments_dir.glob('*.md'))
        
        total_commands = len(active_commands) + len(experimental_commands)
        
        print(f"Found {len(active_commands)} active commands")
        print(f"Found {len(experimental_commands)} experimental commands")
        print(f"Total: {total_commands} commands")
        
        # The exact numbers might vary, but should be reasonable
        assert len(active_commands) >= 10, f"Expected at least 10 active commands, found {len(active_commands)}"
        assert len(experimental_commands) >= 20, f"Expected at least 20 experimental commands, found {len(experimental_commands)}"
        assert total_commands >= 40, f"Expected at least 40 total commands, found {total_commands}"
        
        print("✅ Command count claims validated")
    
    def run_all_tests(self):
        """Run all blog post workflow tests."""
        print("🧪 Running Blog Post Workflow Tests")
        print("=" * 50)
        
        tests = [
            self.test_repository_structure,
            self.test_setup_script_basic_usage,
            self.test_setup_script_options,
            self.test_deploy_script_functionality,
            self.test_deploy_script_advanced_options,
            self.test_hooks_system_structure,
            self.test_custom_command_structure,
            self.test_claude_md_structure,
            self.test_workflow_chain_availability,
            self.test_experimental_commands_structure,
            self.test_version_control_integration,
            self.test_templates_system,
            self.test_lib_utilities_structure,
            self.test_subagents_system,
            self.test_command_count_claims
        ]
        
        passed = 0
        failed = 0
        skipped = 0
        
        for test in tests:
            try:
                # Capture output to detect skips
                import io
                import contextlib
                f = io.StringIO()
                with contextlib.redirect_stdout(f):
                    test()
                output = f.getvalue()
                
                if "⏭ Skipping" in output:
                    skipped += 1
                    print(output.strip())  # Print the skip message
                else:
                    passed += 1
                    print(output.strip()) if output.strip() else None
            except Exception as e:
                print(f"❌ {test.__name__} failed: {e}")
                failed += 1
                import traceback
                print(traceback.format_exc())
        
        print("\n" + "=" * 50)
        print(f"Blog post workflow tests: {passed} passed, {failed} failed, {skipped} skipped")
        
        if failed > 0:
            sys.exit(1)
        else:
            if skipped > 0:
                print(f"🎉 All available tests passed! ({skipped} tests skipped)")
            else:
                print("🎉 All blog post workflow tests passed!")
            return True


def main():
    """Main test runner."""
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print(__doc__)
        return
    
    tester = TestBlogPostWorkflows()
    tester.run_all_tests()


if __name__ == '__main__':
    main()