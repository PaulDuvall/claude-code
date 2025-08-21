/**
 * Subagent Output Formatter
 * Handles all console output formatting for subagent operations
 * Separates display logic from business logic
 */

/**
 * Emoji and message constants for consistent formatting
 */
const DISPLAY_CONSTANTS = {
    EMOJIS: {
        ROBOT: '🤖',
        SUCCESS: '✅',
        ERROR: '❌',
        FOLDER: '📁',
        ROCKET: '🚀',
        PARTY: '🎉',
        CHART: '📊'
    },
    MESSAGES: {
        NO_SUBAGENTS: 'No subagents directory found in package or no subagent files available',
        NO_SUBAGENTS_INSTALL: 'No subagents directory found in package or no subagent files to install',
        INSTALL_FAILED: 'Failed to install',
        INSTALL_SUCCESS: 'Successfully installed',
        CREATE_DIR_FAILED: 'Failed to create directory'
    }
};

/**
 * Formatter for subagent listing operations
 */
class SubagentListFormatter {
    /**
     * Format the header for subagent listing
     */
    static formatHeader() {
        return `${DISPLAY_CONSTANTS.EMOJIS.ROBOT} Available Subagents:\n`;
    }

    /**
     * Format the no subagents found message
     */
    static formatNoSubagents() {
        return `${DISPLAY_CONSTANTS.EMOJIS.ERROR} ${DISPLAY_CONSTANTS.MESSAGES.NO_SUBAGENTS}`;
    }

    /**
     * Format a single subagent item
     * @param {string} name - Subagent name
     * @param {number} index - Index in the list
     */
    static formatSubagentItem(name, index) {
        return `  ${index + 1}. ${name}`;
    }

    /**
     * Format the summary footer
     * @param {number} count - Number of subagents
     */
    static formatSummary(count) {
        return `\n${DISPLAY_CONSTANTS.EMOJIS.CHART} ${count} subagents available`;
    }

    /**
     * Format complete subagent list
     * @param {string[]} subagents - Array of subagent names
     */
    static formatList(subagents) {
        if (subagents.length === 0) {
            return [
                this.formatHeader(),
                this.formatNoSubagents()
            ];
        }

        const lines = [this.formatHeader()];
        
        subagents.forEach((name, index) => {
            lines.push(this.formatSubagentItem(name, index));
        });
        
        lines.push(this.formatSummary(subagents.length));
        
        return lines;
    }
}

/**
 * Formatter for subagent installation operations
 */
class SubagentInstallFormatter {
    /**
     * Format installation header
     */
    static formatHeader() {
        return `${DISPLAY_CONSTANTS.EMOJIS.ROCKET} Installing AI Subagents...\n`;
    }

    /**
     * Format no subagents to install message
     */
    static formatNoSubagents() {
        return `${DISPLAY_CONSTANTS.EMOJIS.ERROR} ${DISPLAY_CONSTANTS.MESSAGES.NO_SUBAGENTS_INSTALL}`;
    }

    /**
     * Format directory creation message
     * @param {string} path - Directory path that was created
     */
    static formatDirectoryCreated(path) {
        return `${DISPLAY_CONSTANTS.EMOJIS.FOLDER} Created directory: ${path}`;
    }

    /**
     * Format successful installation of a single file
     * @param {string} filename - Name of the installed file
     */
    static formatInstallSuccess(filename) {
        return `  ${DISPLAY_CONSTANTS.EMOJIS.SUCCESS} ${filename}`;
    }

    /**
     * Format failed installation of a single file
     * @param {string} filename - Name of the file that failed to install
     * @param {string} error - Error message
     */
    static formatInstallError(filename, error) {
        return `  ${DISPLAY_CONSTANTS.EMOJIS.ERROR} ${DISPLAY_CONSTANTS.MESSAGES.INSTALL_FAILED} ${filename}: ${error}`;
    }

