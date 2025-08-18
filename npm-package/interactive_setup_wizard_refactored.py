#!/usr/bin/env python3
"""
Refactored Interactive Setup Wizard Implementation for REQ-007
Applied Extract Class, Strategy Pattern, and Command Pattern
"""

import json
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Any, Protocol
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum


class SetupStep(Enum):
    """Setup wizard steps"""
    INSTALLATION_TYPE = "installation_type"
    COMMAND_SETS = "command_sets"
    SECURITY_HOOKS = "security_hooks"
    CONFIGURATION_TEMPLATE = "configuration_template"


@dataclass
class InstallationType:
    """Data class for installation type options"""
    id: int
    name: str
    description: str
    commands: List[str]


@dataclass
class SecurityHook:
    """Data class for security hook configuration"""
    id: int
    name: str
    description: str
    file: str


@dataclass
class ConfigurationTemplate:
    """Data class for configuration template"""
    id: int
    name: str
    description: str
    file: str


@dataclass
class SetupConfiguration:
    """Complete setup configuration"""
    installation_type: Dict
    command_sets: Dict
    security_hooks: Dict
    configuration_template: Dict
    timestamp: float = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()


class UserInterface(ABC):
    """Abstract interface for user interaction"""
    
    @abstractmethod
    def display_message(self, message: str) -> None:
        """Display a message to the user"""
        pass
    
    @abstractmethod
    def get_user_input(self, prompt: str) -> str:
        """Get input from the user"""
        pass
    
    @abstractmethod
    def display_options(self, options: List[Dict]) -> None:
        """Display options to the user"""
        pass


class ConsoleInterface(UserInterface):
    """Console-based user interface"""
    
    def display_message(self, message: str) -> None:
        """Display a message to the console"""
        print(message)
    
    def get_user_input(self, prompt: str) -> str:
        """Get input from the console"""
        return input(prompt).strip()
    
    def display_options(self, options: List[Dict]) -> None:
        """Display options in a formatted list"""
        for option in options:
            print(f"{option['id']}. {option['name']}")
            if 'description' in option:
                print(f"   {option['description']}")
            print()


