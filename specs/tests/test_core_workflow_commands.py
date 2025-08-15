#!/usr/bin/env python3
"""Tests for core workflow commands mentioned in the blog post.

This test suite validates the specific commands highlighted in the blog post
workflow chain: /xtest, /xsecurity, /xquality, /xgit and other core commands.

It ensures that:
1. Command files exist and have proper structure
2. Commands can be deployed successfully
3. Command metadata is correct
4. Workflow chain commands work together
5. Command documentation is comprehensive
"""

import os
import sys
import tempfile
import shutil
import subprocess
import json
import re
from pathlib import Path


class TestCoreWorkflowCommands:
    """Test suite for core workflow commands from the blog post."""
    
    def __init__(self):
        self.script_dir = Path(__file__).parent.parent.parent
        self.active_dir = self.script_dir / 'slash-commands' / 'active'
        self.experiments_dir = self.script_dir / 'slash-commands' / 'experiments'
        
        # Core workflow commands from blog post
        self.workflow_commands = ['xtest', 'xsecurity', 'xquality', 'xgit']
        
        # 13 core commands mentioned in blog post
        self.core_commands = [
            'xtest', 'xquality', 'xgit',  # Daily development workflow
            'xsecurity', 'xrefactor',      # Code improvement and safety
            'xdebug', 'xarchitecture',     # Complex problem-solving
            'xspec', 'xdocs',              # Documentation and requirements
            'xpipeline', 'xrelease', 'xconfig'  # DevOps automation
        ]
        
    def setup_test_env(self):
        """Create temporary test environment."""
        self.temp_dir = tempfile.mkdtemp(prefix='claude_workflow_test_')
        self.temp_home = Path(self.temp_dir) / 'home'
        self.temp_home.mkdir()
        self.temp_claude_dir = self.temp_home / '.claude'
        self.temp_claude_dir.mkdir()
        self.temp_commands_dir = self.temp_claude_dir / 'commands'
        self.temp_commands_dir.mkdir()
        return self.temp_dir
        
    def cleanup_test_env(self, temp_dir):
        """Clean up test environment."""
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
    
    def _get_command_files(self, directory):
        """Get all command files from a directory."""
        if not directory.exists():
            return []
        return list(directory.glob('x*.md'))
    
    def _parse_command_file(self, command_file):
        """Parse command file structure."""
        with open(command_file, 'r') as f:
            content = f.read()
        
        # Extract frontmatter if present
        frontmatter = {}
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                try:
                    import yaml
                    frontmatter = yaml.safe_load(parts[1]) or {}
                except ImportError:
                    # Parse simple frontmatter without yaml
                    for line in parts[1].strip().split('\n'):
                        if ':' in line:
                            key, value = line.split(':', 1)
                            frontmatter[key.strip()] = value.strip().strip('"')
        
        return {
            'content': content,
            'frontmatter': frontmatter,
            'name': command_file.stem,
            'size': len(content)
        }
    
    def test_workflow_commands_exist(self):
        """Test: Core workflow commands from blog post exist."""
        print("Testing workflow commands existence...")
        
        available_commands = []
        for cmd_file in self._get_command_files(self.active_dir):
            available_commands.append(cmd_file.stem)
        
        for cmd_file in self._get_command_files(self.experiments_dir):
            available_commands.append(cmd_file.stem)
        
        missing_workflow_commands = []
        for cmd in self.workflow_commands:
            if cmd not in available_commands:
                missing_workflow_commands.append(cmd)
        
        if missing_workflow_commands:
            print(f"⚠️  Missing workflow commands: {missing_workflow_commands}")
            print(f"Available commands: {sorted(available_commands)}")
        
        # Should have at least some workflow commands
        found_workflow_commands = [cmd for cmd in self.workflow_commands if cmd in available_commands]
        assert len(found_workflow_commands) >= 3, \
            f"Need at least 3 workflow commands, found {len(found_workflow_commands)}: {found_workflow_commands}"
        
        print(f"✅ Workflow commands validated ({len(found_workflow_commands)}/4 found)")
    
    def test_core_commands_coverage(self):
        """Test: 13 core commands mentioned in blog post coverage."""
        print("Testing core commands coverage...")
        
        available_commands = []
        for cmd_file in self._get_command_files(self.active_dir):
            available_commands.append(cmd_file.stem)
        
        for cmd_file in self._get_command_files(self.experiments_dir):
            available_commands.append(cmd_file.stem)
        
        found_core_commands = []
        missing_core_commands = []
        
        for cmd in self.core_commands:
            if cmd in available_commands:
                found_core_commands.append(cmd)
            else:
                missing_core_commands.append(cmd)
        
        print(f"Found core commands: {found_core_commands}")
        if missing_core_commands:
            print(f"Missing core commands: {missing_core_commands}")
        
        # Should have majority of core commands
        coverage_ratio = len(found_core_commands) / len(self.core_commands)
        assert coverage_ratio >= 0.7, \
            f"Need at least 70% core command coverage, got {coverage_ratio:.1%}"
        
        print(f"✅ Core commands coverage: {len(found_core_commands)}/13 ({coverage_ratio:.1%})")
    
    def test_command_file_structure(self):
        """Test: Command files have proper structure."""
        print("Testing command file structure...")
        
        all_command_files = []
        all_command_files.extend(self._get_command_files(self.active_dir))
        all_command_files.extend(self._get_command_files(self.experiments_dir))
        
        assert len(all_command_files) > 0, "No command files found"
        
        structural_issues = []
        
        for cmd_file in all_command_files:
            try:
                cmd_data = self._parse_command_file(cmd_file)
                
                # Check minimum content size
                if cmd_data['size'] < 100:
                    structural_issues.append(f"{cmd_data['name']}: Too short ({cmd_data['size']} chars)")
                
                # Check for basic markdown structure
                content = cmd_data['content']
                if not content.startswith('#') and '---' not in content[:50]:
                    structural_issues.append(f"{cmd_data['name']}: No clear header structure")
                
                # Check for description
                if not any(word in content.lower() for word in ['description', 'usage', 'implementation']):
                    structural_issues.append(f"{cmd_data['name']}: Missing description/usage sections")
                
            except Exception as e:
                structural_issues.append(f"{cmd_file.name}: Parse error - {e}")
        
        if structural_issues:
            print("⚠️  Structural issues found:")
            for issue in structural_issues[:5]:  # Limit output
                print(f"  - {issue}")
            if len(structural_issues) > 5:
                print(f"  ... and {len(structural_issues) - 5} more")
        
        # Should have mostly well-structured commands
        good_commands = len(all_command_files) - len(structural_issues)
        structure_ratio = good_commands / len(all_command_files)
        
        assert structure_ratio >= 0.8, \
            f"Need at least 80% well-structured commands, got {structure_ratio:.1%}"
        
        print(f"✅ Command structure validated ({good_commands}/{len(all_command_files)} commands)")
    
    def test_workflow_command_content(self):
        """Test: Workflow commands have appropriate content."""
        print("Testing workflow command content...")
        
        workflow_expectations = {
            'xtest': ['test', 'coverage', 'run'],
            'xsecurity': ['security', 'vulnerability', 'scan'],
            'xquality': ['quality', 'lint', 'format'],
            'xgit': ['git', 'commit', 'push']
        }
        
        content_issues = []
        validated_commands = []
        
        for cmd_name, expected_keywords in workflow_expectations.items():
            # Check active directory first
            cmd_file = self.active_dir / f"{cmd_name}.md"
            if not cmd_file.exists():
                # Check experiments directory
                cmd_file = self.experiments_dir / f"{cmd_name}.md"
            
            if not cmd_file.exists():
                content_issues.append(f"{cmd_name}: Command file not found")
                continue
            
            try:
                cmd_data = self._parse_command_file(cmd_file)
                content = cmd_data['content'].lower()
                
                # Check for expected keywords
                missing_keywords = []
                for keyword in expected_keywords:
                    if keyword not in content:
                        missing_keywords.append(keyword)
                
                if missing_keywords:
                    content_issues.append(f"{cmd_name}: Missing keywords - {missing_keywords}")
                else:
                    validated_commands.append(cmd_name)
                
            except Exception as e:
                content_issues.append(f"{cmd_name}: Content analysis error - {e}")
        
        if content_issues:
            print("⚠️  Content validation issues:")
            for issue in content_issues:
                print(f"  - {issue}")
        
        # Should validate majority of workflow commands
        assert len(validated_commands) >= 2, \
            f"Need at least 2 validated workflow commands, got {len(validated_commands)}: {validated_commands}"
        
        print(f"✅ Workflow command content validated ({len(validated_commands)} commands)")
    
    def test_command_deployment_simulation(self):
        """Test: Commands can be deployed to temporary location."""
        print("Testing command deployment simulation...")
        
        temp_dir = self.setup_test_env()
        try:
            # Copy some active commands to test deployment
            active_commands = self._get_command_files(self.active_dir)
            if not active_commands:
                print("⚠️  No active commands found to test deployment")
                return
            
            deployed_count = 0
            deployment_errors = []
            
            # Test deploying first few commands
            for cmd_file in active_commands[:5]:
                try:
                    target_file = self.temp_commands_dir / cmd_file.name
                    shutil.copy2(cmd_file, target_file)
                    
                    # Verify deployment
                    if target_file.exists() and target_file.stat().st_size > 0:
                        deployed_count += 1
                    else:
                        deployment_errors.append(f"{cmd_file.name}: Failed to deploy properly")
                        
                except Exception as e:
                    deployment_errors.append(f"{cmd_file.name}: Deployment error - {e}")
            
            if deployment_errors:
                print("⚠️  Deployment issues:")
                for error in deployment_errors:
                    print(f"  - {error}")
            
            assert deployed_count > 0, "No commands deployed successfully"
            assert deployed_count >= min(3, len(active_commands)), \
                f"Should deploy most commands, got {deployed_count}/{min(5, len(active_commands))}"
            
            print(f"✅ Command deployment simulation validated ({deployed_count} commands)")
            
        finally:
            self.cleanup_test_env(temp_dir)
    
    def test_command_naming_conventions(self):
        """Test: Commands follow naming conventions from blog post."""
        print("Testing command naming conventions...")
        
        all_command_files = []
        all_command_files.extend(self._get_command_files(self.active_dir))
        all_command_files.extend(self._get_command_files(self.experiments_dir))
        
        naming_issues = []
        valid_names = 0
        
        for cmd_file in all_command_files:
            cmd_name = cmd_file.stem
            
            # Should start with 'x' (blog post convention)
            if not cmd_name.startswith('x'):
                naming_issues.append(f"{cmd_name}: Doesn't follow 'x' prefix convention")
                continue
            
            # Should be lowercase alphanumeric
            if not re.match(r'^x[a-z][a-z0-9]*$', cmd_name):
                naming_issues.append(f"{cmd_name}: Invalid naming pattern (should be x + lowercase alphanumeric)")
                continue
            
            # Should be reasonable length
            if len(cmd_name) < 3 or len(cmd_name) > 20:
                naming_issues.append(f"{cmd_name}: Unreasonable length ({len(cmd_name)} chars)")
                continue
            
            valid_names += 1
        
        if naming_issues:
            print("⚠️  Naming convention issues:")
            for issue in naming_issues[:5]:  # Limit output
                print(f"  - {issue}")
            if len(naming_issues) > 5:
                print(f"  ... and {len(naming_issues) - 5} more")
        
        # Should have mostly well-named commands
        naming_ratio = valid_names / len(all_command_files) if all_command_files else 0
        assert naming_ratio >= 0.9, \
            f"Need at least 90% well-named commands, got {naming_ratio:.1%}"
        
        print(f"✅ Command naming conventions validated ({valid_names}/{len(all_command_files)} commands)")
    
    def test_command_categories_coverage(self):
        """Test: Commands cover the categories mentioned in blog post."""
        print("Testing command categories coverage...")
        
        # Categories from blog post
        category_keywords = {
            'daily_development': ['test', 'quality', 'git'],
            'security_safety': ['security', 'refactor'],
            'problem_solving': ['debug', 'architecture'],
            'documentation': ['spec', 'docs'],
            'devops': ['pipeline', 'release', 'config']
        }
        
        all_command_files = []
        all_command_files.extend(self._get_command_files(self.active_dir))
        all_command_files.extend(self._get_command_files(self.experiments_dir))
        
        category_coverage = {category: [] for category in category_keywords.keys()}
        
        for cmd_file in all_command_files:
            cmd_name = cmd_file.stem.lower()
            
            for category, keywords in category_keywords.items():
                if any(keyword in cmd_name for keyword in keywords):
                    category_coverage[category].append(cmd_name)
        
        covered_categories = 0
        for category, commands in category_coverage.items():
            if commands:
                covered_categories += 1
                print(f"  {category}: {commands}")
        
        # Should cover most categories
        coverage_ratio = covered_categories / len(category_keywords)
        assert coverage_ratio >= 0.6, \
            f"Need at least 60% category coverage, got {coverage_ratio:.1%}"
        
        print(f"✅ Command categories coverage validated ({covered_categories}/{len(category_keywords)} categories)")
    
    def test_experimental_vs_active_distribution(self):
        """Test: Reasonable distribution between active and experimental commands."""
        print("Testing active vs experimental command distribution...")
        
        active_commands = self._get_command_files(self.active_dir)
        experimental_commands = self._get_command_files(self.experiments_dir)
        
        active_count = len(active_commands)
        experimental_count = len(experimental_commands)
        total_count = active_count + experimental_count
        
        assert total_count > 0, "No commands found"
        assert active_count > 0, "No active commands found"
        
        # Blog post mentions 13 core + 44 experimental ≈ 23% active
        active_ratio = active_count / total_count
        
        print(f"Active commands: {active_count}")
        print(f"Experimental commands: {experimental_count}")
        print(f"Total commands: {total_count}")
        print(f"Active ratio: {active_ratio:.1%}")
        
        # Should have reasonable distribution (not all in one category)
        assert active_ratio >= 0.1, f"Too few active commands ({active_ratio:.1%})"
        assert active_ratio <= 0.5, f"Too many active commands ({active_ratio:.1%})"
        
        print("✅ Command distribution validated")
    
    def run_all_tests(self):
        """Run all core workflow command tests."""
        print("🧪 Running Core Workflow Command Tests")
        print("=" * 50)
        
        tests = [
            self.test_workflow_commands_exist,
            self.test_core_commands_coverage,
            self.test_command_file_structure,
            self.test_workflow_command_content,
            self.test_command_deployment_simulation,
            self.test_command_naming_conventions,
            self.test_command_categories_coverage,
            self.test_experimental_vs_active_distribution
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
        print(f"Core workflow tests: {passed} passed, {failed} failed, {skipped} skipped")
        
        if failed > 0:
            sys.exit(1)
        else:
            if skipped > 0:
                print(f"🎉 All available tests passed! ({skipped} tests skipped)")
            else:
                print("🎉 All core workflow command tests passed!")
            return True


def main():
    """Main test runner."""
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print(__doc__)
        return
    
    tester = TestCoreWorkflowCommands()
    tester.run_all_tests()


if __name__ == '__main__':
    main()