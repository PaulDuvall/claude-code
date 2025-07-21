# Claude Code Configuration Library

This directory contains modular components for the Claude Code configuration script, breaking down the functionality into maintainable, testable modules.

## Module Structure

### `utils.sh`
**Core utilities and common functions**
- Logging functions (`log`, `error`)
- User interaction (`confirm`)
- File operations (`backup_file`, `backup_directory`, `show_diff`)
- Configuration management (`apply_change`)
- Global variable management

### `os-detection.sh`
**Operating system and environment detection**
- OS detection and validation (`detect_os`, `validate_os`)
- IDE detection and mapping (`detect_ide`)
- Shell configuration detection (`detect_shell_config`)
- Environment setup orchestration (`detect_environment`)

### `auth.sh`
**Authentication method detection and setup**
- Authentication method detection (web vs API key)
- API key helper script creation and configuration
- Conditional authentication setup based on environment variables

### `config.sh`
**Claude Code configuration management**
- Claude configuration file generation (`.claude.json`)
- Trust settings configuration
- Permissions and tool configuration
- Advanced settings (parallel tasks, etc.)
- Directory creation and permissions

### `ide.sh`
**IDE extension installation**
- Multi-IDE support (Windsurf, VSCode, Cursor)
- Extension package download and installation
- Cross-platform temp directory handling
- IDE-specific command line tool detection

### `mcp.sh`
**MCP (Model Context Protocol) server setup**
- Docker availability detection
- MCP Puppeteer server configuration
- Server registration with Claude Code

### `validation.sh`
**System validation and final reporting**
- Claude Code installation validation
- Configuration file validation
- Environment variable guidance
- Backup information display
- Security reminders and final summary

## Dependencies

Each module sources the required dependencies:
- All modules depend on `utils.sh` for common functions
- Modules are designed to be independent of each other where possible
- Global variables are managed in `utils.sh`

## Usage

The main script (`configure-claude-code.sh`) orchestrates these modules:

```bash
source "$SCRIPT_DIR/lib/utils.sh"
source "$SCRIPT_DIR/lib/os-detection.sh"
source "$SCRIPT_DIR/lib/auth.sh"
source "$SCRIPT_DIR/lib/config.sh"
source "$SCRIPT_DIR/lib/ide.sh"
source "$SCRIPT_DIR/lib/mcp.sh"
source "$SCRIPT_DIR/lib/validation.sh"
```

## Benefits of Modular Design

1. **Maintainability**: Each module has a single responsibility
2. **Testability**: Individual components can be tested in isolation
3. **Reusability**: Modules can be used by other scripts
4. **Readability**: Clear separation of concerns
5. **Debugging**: Easier to isolate and fix issues

## Adding New Modules

When adding new functionality:

1. Create a new `.sh` file in this directory
2. Follow the existing naming and structure patterns
3. Add appropriate documentation headers
4. Source the new module in the main script
5. Update this README with the new module description