class ConfigurationDataProvider:
    """Provides configuration data for the setup wizard"""
    
    def __init__(self):
        self._installation_types = self._init_installation_types()
        self._command_categories = self._init_command_categories()
        self._security_hooks = self._init_security_hooks()
        self._configuration_templates = self._init_configuration_templates()
        self._preset_configurations = self._init_preset_configurations()
    
    def _init_installation_types(self) -> List[InstallationType]:
        """Initialize installation type options"""
        return [
            InstallationType(
                id=1,
                name='Minimal Installation',
                description='Essential commands only - lightweight setup',
                commands=['xhelp', 'xversion', 'xstatus']
            ),
            InstallationType(
                id=2,
                name='Standard Installation',
                description='Recommended commands for most developers',
                commands=['xgit', 'xtest', 'xquality', 'xdocs', 'xsecurity']
            ),
            InstallationType(
                id=3,
                name='Full Installation',
                description='All available commands - complete toolkit',
                commands=['all']
            )
        ]
    
    def _init_command_categories(self) -> Dict[str, List[str]]:
        """Initialize command categories"""
        return {
            'planning': ['xplanning', 'xspec', 'xarchitecture'],
            'development': ['xgit', 'xtest', 'xquality', 'xrefactor', 'xtdd'],
            'security': ['xsecurity', 'xpolicy', 'xcompliance'],
            'deployment': ['xrelease', 'xpipeline', 'xinfra'],
            'documentation': ['xdocs']
        }
    
    def _init_security_hooks(self) -> List[SecurityHook]:
        """Initialize security hook options"""
        return [
            SecurityHook(
                id=1,
                name='credential-protection',
                description='Prevents credential exposure in commits',
                file='prevent-credential-exposure.sh'
            ),
            SecurityHook(
                id=2,
                name='file-logger',
                description='Logs file operations for audit trail',
                file='file-logger.sh'
            )
        ]
    
    def _init_configuration_templates(self) -> List[ConfigurationTemplate]:
        """Initialize configuration template options"""
        return [
            ConfigurationTemplate(
                id=1,
                name='basic',
                description='Basic Claude Code configuration',
                file='basic-settings.json'
            ),
            ConfigurationTemplate(
                id=2,
                name='security-focused',
                description='Security-focused configuration with enhanced hooks',
                file='security-focused-settings.json'
            ),
            ConfigurationTemplate(
                id=3,
                name='comprehensive',
                description='Comprehensive configuration with all features',
                file='comprehensive-settings.json'
            )
        ]
    
    def _init_preset_configurations(self) -> Dict[str, Dict]:
        """Initialize preset configurations"""
        return {
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
    
    @property
    def installation_types(self) -> List[InstallationType]:
        return self._installation_types
    
    @property
    def command_categories(self) -> Dict[str, List[str]]:
        return self._command_categories
    
    @property
    def security_hooks(self) -> List[SecurityHook]:
        return self._security_hooks
    
    @property
    def configuration_templates(self) -> List[ConfigurationTemplate]:
        return self._configuration_templates
    
    @property
    def preset_configurations(self) -> Dict[str, Dict]:
        return self._preset_configurations


class InputValidator:
    """Validates user input"""
    
    @staticmethod
    def validate_choice(choice: str, max_options: int) -> Optional[int]:
        """Validate user choice against available options"""
        try:
            choice_id = int(choice)
            if 1 <= choice_id <= max_options:
                return choice_id
            return None
        except ValueError:
            return None
    
    @staticmethod
    def validate_multiple_choices(choices: str, max_options: int) -> Optional[List[int]]:
        """Validate multiple user choices"""
        try:
            if choices.lower() == 'all':
                return list(range(1, max_options + 1))
            
            if ',' in choices:
                choice_list = [int(x.strip()) for x in choices.split(',')]
            else:
                choice_list = [int(choices)]
            
            if all(1 <= choice <= max_options for choice in choice_list):
                return choice_list
            return None
        except ValueError:
            return None


class SetupStepHandler(ABC):
    """Abstract handler for setup steps"""
    
    def __init__(self, ui: UserInterface, data_provider: ConfigurationDataProvider):
        self.ui = ui
        self.data_provider = data_provider
    
    @abstractmethod
    def execute(self) -> Dict:
        """Execute the setup step"""
        pass
    
    @abstractmethod
    def get_help_text(self) -> str:
        """Get help text for this step"""
        pass


class InstallationTypeHandler(SetupStepHandler):
    """Handles installation type selection"""
    
    def execute(self) -> Dict:
        """Execute installation type selection"""
        self.ui.display_message("\n📦 Installation Type Selection")
        self.ui.display_message("=" * 50)
        
        options = [
            {
                'id': inst_type.id,
                'name': inst_type.name,
                'description': inst_type.description
            }
            for inst_type in self.data_provider.installation_types
        ]
        
        self.ui.display_options(options)
        
        while True:
            choice = self.ui.get_user_input("Select installation type (1-3, ? for help): ")
            
            if choice == '?':
                self.ui.display_message(self.get_help_text())
                continue
            
            if choice == 'q':
                return {'cancelled': True}
            
            choice_id = InputValidator.validate_choice(choice, len(self.data_provider.installation_types))
            if choice_id:
                selected = self.data_provider.installation_types[choice_id - 1]
                return {
                    'installation_type': selected.name.lower().replace(' ', '_'),
                    'description': selected.description,
                    'selected_option': choice_id,
                    'commands': selected.commands
                }
            else:
                self.ui.display_message(f"Please enter a number between 1 and {len(self.data_provider.installation_types)}")
    
    def get_help_text(self) -> str:
        return """
Installation Type Help:
• Minimal: Only essential commands for basic functionality
• Standard: Recommended set for most development workflows
• Full: Complete toolkit with all available commands
"""


class CommandSetsHandler(SetupStepHandler):
    """Handles command set selection"""
    
    def execute(self) -> Dict:
        """Execute command sets selection"""
        self.ui.display_message("\n🛠️  Command Set Selection")
        self.ui.display_message("=" * 50)
        self.ui.display_message("Select which command categories to include (comma-separated numbers):")
        self.ui.display_message("")
        
        categories = list(self.data_provider.command_categories.keys())
        for i, category in enumerate(categories, 1):
            commands = self.data_provider.command_categories[category]
            self.ui.display_message(f"{i}. {category.title()} ({len(commands)} commands)")
            self.ui.display_message(f"   Commands: {', '.join(commands)}")
            self.ui.display_message("")
        
        while True:
            choice = self.ui.get_user_input("Select categories (e.g., 1,3,5 or 'all'): ")
            
            if choice == 'q':
                return {'cancelled': True}
            
            choices = InputValidator.validate_multiple_choices(choice, len(categories))
            if choices:
                selected_categories = [categories[i - 1] for i in choices]
                return {
                    'selected_command_sets': selected_categories,
                    'active_commands': True,
                    'experimental_commands': False
                }
            else:
                self.ui.display_message(f"Invalid input. Please enter comma-separated numbers (1-{len(categories)})")
    
    def get_help_text(self) -> str:
        return """
Command Sets Help:
• Planning: Project planning and architecture commands
• Development: Core development workflow commands
• Security: Security analysis and compliance commands
• Deployment: Release and infrastructure commands
• Documentation: Documentation generation commands
"""


class SecurityHooksHandler(SetupStepHandler):
    """Handles security hooks configuration"""
    
    def execute(self) -> Dict:
        """Execute security hooks configuration"""
        self.ui.display_message("\n🔒 Security Hooks Configuration")
        self.ui.display_message("=" * 50)
        
        enable_hooks = self.ui.get_user_input("Enable security hooks? (y/n): ").lower()
        
        if enable_hooks in ['y', 'yes']:
            self.ui.display_message("\nAvailable security hooks:")
            options = [
                {
                    'id': hook.id,
                    'name': hook.name,
                    'description': hook.description
                }
                for hook in self.data_provider.security_hooks
            ]
            
            self.ui.display_options(options)
            
            choice = self.ui.get_user_input("Select hooks (comma-separated numbers, or 'all'): ")
            
            selected_hooks = []
            if choice.lower() == 'all':
                selected_hooks = self.data_provider.security_hooks
            else:
                choices = InputValidator.validate_multiple_choices(choice, len(self.data_provider.security_hooks))
                if choices:
                    selected_hooks = [self.data_provider.security_hooks[i - 1] for i in choices]
            
            return {
                'security_hooks_enabled': True,
                'selected_hooks': [hook.name for hook in selected_hooks],
                'hook_configuration': [
                    {'id': hook.id, 'name': hook.name, 'description': hook.description, 'file': hook.file}
                    for hook in selected_hooks
                ]
            }
        else:
            return {
                'security_hooks_enabled': False,
                'selected_hooks': [],
                'hook_configuration': []
            }
    
    def get_help_text(self) -> str:
        return """
Security Hooks Help:
• Credential Protection: Prevents accidental credential commits
• File Logger: Maintains audit trail of file operations
• Hooks run automatically during development workflows
"""


class ConfigurationTemplateHandler(SetupStepHandler):
    """Handles configuration template selection"""
    
    def execute(self) -> Dict:
        """Execute configuration template selection"""
        self.ui.display_message("\n⚙️  Configuration Template Selection")
        self.ui.display_message("=" * 50)
        
        options = [
            {
                'id': template.id,
                'name': template.name.title(),
                'description': template.description
            }
            for template in self.data_provider.configuration_templates
        ]
        
        self.ui.display_options(options)
        
        while True:
            choice = self.ui.get_user_input(f"Select configuration template (1-{len(self.data_provider.configuration_templates)}): ")
            
            if choice == 'q':
                return {'cancelled': True}
            
            choice_id = InputValidator.validate_choice(choice, len(self.data_provider.configuration_templates))
            if choice_id:
                selected = self.data_provider.configuration_templates[choice_id - 1]
                return {
                    'template_type': selected.name,
                    'template_name': selected.name,
                    'template_description': selected.description,
                    'template_file': selected.file
                }
            else:
                self.ui.display_message(f"Please enter a number between 1 and {len(self.data_provider.configuration_templates)}")
    
    def get_help_text(self) -> str:
        return """
Configuration Template Help:
• Basic: Standard configuration for general use
• Security-Focused: Enhanced security features and policies
• Comprehensive: All available features and integrations
"""


class ConfigurationManager:
    """Manages configuration saving and loading"""
    
    def __init__(self, config_file: Path):
        self.config_file = config_file
    
    def save_configuration(self, config: Dict) -> Dict:
        """Save configuration to file"""
        try:
            config_with_metadata = {
                'setup_timestamp': time.time(),
                'wizard_version': '1.0.0',
                'configuration': config
            }
            
            self.config_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_file, 'w') as f:
                json.dump(config_with_metadata, f, indent=2)
            
            return {'saved': True, 'config_file': str(self.config_file)}
        except Exception as e:
            return {'saved': False, 'error': str(e)}
    
    def load_configuration(self) -> Dict:
        """Load existing configuration"""
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


