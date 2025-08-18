// Utility functions for Claude Dev Toolkit
const path = require('path');
const fs = require('fs');

module.exports = {
    ensureDirectory: (dirPath) => {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    },
    
    isValidCommand: (commandName) => {
        return /^[a-z][a-z0-9-]*$/.test(commandName);
    }
};
