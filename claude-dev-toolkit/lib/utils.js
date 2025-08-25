// Utility functions for Claude Dev Toolkit
const path = require('path');
const fs = require('fs');
const FileSystemUtils = require('./utils/file-system-utils');

module.exports = {
    // Keep backward compatibility
    ensureDirectory: (dirPath) => {
        FileSystemUtils.ensureDirectory(dirPath);
    },
    
    isValidCommand: (commandName) => {
        return /^[a-z][a-z0-9-]*$/.test(commandName);
    },

    // Export new utilities for migration
    FileSystemUtils,
    ClaudePathConfig: require('./utils/claude-path-config')
};