class SetupOrchestrator:
    """Orchestrates the complete setup process"""
    
    def __init__(self, ui: UserInterface, data_provider: ConfigurationDataProvider, config_manager: ConfigurationManager):
        self.ui = ui
        self.data_provider = data_provider
        self.config_manager = config_manager
        
        # Initialize step handlers
        self.step_handlers = {
            SetupStep.INSTALLATION_TYPE: InstallationTypeHandler(ui, data_provider),
            SetupStep.COMMAND_SETS: CommandSetsHandler(ui, data_provider),
            SetupStep.SECURITY_HOOKS: SecurityHooksHandler(ui, data_provider),
            SetupStep.CONFIGURATION_TEMPLATE: ConfigurationTemplateHandler(ui, data_provider)
        }
    
    def run_interactive_setup(self) -> Dict:
        """Run the complete interactive setup process"""
        self.ui.display_message("\n🚀 Starting Interactive Setup...")
        self._show_welcome_message()
        
        setup_config = {}
        steps = [
            (SetupStep.INSTALLATION_TYPE, "Installation Type"),
            (SetupStep.COMMAND_SETS, "Command Sets"),
            (SetupStep.SECURITY_HOOKS, "Security Configuration"),
            (SetupStep.CONFIGURATION_TEMPLATE, "Configuration Template")
        ]
        
        for i, (step, step_name) in enumerate(steps, 1):
            self.ui.display_message(f"\n[Step {i}/{len(steps)}] {step_name}")
            
            result = self.step_handlers[step].execute()
            if result.get('cancelled'):
                return {'cancelled': True, 'step': step.value}
            
            setup_config[step.value] = result
        
        self.ui.display_message("\n✅ Setup completed successfully!")
        
        # Save configuration
        save_result = self.config_manager.save_configuration(setup_config)
        
        return {
            'setup_completed': True,
            **{step.value: setup_config[step.value] for step in SetupStep},
            'config_saved': save_result['saved'],
            'config_file': save_result.get('config_file')
        }
    
    def _show_welcome_message(self) -> Dict:
        """Display welcome message"""
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
        self.ui.display_message(welcome_text)
        return {'welcome_displayed': True, 'message': welcome_text}


