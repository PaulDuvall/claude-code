#!/usr/bin/env python3
"""
Interactive Setup Wizard Implementation for REQ-007
Priority: Medium
Requirement: WHEN the environment validation passes
THE SYSTEM SHALL present an interactive wizard prompting for installation type, command sets, security hooks, and configuration template
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
import time


class InteractiveSetupWizard:
    """Main class for interactive setup wizard functionality"""
    
    def __init__(self, package_root: Path):
        """Initialize interactive setup wizard with package root directory"""
        self.package_root = Path(package_root)
        self.config_file = self.package_root / "setup_config.json"
        
        # Default configuration options
        self.installation_types = [
            {
                'id': 1,
                'name': 'Minimal Installation',
                'description': 'Essential commands only - lightweight setup',
                'commands': ['xhelp', 'xversion', 'xstatus']
            },
            {
                'id': 2,
                'name': 'Standard Installation', 
                'description': 'Recommended commands for most developers',
                'commands': ['xgit', 'xtest', 'xquality', 'xdocs', 'xsecurity']
            },
            {
                'id': 3,
                'name': 'Full Installation',
                'description': 'All available commands - complete toolkit',
                'commands': 'all'
            }
        ]
        
        self.command_categories = {
            'planning': ['xplanning', 'xspec', 'xarchitecture'],
            'development': ['xgit', 'xtest', 'xquality', 'xrefactor', 'xtdd'],
            'security': ['xsecurity', 'xpolicy', 'xcompliance'],
            'deployment': ['xrelease', 'xpipeline', 'xinfra'],
            'documentation': ['xdocs']
        }
        
        self.security_hooks = [
            {
                'id': 1,
                'name': 'credential-protection',
                'description': 'Prevents credential exposure in commits',
                'file': 'prevent-credential-exposure.sh'
            },
            {
                'id': 2,
                'name': 'file-logger',
                'description': 'Logs file operations for audit trail',
                'file': 'file-logger.sh'
            }
        ]
        
        self.configuration_templates = [
            {
                'id': 1,
                'name': 'basic',
                'description': 'Basic Claude Code configuration',
                'file': 'basic-settings.json'
            },
            {
                'id': 2,
                'name': 'security-focused',
                'description': 'Security-focused configuration with enhanced hooks',
                'file': 'security-focused-settings.json'
            },
            {
                'id': 3,
                'name': 'comprehensive',
                'description': 'Comprehensive configuration with all features',
                'file': 'comprehensive-settings.json'
            }
        ]
        
        self.preset_configurations = {
            'developer': {
                'installation_type': 'standard',
                'command_sets': ['development', 'planning'],
                'security_hooks': True,
                'configuration_template': 'basic'
            },
            'security-focused': {
                'installation_type': 'full',
                'command_sets': ['security', 'development'],
                'security_hooks': True,
                'configuration_template': 'security-focused'
            },
            'minimal': {
                'installation_type': 'minimal',
                'command_sets': [],
                'security_hooks': False,
                'configuration_template': 'basic'
            }
        }
    
    def setup(self):
        """Set up interactive setup wizard"""
        # Ensure package root exists
        self.package_root.mkdir(parents=True, exist_ok=True)
    
    def show_welcome_message(self) -> Dict:
        """Display welcome message for the setup wizard"""
        welcome_text = """
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        Claude Dev Toolkit Setup Wizard                       ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  Welcome to the Claude Dev Toolkit interactive setup wizard!                 ║
║                                                                               ║
║  This wizard will guide you through configuring your Claude Code             ║
║  environment with custom commands, security hooks, and templates.            ║
║                                                                               ║
║  You can press '?' at any prompt for help, or 'q' to quit.                   ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""
        print(welcome_text)
        return {'welcome_displayed': True, 'message': welcome_text}
    
    def get_installation_type_options(self) -> List[Dict]:
        """Get available installation type options"""
        return self.installation_types
    
    def prompt_installation_type(self) -> Dict:
        """Prompt user to select installation type"""
        print("\n📦 Installation Type Selection")
        print("=" * 50)
        
        for install_type in self.installation_types:
            print(f"{install_type['id']}. {install_type['name']}")
            print(f"   {install_type['description']}")
            print()
        
        while True:
            choice = input("Select installation type (1-3, ? for help): ").strip()
            
            if choice == '?':
                print("\nInstallation Type Help:")
                print("• Minimal: Only essential commands for basic functionality")
                print("• Standard: Recommended set for most development workflows") 
                print("• Full: Complete toolkit with all available commands")
                print()
                continue
            
            if choice == 'q':
                return {'cancelled': True}
            
            try:
                choice_id = int(choice)
                if 1 <= choice_id <= len(self.installation_types):
                    selected = self.installation_types[choice_id - 1]
                    return {
                        'installation_type': selected['name'].lower().replace(' ', '_'),
                        'description': selected['description'],
                        'selected_option': choice_id,
                        'commands': selected['commands']
                    }
                else:
                    print(f"Please enter a number between 1 and {len(self.installation_types)}")
            except ValueError:
                print("Please enter a valid number")
    
    def get_command_set_categories(self) -> Dict:
        """Get available command set categories"""
        return self.command_categories
    
    def prompt_command_sets(self) -> Dict:
        """Prompt user to select command sets"""
        print("\n🛠️  Command Set Selection")
        print("=" * 50)
        print("Select which command categories to include (comma-separated numbers):")
        print()
        
        categories = list(self.command_categories.keys())
        for i, category in enumerate(categories, 1):
            commands = self.command_categories[category]
            print(f"{i}. {category.title()} ({len(commands)} commands)")
            print(f"   Commands: {', '.join(commands)}")
            print()
        
        while True:
            choice = input("Select categories (e.g., 1,3,5 or 'all'): ").strip()
            
            if choice == 'q':
                return {'cancelled': True}
            
            if choice.lower() == 'all':
                return {
                    'selected_command_sets': categories,
                    'active_commands': True,
                    'experimental_commands': False
                }
            
            try:
                if ',' in choice:
                    choices = [int(x.strip()) for x in choice.split(',')]
                else:
                    choices = [int(choice)]
                
                selected_categories = []
                for choice_id in choices:
                    if 1 <= choice_id <= len(categories):
                        selected_categories.append(categories[choice_id - 1])
                    else:
                        raise ValueError(f"Invalid choice: {choice_id}")
                
                return {
                    'selected_command_sets': selected_categories,
                    'active_commands': True,
                    'experimental_commands': False
                }
            except ValueError as e:
                print(f"Invalid input: {e}. Please enter comma-separated numbers (1-{len(categories)})")
    
    def get_available_security_hooks(self) -> List[Dict]:
        """Get available security hooks"""
        return self.security_hooks
    
    def prompt_security_hooks(self) -> Dict:
        """Prompt user for security hooks configuration"""
        print("\n🔒 Security Hooks Configuration")
        print("=" * 50)
        
        enable_hooks = input("Enable security hooks? (y/n): ").strip().lower()
        
        if enable_hooks in ['y', 'yes']:
            print("\nAvailable security hooks:")
            for hook in self.security_hooks:
                print(f"{hook['id']}. {hook['name']}")
                print(f"   {hook['description']}")
                print()
            
            choice = input("Select hooks (comma-separated numbers, or 'all'): ").strip()
            
            if choice.lower() == 'all':
                selected_hooks = self.security_hooks
            else:
                try:
                    choices = [int(x.strip()) for x in choice.split(',')]
                    selected_hooks = []
                    for choice_id in choices:
                        if 1 <= choice_id <= len(self.security_hooks):
                            selected_hooks.append(self.security_hooks[choice_id - 1])
                except ValueError:
                    selected_hooks = []
            
            return {
                'security_hooks_enabled': True,
                'selected_hooks': [hook['name'] for hook in selected_hooks],
                'hook_configuration': selected_hooks
            }
        else:
            return {
                'security_hooks_enabled': False,
                'selected_hooks': [],
                'hook_configuration': []
            }
    
    def get_configuration_templates(self) -> List[Dict]:
        """Get available configuration templates"""
        return self.configuration_templates
    
    def prompt_configuration_template(self) -> Dict:
        """Prompt user to select configuration template"""
        print("\n⚙️  Configuration Template Selection")
        print("=" * 50)
        
        for template in self.configuration_templates:
            print(f"{template['id']}. {template['name'].title()}")
            print(f"   {template['description']}")
            print()
        
        while True:
            choice = input(f"Select configuration template (1-{len(self.configuration_templates)}): ").strip()
            
            if choice == 'q':
                return {'cancelled': True}
            
            try:
                choice_id = int(choice)
                if 1 <= choice_id <= len(self.configuration_templates):
                    selected = self.configuration_templates[choice_id - 1]
                    return {
                        'template_type': selected['name'],
                        'template_name': selected['name'],
                        'template_description': selected['description'],
                        'template_file': selected['file']
                    }
                else:
                    print(f"Please enter a number between 1 and {len(self.configuration_templates)}")
            except ValueError:
                print("Please enter a valid number")
    
    def run_interactive_setup(self) -> Dict:
        """Run the complete interactive setup process"""
        print("\n🚀 Starting Interactive Setup...")
        
        # Show welcome message
        self.show_welcome_message()
        
        setup_config = {}
        
        # Step 1: Installation type
        print("\n[Step 1/4] Installation Type")
        install_result = self.prompt_installation_type()
        if install_result.get('cancelled'):
            return {'cancelled': True, 'step': 'installation_type'}
        setup_config['installation_type'] = install_result
        
        # Step 2: Command sets
        print("\n[Step 2/4] Command Sets")
        commands_result = self.prompt_command_sets()
        if commands_result.get('cancelled'):
            return {'cancelled': True, 'step': 'command_sets'}
        setup_config['command_sets'] = commands_result
        
        # Step 3: Security hooks
        print("\n[Step 3/4] Security Configuration")
        security_result = self.prompt_security_hooks()
        if security_result.get('cancelled'):
            return {'cancelled': True, 'step': 'security_hooks'}
        setup_config['security_hooks'] = security_result
        
        # Step 4: Configuration template
        print("\n[Step 4/4] Configuration Template")
        template_result = self.prompt_configuration_template()
        if template_result.get('cancelled'):
            return {'cancelled': True, 'step': 'configuration_template'}
        setup_config['configuration_template'] = template_result
        
        # Complete setup
        print("\n✅ Setup completed successfully!")
        
        # Save configuration
        save_result = self.save_configuration(setup_config)
        
        return {
            'setup_completed': True,
            'installation_type': install_result,
            'command_sets': commands_result,
            'security_hooks': security_result,
            'configuration_template': template_result,
            'config_saved': save_result['saved'],
            'config_file': save_result.get('config_file')
        }
    
    def save_configuration(self, config: Dict) -> Dict:
        """Save configuration to file"""
        try:
            # Add metadata
            config_with_metadata = {
                'setup_timestamp': time.time(),
                'wizard_version': '1.0.0',
                'configuration': config
            }
            
            with open(self.config_file, 'w') as f:
                json.dump(config_with_metadata, f, indent=2)
            
            return {
                'saved': True,
                'config_file': str(self.config_file)
            }
        except Exception as e:
            return {
                'saved': False,
                'error': str(e)
            }
    
    def load_existing_configuration(self) -> Dict:
        """Load existing configuration if available"""
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r') as f:
                    config_data = json.load(f)
                
                return {
                    'found': True,
                    'config': config_data.get('configuration', {}),
                    'timestamp': config_data.get('setup_timestamp')
                }
            else:
                return {'found': False}
        except Exception:
            return {'found': False, 'error': 'Failed to load configuration'}
    
    def generate_installation_summary(self, config: Dict) -> Dict:
        """Generate installation summary"""
        # Count commands based on selected sets
        command_count = 0
        
        # Handle different config structures
        if 'command_sets' in config:
            if isinstance(config['command_sets'], dict):
                selected_sets = config['command_sets'].get('selected_command_sets', [])
            else:
                selected_sets = config['command_sets']
        else:
            selected_sets = config.get('selected_command_sets', [])
        
        for category in selected_sets:
            if category in self.command_categories:
                command_count += len(self.command_categories[category])
        
        # Calculate estimated size (rough estimate)
        base_size = 5  # MB for core
        command_size = command_count * 0.1  # MB per command
        
        # Handle different security config structures
        security_enabled = False
        if 'security_hooks' in config:
            if isinstance(config['security_hooks'], dict):
                security_enabled = config['security_hooks'].get('security_hooks_enabled', False)
            else:
                security_enabled = bool(config['security_hooks'])
        
        security_size = 2 if security_enabled else 0
        
        # Handle different installation type structures
        installation_type = 'unknown'
        if 'installation_type' in config:
            if isinstance(config['installation_type'], dict):
                installation_type = config['installation_type'].get('installation_type', 'unknown')
            else:
                installation_type = config['installation_type']
        
        return {
            'installation_type': installation_type,
            'command_count': command_count,
            'security_features': security_enabled,
            'estimated_size': f"{base_size + command_size + security_size:.1f} MB",
            'selected_categories': selected_sets
        }
    
    def run_non_interactive_setup(self) -> Dict:
        """Run setup with default configuration (non-interactive mode)"""
        default_config = {
            'installation_type': {
                'installation_type': 'standard',
                'description': 'Standard installation with recommended commands'
            },
            'command_sets': {
                'selected_command_sets': ['development', 'planning'],
                'active_commands': True,
                'experimental_commands': False
            },
            'security_hooks': {
                'security_hooks_enabled': True,
                'selected_hooks': ['credential-protection'],
                'hook_configuration': [self.security_hooks[0]]
            },
            'configuration_template': {
                'template_type': 'basic',
                'template_name': 'basic',
                'template_description': 'Basic Claude Code configuration'
            }
        }
        
        # Save the default configuration
        save_result = self.save_configuration(default_config)
        
        return {
            'setup_completed': True,
            'installation_type': default_config['installation_type']['installation_type'],
            'command_sets': default_config['command_sets']['selected_command_sets'],
            'non_interactive': True,
            'config_saved': save_result['saved']
        }
    
    def get_preset_configurations(self) -> Dict:
        """Get available preset configurations"""
        return self.preset_configurations
    
    def apply_preset(self, preset_name: str) -> Dict:
        """Apply a preset configuration"""
        if preset_name in self.preset_configurations:
            preset = self.preset_configurations[preset_name]
            return {
                'installation_type': preset['installation_type'],
                'command_sets': preset['command_sets'],
                'security_hooks': preset['security_hooks'],
                'configuration_template': preset['configuration_template'],
                'preset_applied': preset_name
            }
        else:
            return {'error': f'Preset {preset_name} not found'}
    
    def validate_environment_for_setup(self) -> Dict:
        """Validate environment before starting setup"""
        try:
            # Simple validation - check if we can write to package root
            test_file = self.package_root / '.test_write'
            test_file.write_text('test')
            test_file.unlink()
            
            validation_result = self._validate_environment()
            
            return {
                'environment_valid': validation_result['valid'],
                'message': validation_result['message'],
                'can_proceed': validation_result['valid']
            }
        except Exception as e:
            return {
                'environment_valid': False,
                'message': f'Environment validation failed: {str(e)}',
                'can_proceed': False
            }
    
    def handle_setup_error(self, error: Exception) -> Dict:
        """Handle setup errors gracefully"""
        error_message = str(error)
        
        recovery_steps = [
            "Check that you have write permissions to the installation directory",
            "Ensure sufficient disk space is available",
            "Verify your network connection if downloading components",
            "Try running the setup wizard again",
            "Contact support if the problem persists"
        ]
        
        return {
            'error_handled': True,
            'error_message': error_message,
            'recovery_steps': recovery_steps,
            'timestamp': time.time()
        }
    
    def get_configuration_schema(self) -> Dict:
        """Get the configuration schema for validation"""
        return {
            'installation_type': {
                'type': 'string',
                'required': True,
                'options': ['minimal', 'standard', 'full']
            },
            'command_sets': {
                'type': 'list',
                'required': True,
                'options': list(self.command_categories.keys())
            },
            'security_hooks': {
                'type': 'boolean',
                'required': False,
                'default': True
            },
            'configuration_template': {
                'type': 'string',
                'required': True,
                'options': [t['name'] for t in self.configuration_templates]
            }
        }
    
    def run_batch_setup(self, batch_config_file: str) -> Dict:
        """Run setup in batch mode using configuration file"""
        try:
            with open(batch_config_file, 'r') as f:
                batch_config = json.load(f)
            
            # Apply the batch configuration
            result = {
                'batch_completed': True,
                'applied_configuration': batch_config,
                'timestamp': time.time()
            }
            
            # Save the applied configuration
            save_result = self.save_configuration(batch_config)
            result['config_saved'] = save_result['saved']
            
            return result
            
        except Exception as e:
            return {
                'batch_completed': False,
                'error': str(e),
                'recovery_steps': ['Check batch configuration file format', 'Verify file permissions']
            }
    
    def _validate_environment(self) -> Dict:
        """Internal method to validate environment"""
        # Simple validation for testing purposes
        return {
            'valid': True,
            'message': 'Environment validation passed'
        }