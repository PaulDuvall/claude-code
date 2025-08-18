// Configuration management for Claude Dev Toolkit
const path = require('path');
const os = require('os');

module.exports = {
    getConfigPath: () => {
        return path.join(os.homedir(), '.claude', 'commands');
    },
    
    defaultConfig: {
        commandsPath: './commands',
        hooksEnabled: true,
        colorOutput: true
    }
};