class InstallationSummaryGenerator:
    """Generates installation summaries and reports"""
    
    def __init__(self, data_provider: ConfigurationDataProvider):
        self.data_provider = data_provider
    
    def generate_summary(self, config: Dict) -> Dict:
        """Generate installation summary"""
        command_count = self._calculate_command_count(config)
        installation_type = self._extract_installation_type(config)
        security_enabled = self._extract_security_status(config)
        selected_sets = self._extract_selected_sets(config)
        
        # Calculate estimated size
        base_size = 5  # MB for core
        command_size = command_count * 0.1  # MB per command
        security_size = 2 if security_enabled else 0
        
        return {
            'installation_type': installation_type,
            'command_count': command_count,
            'security_features': security_enabled,
            'estimated_size': f"{base_size + command_size + security_size:.1f} MB",
            'selected_categories': selected_sets
        }
    
    def _calculate_command_count(self, config: Dict) -> int:
        """Calculate total number of commands"""
        selected_sets = self._extract_selected_sets(config)
        command_count = 0
        
        for category in selected_sets:
            if category in self.data_provider.command_categories:
                command_count += len(self.data_provider.command_categories[category])
        
        return command_count
    
    def _extract_installation_type(self, config: Dict) -> str:
        """Extract installation type from config"""
        if 'installation_type' in config:
            if isinstance(config['installation_type'], dict):
                return config['installation_type'].get('installation_type', 'unknown')
            else:
                return config['installation_type']
        return 'unknown'
    
    def _extract_security_status(self, config: Dict) -> bool:
        """Extract security status from config"""
        if 'security_hooks' in config:
            if isinstance(config['security_hooks'], dict):
                return config['security_hooks'].get('security_hooks_enabled', False)
            else:
                return bool(config['security_hooks'])
        return False
    
    def _extract_selected_sets(self, config: Dict) -> List[str]:
        """Extract selected command sets from config"""
        if 'command_sets' in config:
            if isinstance(config['command_sets'], dict):
                return config['command_sets'].get('selected_command_sets', [])
            else:
                return config['command_sets']
        return config.get('selected_command_sets', [])


