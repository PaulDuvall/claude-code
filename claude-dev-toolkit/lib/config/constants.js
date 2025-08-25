/**
 * Configuration Constants
 * Centralized configuration constants used throughout the application
 */

// System Requirements
const SYSTEM_REQUIREMENTS = {
    MIN_NODE_VERSION: '16.0.0',
    MIN_NPM_VERSION: '7.0.0',
    MIN_MEMORY_GB: 2,
    MIN_DISK_SPACE_MB: 100,
    SUPPORTED_PLATFORMS: ['linux', 'darwin', 'win32'],
    SUPPORTED_ARCHITECTURES: ['x64', 'arm64']
};

// Download Links for Dependencies
const DOWNLOAD_LINKS = {
    git: {
        linux: 'https://git-scm.com/download/linux',
        darwin: 'https://git-scm.com/download/mac',
        win32: 'https://git-scm.com/download/win',
        all: 'https://git-scm.com/downloads'
    },
    node: {
        all: 'https://nodejs.org/en/download/',
        lts: 'https://nodejs.org/en/download/package-manager/',
        docker: 'https://hub.docker.com/_/node'
    },
    python: {
        all: 'https://www.python.org/downloads/',
        anaconda: 'https://www.anaconda.com/products/distribution',
        pyenv: 'https://github.com/pyenv/pyenv'
    },
    docker: {
        linux: 'https://docs.docker.com/engine/install/',
        darwin: 'https://docs.docker.com/desktop/install/mac-install/',
        win32: 'https://docs.docker.com/desktop/install/windows-install/'
    },
    claudeCode: {
        npm: 'https://www.npmjs.com/package/@anthropic-ai/claude-code',
        github: 'https://github.com/anthropics/claude-code'
    }
};

// Package Manager Commands
const PACKAGE_MANAGERS = {
    npm: {
        name: 'npm',
        install: 'npm install',
        globalInstall: 'npm install -g',
        update: 'npm update',
        checkCommand: 'npm --version',
        installUrl: 'https://docs.npmjs.com/downloading-and-installing-node-js-and-npm'
    },
    yarn: {
        name: 'yarn',
        install: 'yarn add',
        globalInstall: 'yarn global add',
        update: 'yarn upgrade',
        checkCommand: 'yarn --version',
        installUrl: 'https://classic.yarnpkg.com/lang/en/docs/install/'
    },
    pnpm: {
        name: 'pnpm',
        install: 'pnpm add',
        globalInstall: 'pnpm add -g',
        update: 'pnpm update',
        checkCommand: 'pnpm --version',
        installUrl: 'https://pnpm.io/installation'
    },
    brew: {
        name: 'Homebrew',
        install: 'brew install',
        update: 'brew upgrade',
        checkCommand: 'brew --version',
        installUrl: 'https://brew.sh/',
        platforms: ['darwin']
    },
    apt: {
        name: 'apt',
        install: 'sudo apt install',
        update: 'sudo apt update && sudo apt upgrade',
        checkCommand: 'apt --version',
        platforms: ['linux']
    },
    yum: {
        name: 'yum',
        install: 'sudo yum install',
        update: 'sudo yum update',
        checkCommand: 'yum --version',
        platforms: ['linux']
    },
    chocolatey: {
        name: 'Chocolatey',
        install: 'choco install',
        update: 'choco upgrade',
        checkCommand: 'choco --version',
        installUrl: 'https://chocolatey.org/install',
        platforms: ['win32']
    },
    winget: {
        name: 'winget',
        install: 'winget install',
        update: 'winget upgrade',
        checkCommand: 'winget --version',
        platforms: ['win32']
    }
};

// File and Directory Constants
const PATHS = {
    CLAUDE_DIR: '.claude',
    COMMANDS_DIR: 'commands',
    HOOKS_DIR: 'hooks',
    BACKUPS_DIR: 'backups',
    SUBAGENTS_DIR: 'subagents',
    SETTINGS_FILE: 'settings.json',
    LOG_FILE: 'claude-commands.log',
    TEMP_DIR: '.temp',
    ACTIVE_COMMANDS: 'active',
    EXPERIMENTAL_COMMANDS: 'experiments'
};

// Command Configuration
const COMMANDS = {
    MAX_COMMANDS: 100,
    DEFAULT_COMMAND_TYPE: 'active',
    SUPPORTED_EXTENSIONS: ['.md', '.txt'],
    FRONTMATTER_DELIMITER: '---',
    REQUIRED_SECTIONS: ['description', 'usage', 'implementation'],
    MAX_FILE_SIZE_MB: 5,
    ENCODING: 'utf8'
};

