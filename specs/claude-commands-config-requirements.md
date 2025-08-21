# Claude Commands Config Feature Requirements

## Document Information
- **Version:** 2.0.0
- **Date:** 2025-08-21
- **Author:** Claude Code Development Team
- **Status:** Draft

## Overview
Simple CLI tool to apply Claude Code configuration templates directly from the NPM package.

## Assumptions
- Configuration templates exist in templates/ directory within the NPM package
- ~/.claude/ directory exists or can be created

## Requirements

### REQ-CONFIG-001: List Templates
**WHEN** the user runs `claude-commands config --list`
**THE SYSTEM SHALL** display available configuration templates from templates/ directory

### REQ-CONFIG-002: Apply Template  
**WHEN** the user runs `claude-commands config --template <name>`
**THE SYSTEM SHALL** backup existing settings.json if present, then copy the specified template to ~/.claude/settings.json

### REQ-CONFIG-003: Show Help
**WHEN** the user runs `claude-commands config --help`
**THE SYSTEM SHALL** display usage information and available options

### REQ-CONFIG-004: Handle Invalid Template
**IF** the specified template doesn't exist, **THEN**
**THE SYSTEM SHALL** display an error message and list available templates

## Implementation Notes
- Copy template files from templates/ directory to ~/.claude/settings.json
- Backup existing settings.json with timestamp: ~/.claude/settings.json.backup.YYYY-MM-DD-HHMMSS
- Simple file operations - no external script dependencies
- Error handling for missing templates or permission issues
- Follow existing claude-commands CLI patterns

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 2.1.0 | 2025-08-21 | Updated REQ-CONFIG-002 to include backup and direct file operations |
| 2.0.0 | 2025-08-21 | Simplified from overengineered v1.0.0 |
| 1.0.0 | 2025-08-21 | Initial specification (overengineered) |