    /**
     * Format installation summary
     * @param {Object} summary - Installation summary object
     * @param {number} summary.installed - Number of successfully installed files
     * @param {number} summary.failed - Number of failed installations
     * @param {string} summary.path - Installation path
     */
    static formatSummary(summary) {
        const lines = [
            `\n${DISPLAY_CONSTANTS.EMOJIS.PARTY} Installation Summary:`,
            `  ${DISPLAY_CONSTANTS.MESSAGES.INSTALL_SUCCESS}: ${summary.installed} subagents`
        ];

        if (summary.failed > 0) {
            lines.push(`  ${DISPLAY_CONSTANTS.MESSAGES.INSTALL_FAILED}: ${summary.failed} subagents`);
        }

        lines.push(`  Installation path: ${summary.path}`);

        return lines;
    }

    /**
     * Format directory creation error
     * @param {string} error - Error message
     */
    static formatDirectoryError(error) {
        return `${DISPLAY_CONSTANTS.EMOJIS.ERROR} ${DISPLAY_CONSTANTS.MESSAGES.CREATE_DIR_FAILED}: ${error}`;
    }
}

/**
 * Formatter for help text
 */
class SubagentHelpFormatter {
    /**
     * Format complete help text
     * @param {number} subagentCount - Number of available subagents
     */
    static formatHelp(subagentCount) {
        return [
            `${DISPLAY_CONSTANTS.EMOJIS.ROBOT} Claude Commands - Subagents Management\n`,
            'Usage:',
            '  claude-commands subagents [options]\n',
            'Options:',
            '  -l, --list     List available AI subagents from package',
            '  -i, --install  Install all subagents to Claude Code (~/.claude/subagents/)',
            '  -h, --help     Show this help message\n',
            'Examples:',
            '  claude-commands subagents --list     # Show available subagents',
            '  claude-commands subagents --install  # Install all subagents',
            '  claude-commands subagents --help     # Show this help\n',
            'Description:',
            '  Manage AI subagents for Claude Code. Subagents are specialized AI',
            '  assistants that help with specific development tasks like security',
            '  auditing, code review, documentation, and more.\n',
            `Package Status: ${subagentCount} subagents available`
        ];
    }
}

/**
 * Main formatter class that orchestrates all formatting operations
 */
class SubagentFormatter {
    /**
     * Display formatted subagent list
     * @param {string[]} subagents - Array of subagent names
     */
    static displayList(subagents) {
        const lines = SubagentListFormatter.formatList(subagents);
        console.log(lines.join('\n'));
    }

    /**
     * Display installation progress and results
     * @param {Object} params - Installation parameters
     * @param {string[]} params.subagents - Subagents to install
     * @param {function} params.onProgress - Progress callback (filename, success, error)
     * @param {function} params.onDirectoryCreated - Directory creation callback (path)
     * @param {Object} params.summary - Final summary
     */
    static displayInstallation({ subagents, onProgress, onDirectoryCreated, summary }) {
        console.log(SubagentInstallFormatter.formatHeader());

        if (subagents.length === 0) {
            console.log(SubagentInstallFormatter.formatNoSubagents());
            return;
        }

        // Directory creation feedback
        if (onDirectoryCreated) {
            onDirectoryCreated((path) => {
                console.log(SubagentInstallFormatter.formatDirectoryCreated(path));
            });
        }

        // Progress feedback
        if (onProgress) {
            onProgress((filename, success, error) => {
                if (success) {
                    console.log(SubagentInstallFormatter.formatInstallSuccess(filename));
                } else {
                    console.log(SubagentInstallFormatter.formatInstallError(filename, error));
                }
            });
        }

        // Final summary
        if (summary) {
            const summaryLines = SubagentInstallFormatter.formatSummary(summary);
            console.log(summaryLines.join('\n'));
        }
    }

    /**
     * Display help text
     * @param {number} subagentCount - Number of available subagents
     */
    static displayHelp(subagentCount) {
        const helpLines = SubagentHelpFormatter.formatHelp(subagentCount);
        console.log(helpLines.join('\n'));
    }

    /**
     * Display error message
     * @param {string} error - Error message
     */
    static displayError(error) {
        console.error(`${DISPLAY_CONSTANTS.EMOJIS.ERROR} ${error}`);
    }

    /**
     * Display directory creation error
     * @param {string} error - Error message
     */
    static displayDirectoryError(error) {
        console.error(SubagentInstallFormatter.formatDirectoryError(error));
    }
}

module.exports = {
    SubagentFormatter,
    SubagentListFormatter,
    SubagentInstallFormatter,
    SubagentHelpFormatter,
    DISPLAY_CONSTANTS
};