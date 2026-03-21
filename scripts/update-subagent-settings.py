#!/usr/bin/env python3
"""Update Claude Code settings.json with subagent configurations.

Reads configuration from environment variables:
  SETTINGS_FILE: Path to settings.json
  SUBAGENTS_DIR: Path to subagents directory
  SUBAGENTS_DEPLOYED: Comma-separated list of deployed subagent names
"""

import json
import os
import sys
import traceback


def read_env_config():
    """Read and validate required environment variables."""
    settings_file = os.environ.get('SETTINGS_FILE')
    subagents_dir = os.environ.get('SUBAGENTS_DIR')
    deployed_str = os.environ.get('SUBAGENTS_DEPLOYED', '')

    if not all([settings_file, subagents_dir, deployed_str]):
        print('Error: Missing required environment variables', file=sys.stderr)
        sys.exit(1)

    deployed = [s.strip() for s in deployed_str.split(',') if s.strip()]
    return settings_file, subagents_dir, deployed


def load_settings(settings_file):
    """Load existing settings.json or return empty dict."""
    if not os.path.exists(settings_file):
        return {}

    with open(settings_file, 'r') as f:
        return json.load(f)


def build_debug_specialist_config(subagents_dir):
    """Build the debug-specialist subagent configuration."""
    return {
        'name': 'Debug Specialist',
        'description': (
            'Expert debugging assistant with persistent context '
            'and systematic troubleshooting'
        ),
        'config_file': f'{subagents_dir}/debug-specialist.md',
        'context_file': f'{subagents_dir}/debug-context.md',
        'auto_invoke_patterns': [
            'debug', 'error', 'exception', 'troubleshoot',
            'issue', 'bug', 'ModuleNotFoundError', 'ImportError',
            'SyntaxError', 'TypeError', 'AttributeError',
            'ValueError', 'RuntimeError',
        ],
        'tools': ['Read', 'Bash', 'Grep', 'Edit', 'Glob'],
        'priority': 'high',
    }


def main():
    """Update settings.json with deployed subagent configurations."""
    try:
        settings_file, subagents_dir, subagents_deployed = read_env_config()
        settings = load_settings(settings_file)
        settings.setdefault('sub_agents', {})

        for subagent in subagents_deployed:
            if subagent == 'debug-specialist':
                settings['sub_agents']['debug-specialist'] = \
                    build_debug_specialist_config(subagents_dir)

        with open(settings_file, 'w') as f:
            json.dump(settings, f, indent=2)

        print('Settings updated successfully')
    except Exception as e:
        print(f'Unexpected error: {e}', file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