// Backup Configuration  
const BACKUP = {
    MAX_BACKUPS: 10,
    COMPRESSION_ENABLED: true,
    COMPRESSION_LEVEL: 6,
    RETENTION_DAYS: 30,
    AUTO_CLEANUP: true,
    BACKUP_FORMAT: 'tar.gz',
    NAMING_PATTERN: 'backup-YYYYMMDD-HHMMSS'
};

// Installation Configuration
const INSTALLATION = {
    MAX_CONCURRENT_OPERATIONS: 5,
    TIMEOUT_MS: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
    PROGRESS_UPDATE_INTERVAL: 500,
    VALIDATION_ENABLED: true,
    AUTO_BACKUP: false,
    FORCE_OVERWRITE: false
};

// Logging Configuration
const LOGGING = {
    DEFAULT_LEVEL: 'info',
    LEVELS: ['debug', 'info', 'warn', 'error'],
    MAX_LOG_SIZE_MB: 10,
    MAX_LOG_FILES: 5,
    TIMESTAMP_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    ENABLE_COLORS: true,
    ENABLE_CONTEXT: true
};

// Security Configuration
const SECURITY = {
    ALLOWED_PROTOCOLS: ['http:', 'https:', 'file:'],
    MAX_DOWNLOAD_SIZE_MB: 50,
    ALLOWED_FILE_TYPES: ['.md', '.txt', '.json', '.js', '.sh', '.py'],
    DANGEROUS_COMMANDS: ['rm -rf', 'format', 'del /f', 'sudo rm'],
    CREDENTIAL_PATTERNS: [
        /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
        /secret[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
        /password\s*[:=]\s*['"][^'"]+['"]/i,
        /token\s*[:=]\s*['"][^'"]+['"]/i
    ],
    HOOK_TIMEOUT_MS: 5000
};

// Error Messages
const ERROR_MESSAGES = {
    INSTALLATION_FAILED: 'Installation failed. Please check your setup and try again.',
    PERMISSION_DENIED: 'Permission denied. Please check file permissions and try again.',
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    FILE_NOT_FOUND: 'Required file not found. Please ensure all dependencies are installed.',
    INVALID_CONFIGURATION: 'Invalid configuration. Please check your settings.',
    COMMAND_NOT_FOUND: 'Command not found. Please install required dependencies.',
    VALIDATION_FAILED: 'Validation failed. Please check the input and try again.',
    BACKUP_FAILED: 'Backup operation failed. Please check disk space and permissions.',
    RESTORE_FAILED: 'Restore operation failed. Please check backup integrity.',
    DEPENDENCY_MISSING: 'Required dependency is missing. Please install and try again.'
};

// Success Messages
const SUCCESS_MESSAGES = {
    INSTALLATION_COMPLETE: 'Installation completed successfully!',
    BACKUP_CREATED: 'Backup created successfully.',
    RESTORE_COMPLETE: 'Restore completed successfully.',
    CONFIGURATION_UPDATED: 'Configuration updated successfully.',
    VALIDATION_PASSED: 'All validations passed.',
    CLEANUP_COMPLETE: 'Cleanup completed successfully.'
};

// CLI Configuration
const CLI = {
    PROGRAM_NAME: 'claude-commands',
    VERSION: '1.0.0',
    DESCRIPTION: 'Claude Code Custom Commands CLI',
    DEFAULT_COMMAND: 'help',
    EXIT_CODES: {
        SUCCESS: 0,
        GENERAL_ERROR: 1,
        INVALID_USAGE: 2,
        PERMISSION_DENIED: 3,
        NOT_FOUND: 4,
        NETWORK_ERROR: 5,
        VALIDATION_ERROR: 6
    }
};

// Export all constants
module.exports = {
    SYSTEM_REQUIREMENTS,
    DOWNLOAD_LINKS,
    PACKAGE_MANAGERS,
    PATHS,
    COMMANDS,
    BACKUP,
    INSTALLATION,
    LOGGING,
    SECURITY,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    CLI
};

// Export individual constants for convenience
module.exports.constants = {
    SYSTEM_REQUIREMENTS,
    DOWNLOAD_LINKS,
    PACKAGE_MANAGERS,
    PATHS,
    COMMANDS,
    BACKUP,
    INSTALLATION,
    LOGGING,
    SECURITY,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    CLI
};