class InteractiveSetupWizard:
    """Main facade for interactive setup wizard - refactored with composition"""
    
    def __init__(self, package_root: Path, ui: Optional[UserInterface] = None):
        """Initialize interactive setup wizard with package root"""
        self.package_root = Path(package_root)
        self.config_file = self.package_root / "setup_config.json"
        
        # Composed components
        self.ui = ui or ConsoleInterface()
        self.data_provider = ConfigurationDataProvider()
        self.config_manager = ConfigurationManager(self.config_file)
        self.orchestrator = SetupOrchestrator(self.ui, self.data_provider, self.config_manager)
        self.summary_generator = InstallationSummaryGenerator(self.data_provider)
    
    def setup(self):
        """Set up interactive setup wizard"""
        self.package_root.mkdir(parents=True, exist_ok=True)
    
    # Delegate main operations to orchestrator
    def show_welcome_message(self) -> Dict:
        """Display welcome message for the setup wizard"""
        return self.orchestrator._show_welcome_message()
    
    def run_interactive_setup(self) -> Dict:
        """Run the complete interactive setup process"""
        return self.orchestrator.run_interactive_setup()
    
    # Delegate data access to data provider
    def get_installation_type_options(self) -> List[Dict]:
        """Get available installation type options"""
        return [
            {
                'id': inst_type.id,
                'name': inst_type.name,
                'description': inst_type.description,
                'commands': inst_type.commands
            }
            for inst_type in self.data_provider.installation_types
        ]
    
    def get_command_set_categories(self) -> Dict:
        """Get available command set categories"""
        return self.data_provider.command_categories
    
    def get_available_security_hooks(self) -> List[Dict]:
        """Get available security hooks"""
        return [
            {
                'id': hook.id,
                'name': hook.name,
                'description': hook.description,
                'file': hook.file
            }
            for hook in self.data_provider.security_hooks
        ]
    
    def get_configuration_templates(self) -> List[Dict]:
        """Get available configuration templates"""
        return [
            {
                'id': template.id,
                'name': template.name,
                'description': template.description,
                'file': template.file
            }
            for template in self.data_provider.configuration_templates
        ]
    
    def get_preset_configurations(self) -> Dict:
        """Get available preset configurations"""
        return self.data_provider.preset_configurations
    
    # Delegate individual prompts to step handlers
    def prompt_installation_type(self) -> Dict:
        """Prompt user to select installation type"""
        return self.orchestrator.step_handlers[SetupStep.INSTALLATION_TYPE].execute()
    
    def prompt_command_sets(self) -> Dict:
        """Prompt user to select command sets"""
        return self.orchestrator.step_handlers[SetupStep.COMMAND_SETS].execute()
    
    def prompt_security_hooks(self) -> Dict:
        """Prompt user for security hooks configuration"""
        return self.orchestrator.step_handlers[SetupStep.SECURITY_HOOKS].execute()
    
    def prompt_configuration_template(self) -> Dict:
        """Prompt user to select configuration template"""
        return self.orchestrator.step_handlers[SetupStep.CONFIGURATION_TEMPLATE].execute()
    
    # Delegate configuration management
    def save_configuration(self, config: Dict) -> Dict:
        """Save configuration to file"""
        return self.config_manager.save_configuration(config)
    
    def load_existing_configuration(self) -> Dict:
        """Load existing configuration if available"""
        return self.config_manager.load_configuration()
    
    # Delegate summary generation
    def generate_installation_summary(self, config: Dict) -> Dict:
        """Generate installation summary"""
        return self.summary_generator.generate_summary(config)
    
    # Simplified implementations for compatibility
    def run_non_interactive_setup(self) -> Dict:
        """Run setup with default configuration"""
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
                'hook_configuration': [self.data_provider.security_hooks[0]]
            },
            'configuration_template': {
                'template_type': 'basic',
                'template_name': 'basic',
                'template_description': 'Basic Claude Code configuration'
            }
        }
        
        save_result = self.save_configuration(default_config)
        
        return {
            'setup_completed': True,
            'installation_type': default_config['installation_type']['installation_type'],
            'command_sets': default_config['command_sets']['selected_command_sets'],
            'non_interactive': True,
            'config_saved': save_result['saved']
        }
    
    def apply_preset(self, preset_name: str) -> Dict:
        """Apply a preset configuration"""
        if preset_name in self.data_provider.preset_configurations:
            preset = self.data_provider.preset_configurations[preset_name]
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
            test_file = self.package_root / '.test_write'
            test_file.write_text('test')
            test_file.unlink()
            
            return {
                'environment_valid': True,
                'message': 'Environment validation passed',
                'can_proceed': True
            }
        except Exception as e:
            return {
                'environment_valid': False,
                'message': f'Environment validation failed: {str(e)}',
                'can_proceed': False
            }
    
    def handle_setup_error(self, error: Exception) -> Dict:
        """Handle setup errors gracefully"""
        return {
            'error_handled': True,
            'error_message': str(error),
            'recovery_steps': [
                "Check write permissions to installation directory",
                "Ensure sufficient disk space",
                "Verify network connection",
                "Try running setup again",
                "Contact support if problem persists"
            ],
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
                'options': list(self.data_provider.command_categories.keys())
            },
            'security_hooks': {
                'type': 'boolean',
                'required': False,
                'default': True
            },
            'configuration_template': {
                'type': 'string',
                'required': True,
                'options': [t.name for t in self.data_provider.configuration_templates]
            }
        }
    
    def run_batch_setup(self, batch_config_file: str) -> Dict:
        """Run setup in batch mode using configuration file"""
        try:
            with open(batch_config_file, 'r') as f:
                batch_config = json.load(f)
            
            save_result = self.save_configuration(batch_config)
            
            return {
                'batch_completed': True,
                'applied_configuration': batch_config,
                'timestamp': time.time(),
                'config_saved': save_result['saved']
            }
        except Exception as e:
            return {
                'batch_completed': False,
                'error': str(e),
                'recovery_steps': ['Check batch configuration file format', 'Verify file permissions']
            }
    
    def _validate_environment(self) -> Dict:
        """Internal method to validate environment"""
        return {'valid': True, 'message': 'Environment validation passed'}