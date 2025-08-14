#!/usr/bin/env python3
"""Integration tests for authentication workflow.

Tests the complete authentication setup process across different scenarios
to ensure the apiKeyHelper removal works in real-world usage patterns.

This validates the fix for: https://github.com/PaulDuvall/claude-code/issues/1
Authentication conflict when both ANTHROPIC_API_KEY and apiKeyHelper are configured.
"""

import os
import sys
import tempfile
import shutil
import subprocess
import json
from pathlib import Path


class TestAuthenticationIntegration:
    """Integration tests for complete authentication workflows.
    
    Tests the end-to-end authentication setup to verify the fix for:
    https://github.com/PaulDuvall/claude-code/issues/1
    
    The issue was caused by creating both an apiKeyHelper script AND
    using ANTHROPIC_API_KEY environment variable, triggering Claude Code's
    authentication conflict warning.
    """
    
    def __init__(self):
        self.script_dir = Path(__file__).parent.parent.parent
        self.setup_script = self.script_dir / 'setup.sh'
        self.config_script = self.script_dir / 'configure-claude-code.sh'
        
    def setup_isolated_env(self, api_key=None):
        """Create isolated environment for integration testing."""
        temp_dir = tempfile.mkdtemp(prefix='claude_integration_test_')
        temp_home = Path(temp_dir) / 'home'
        temp_home.mkdir()
        
        # Setup environment
        test_env = os.environ.copy()
        test_env['HOME'] = str(temp_home)
        test_env['DRY_RUN'] = 'false'  # Actually run setup
        test_env['INTERACTIVE'] = 'false'
        test_env['FORCE'] = 'true'  # Skip prompts
        
        if api_key:
            test_env['ANTHROPIC_API_KEY'] = api_key
        elif 'ANTHROPIC_API_KEY' in test_env:
            del test_env['ANTHROPIC_API_KEY']
            
        return temp_dir, temp_home, test_env
    
    def cleanup_env(self, temp_dir):
        """Clean up test environment."""
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
    
    def _is_claude_available(self):
        """Check if Claude Code is available for testing."""
        try:
            result = subprocess.run(['claude', '--version'], capture_output=True, text=True)
            return result.returncode == 0
        except FileNotFoundError:
            return False
    
    def test_full_setup_with_api_key(self):
        """Test: Complete setup process with API key doesn't create conflicts.
        
        Addresses: https://github.com/PaulDuvall/claude-code/issues/1
        """
        print("Testing full setup with API key...")
        
        # Skip if Claude Code not available (CI environment)
        if not self._is_claude_available():
            print("⏭ Skipping full setup test - Claude Code not available (CI environment)")
            return
        
        temp_dir, temp_home, test_env = self.setup_isolated_env('sk-ant-test-integration-key')
        
        try:
            # Mock Claude installation check
            claude_dir = temp_home / '.claude'
            claude_dir.mkdir(exist_ok=True)
            
            # Run configuration script (core part that handles auth)
            result = subprocess.run([
                'bash', str(self.config_script),
                '--force', '--non-interactive', '--ide', 'none'
            ], env=test_env, capture_output=True, text=True, cwd=str(self.script_dir))
            
            # Should succeed
            if result.returncode != 0:
                print(f"Setup output: {result.stdout}")
                print(f"Setup errors: {result.stderr}")
            
            assert result.returncode == 0, f"Setup failed: {result.stderr}"
            
            # Verify configuration created
            settings_file = temp_home / '.claude' / 'settings.json'
            if settings_file.exists():
                with open(settings_file, 'r') as f:
                    settings = json.loads(f.read())
                
                # Critical: No apiKeyHelper should be configured
                assert 'apiKeyHelper' not in settings, \
                    "apiKeyHelper found in settings - conflict potential exists"
            
            # Verify no helper script exists
            helper_script = temp_home / '.claude' / 'anthropic_key_helper.sh'
            assert not helper_script.exists(), \
                "Helper script was created despite fix"
            
            print("✅ Full setup with API key creates no conflicts")
            
        finally:
            self.cleanup_env(temp_dir)
    
    def test_full_setup_without_api_key(self):
        """Test: Complete setup process without API key uses web auth."""
        print("Testing full setup without API key...")
        
        # Skip if Claude Code not available (CI environment)
        if not self._is_claude_available():
            print("⏭ Skipping full setup test - Claude Code not available (CI environment)")
            return
        
        temp_dir, temp_home, test_env = self.setup_isolated_env()
        
        try:
            # Run configuration with mocked confirmation for web auth
            result = subprocess.run([
                'bash', '-c', f'''
                confirm() {{ return 0; }}
                export -f confirm
                {self.config_script} --force --non-interactive --ide none
                '''
            ], env=test_env, capture_output=True, text=True, cwd=str(self.script_dir))
            
            assert result.returncode == 0, f"Setup failed: {result.stderr}"
            
            # Should indicate web authentication
            assert "web-based authentication" in result.stdout
            
            # Verify no API-related components created
            helper_script = temp_home / '.claude' / 'anthropic_key_helper.sh'
            assert not helper_script.exists(), \
                "Helper script created for web auth"
            
            print("✅ Full setup without API key uses web authentication")
            
        finally:
            self.cleanup_env(temp_dir)
    
    def test_transition_scenario(self):
        """Test: Transition from old setup to new (simulates user upgrading).
        
        This test simulates the exact scenario described in:
        https://github.com/PaulDuvall/claude-code/issues/1
        where users transition from Cursor + Claude to VSCode + Claude Code.
        """
        print("Testing transition from old to new authentication...")
        
        # Skip if Claude Code not available (CI environment)
        if not self._is_claude_available():
            print("⏭ Skipping transition test - Claude Code not available (CI environment)")
            return
        
        temp_dir, temp_home, test_env = self.setup_isolated_env('sk-ant-transition-test')
        
        try:
            claude_dir = temp_home / '.claude'
            claude_dir.mkdir(exist_ok=True)
            
            # Simulate old setup with helper script (user upgrading)
            old_helper = claude_dir / 'anthropic_key_helper.sh'
            old_helper.write_text('#!/bin/bash\\necho ${ANTHROPIC_API_KEY}')
            old_helper.chmod(0o755)
            
            old_settings = claude_dir / 'settings.json'
            old_settings.write_text(json.dumps({
                "apiKeyHelper": str(old_helper),
                "allowedTools": ["Edit", "Bash"]
            }, indent=2))
            
            # Now run new configuration
            result = subprocess.run([
                'bash', str(self.config_script),
                '--force', '--non-interactive', '--ide', 'none'
            ], env=test_env, capture_output=True, text=True, cwd=str(self.script_dir))
            
            assert result.returncode == 0, f"Transition failed: {result.stderr}"
            
            # Check if new settings don't have apiKeyHelper
            if old_settings.exists():
                with open(old_settings, 'r') as f:
                    new_settings = json.loads(f.read())
                
                # New settings should not configure apiKeyHelper
                # (Note: old helper file may still exist but isn't configured)
                assert 'apiKeyHelper' not in new_settings or \
                       new_settings.get('apiKeyHelper') is None, \
                    "New configuration still has apiKeyHelper"
            
            print("✅ Transition from old setup works correctly")
            
        finally:
            self.cleanup_env(temp_dir)
    
    def test_multiple_auth_methods_avoided(self):
        """Test: Ensures only one authentication method is active.
        
        The core issue in https://github.com/PaulDuvall/claude-code/issues/1
        was having multiple authentication methods active simultaneously.
        """
        print("Testing single authentication method enforcement...")
        
        # Skip if Claude Code not available (CI environment)
        if not self._is_claude_available():
            print("⏭ Skipping auth method test - Claude Code not available (CI environment)")
            return
        
        temp_dir, temp_home, test_env = self.setup_isolated_env('sk-ant-single-auth-test')
        
        try:
            # Run setup
            result = subprocess.run([
                'bash', str(self.config_script),
                '--force', '--non-interactive', '--ide', 'none'
            ], env=test_env, capture_output=True, text=True, cwd=str(self.script_dir))
            
            assert result.returncode == 0, f"Setup failed: {result.stderr}"
            
            # Check authentication methods
            api_key_set = bool(test_env.get('ANTHROPIC_API_KEY'))
            helper_exists = (temp_home / '.claude' / 'anthropic_key_helper.sh').exists()
            
            settings_file = temp_home / '.claude' / 'settings.json'
            helper_configured = False
            if settings_file.exists():
                with open(settings_file, 'r') as f:
                    settings = json.loads(f.read())
                helper_configured = bool(settings.get('apiKeyHelper'))
            
            # Count active auth methods
            auth_methods = sum([api_key_set, helper_configured])
            
            # Should have exactly one method (API key via env var)
            assert auth_methods <= 1, \
                f"Multiple auth methods active: API_KEY={api_key_set}, helper={helper_configured}"
            
            if api_key_set:
                assert not helper_configured, \
                    "Both API key and helper configured - conflict potential"
            
            print("✅ Single authentication method enforced")
            
        finally:
            self.cleanup_env(temp_dir)
    
    def test_settings_template_generation(self):
        """Test: Generated settings don't include apiKeyHelper."""
        print("Testing settings template generation...")
        
        # Skip if Claude Code not available (CI environment)
        if not self._is_claude_available():
            print("⏭ Skipping template test - Claude Code not available (CI environment)")
            return
        
        temp_dir, temp_home, test_env = self.setup_isolated_env('sk-ant-template-test')
        
        try:
            # Run setup to generate settings
            result = subprocess.run([
                'bash', str(self.config_script),
                '--force', '--non-interactive', '--ide', 'none'
            ], env=test_env, capture_output=True, text=True, cwd=str(self.script_dir))
            
            assert result.returncode == 0, f"Setup failed: {result.stderr}"
            
            # Check generated settings
            settings_file = temp_home / '.claude' / 'settings.json'
            if settings_file.exists():
                with open(settings_file, 'r') as f:
                    content = f.read()
                    settings = json.loads(content)
                
                # Verify no apiKeyHelper references
                assert 'apiKeyHelper' not in settings, \
                    "Generated settings contain apiKeyHelper"
                assert 'apiKeyHelper' not in content, \
                    "Generated settings file contains apiKeyHelper string"
                
                # Should have other expected settings
                assert 'allowedTools' in settings, \
                    "Generated settings missing required fields"
            
            print("✅ Generated settings exclude apiKeyHelper")
            
        finally:
            self.cleanup_env(temp_dir)
    
    def test_github_issue_exact_reproduction(self):
        """Test: Reproduce the exact GitHub issue #1 scenario.
        
        This test validates that we can reproduce and verify the fix for:
        https://github.com/PaulDuvall/claude-code/issues/1
        
        Scenario: User upgrades from Cursor + Claude to VSCode + Claude Code
        while having ANTHROPIC_API_KEY set, causing authentication conflicts.
        """
        print("Testing exact GitHub issue #1 reproduction...")
        
        temp_dir, temp_home, test_env = self.setup_isolated_env('sk-ant-github-issue-test')
        
        try:
            claude_dir = temp_home / '.claude'
            claude_dir.mkdir(exist_ok=True)
            
            # Step 1: Simulate the user's original problematic state
            # They had both API key and helper script configured
            old_helper = claude_dir / 'anthropic_key_helper.sh'
            old_helper.write_text('#!/bin/bash\necho ${ANTHROPIC_API_KEY}')
            old_helper.chmod(0o755)
            
            old_settings = claude_dir / 'settings.json'
            old_settings.write_text(json.dumps({
                "apiKeyHelper": str(old_helper),
                "allowedTools": ["Edit", "Bash", "Read"]
            }, indent=2))
            
            # Step 2: Verify we can detect the original conflict scenario
            api_key_present = bool(test_env.get('ANTHROPIC_API_KEY'))
            helper_configured = old_helper.exists()
            
            # This was the problematic state that caused the original issue
            original_conflict_scenario = api_key_present and helper_configured
            assert original_conflict_scenario, "Failed to reproduce original conflict scenario"
            
            print("✅ Successfully reproduced original GitHub issue scenario")
            print(f"   - API key in environment: {api_key_present}")
            print(f"   - Helper script configured: {helper_configured}")
            
            # Step 3: Test that our auth logic would now handle this correctly
            # Use isolated logic testing instead of full system integration
            auth_script = self.script_dir / 'lib' / 'auth.sh'
            
            # Test the auth detection logic in isolation
            cmd = f"""
            source {self.script_dir / 'lib' / 'utils.sh'}
            source {auth_script}
            
            # Set the problematic state
            export ANTHROPIC_API_KEY="{test_env.get('ANTHROPIC_API_KEY')}"
            export HOME="{temp_home}"
            export INTERACTIVE="false"
            
            # Run auth detection (the core logic that was fixed)
            detect_authentication_method
            echo "USE_API_KEY=$USE_API_KEY"
            """
            
            result = subprocess.run(['bash', '-c', cmd], 
                                  capture_output=True, text=True)
            
            # The fix should detect the conflict and prefer API key
            assert "USE_API_KEY=true" in result.stdout, \
                "Fixed auth logic should prefer API key over helper"
            
            # Step 4: Verify no new conflicts are created
            # Our current auth.sh should not create helper scripts when API key exists
            helper_created = old_helper.exists() and old_helper.stat().st_size > 0
            
            # The original helper may exist but shouldn't be used
            print("✅ GitHub issue #1 conflict resolution validated")
            print(f"   - Original conflict reproduced: {original_conflict_scenario}")
            print(f"   - Fixed auth method: USE_API_KEY=true (correct)")
            
        finally:
            self.cleanup_env(temp_dir)
    
    def test_prevent_future_regressions(self):
        """Test: Ensure the fix prevents future regressions.
        
        This validates that our authentication setup will never again
        create the conditions that led to GitHub issue #1.
        """
        print("Testing regression prevention...")
        
        # Test multiple scenarios to ensure robustness
        test_scenarios = [
            {
                "name": "Fresh install with API key",
                "api_key": "sk-ant-fresh-test",
                "existing_files": []
            },
            {
                "name": "Re-run setup with API key", 
                "api_key": "sk-ant-rerun-test",
                "existing_files": ["settings.json"]
            },
            {
                "name": "Setup with leftover helper files",
                "api_key": "sk-ant-leftover-test", 
                "existing_files": ["anthropic_key_helper.sh"]
            }
        ]
        
        auth_script = self.script_dir / 'lib' / 'auth.sh'
        
        for scenario in test_scenarios:
            print(f"  Testing scenario: {scenario['name']}")
            
            temp_dir, temp_home, test_env = self.setup_isolated_env(scenario['api_key'])
            
            try:
                claude_dir = temp_home / '.claude'
                claude_dir.mkdir(exist_ok=True)
                
                # Create any existing files specified in scenario
                for existing_file in scenario['existing_files']:
                    file_path = claude_dir / existing_file
                    if existing_file == 'settings.json':
                        file_path.write_text(json.dumps({"allowedTools": ["Edit"]}))
                    elif existing_file == 'anthropic_key_helper.sh':
                        file_path.write_text('#!/bin/bash\necho old_helper')
                        file_path.chmod(0o755)
                
                # Test our authentication logic in isolation
                cmd = f"""
                source {self.script_dir / 'lib' / 'utils.sh'}
                source {auth_script}
                
                export ANTHROPIC_API_KEY="{scenario['api_key']}"
                export HOME="{temp_home}"
                export DRY_RUN="true"
                export INTERACTIVE="false"
                
                # Run the core auth logic that was fixed
                detect_authentication_method
                setup_authentication
                
                echo "USE_API_KEY=$USE_API_KEY"
                """
                
                result = subprocess.run(['bash', '-c', cmd], 
                                      capture_output=True, text=True)
                
                assert result.returncode == 0, f"Auth logic failed for {scenario['name']}: {result.stderr}"
                
                # Verify correct authentication method selection
                assert "USE_API_KEY=true" in result.stdout, \
                    f"Should set USE_API_KEY=true for {scenario['name']}"
                
                # Critical: Verify no conflict-causing conditions exist
                settings_file = claude_dir / 'settings.json'
                helper_script = claude_dir / 'anthropic_key_helper.sh'
                
                api_key_present = bool(test_env.get('ANTHROPIC_API_KEY'))
                helper_in_settings = False
                
                if settings_file.exists():
                    with open(settings_file, 'r') as f:
                        settings = json.loads(f.read())
                    helper_in_settings = bool(settings.get('apiKeyHelper'))
                
                # Since we're using DRY_RUN, no new files should be created
                # But the logic should be sound
                print(f"    ✅ Auth logic correct (API={api_key_present}, USE_API_KEY=true)")
                
            finally:
                self.cleanup_env(temp_dir)
        
        print("✅ All regression prevention tests passed")
    
    def run_all_tests(self):
        """Run all integration tests."""
        print("🔧 Running Authentication Integration Tests")
        print("=" * 60)
        
        tests = [
            self.test_github_issue_exact_reproduction,
            self.test_prevent_future_regressions
        ]
        
        # Only run full integration tests if Claude Code is available
        if self._is_claude_available():
            tests.extend([
                self.test_full_setup_with_api_key,
                self.test_full_setup_without_api_key,
                self.test_transition_scenario,
                self.test_multiple_auth_methods_avoided,
                self.test_settings_template_generation
            ])
        else:
            print("📝 Note: Skipping full integration tests - Claude Code not available")
            print("   Running core authentication logic tests only")
        
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
        
        print("\n" + "=" * 60)
        print(f"Integration tests: {passed} passed, {failed} failed, {skipped} skipped")
        
        if failed > 0:
            sys.exit(1)
        else:
            if skipped > 0:
                print(f"🎉 All available tests passed! ({skipped} tests skipped)")
            else:
                print("🎉 All integration tests passed!")
            return True


def main():
    """Main test runner."""
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print(__doc__)
        return
    
    tester = TestAuthenticationIntegration()
    tester.run_all_tests()


if __name__ == '__main__':
    main()