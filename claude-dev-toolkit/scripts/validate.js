#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Claude Custom Commands package...');

let errors = 0;
let warnings = 0;

const log = (level, message) => {
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
    console.log(`${prefix} ${message}`);
    if (level === 'error') errors++;
    if (level === 'warn') warnings++;
};

try {
    const packageDir = __dirname.replace('/scripts', '');
    
    // Check required directories
    const requiredDirs = ['bin', 'lib', 'commands', 'commands/active', 'commands/experiments'];
    requiredDirs.forEach(dir => {
        const dirPath = path.join(packageDir, dir);
        if (fs.existsSync(dirPath)) {
            log('info', `Directory exists: ${dir}/`);
        } else {
            log('error', `Missing required directory: ${dir}/`);
        }
    });
    
    // Check required files
    const requiredFiles = [
        'package.json',
        'README.md',
        'bin/claude-commands',
        'lib/config.js',
        'lib/installer.js',
        'lib/utils.js'
    ];
    
    requiredFiles.forEach(file => {
        const filePath = path.join(packageDir, file);
        if (fs.existsSync(filePath)) {
            log('info', `File exists: ${file}`);
        } else {
            log('error', `Missing required file: ${file}`);
        }
    });
    
    // Check bin file permissions
    const binFile = path.join(packageDir, 'bin/claude-commands');
    if (fs.existsSync(binFile)) {
        const stats = fs.statSync(binFile);
        const mode = (stats.mode & parseInt('777', 8)).toString(8);
        if (mode.includes('7') || mode.includes('5')) {
            log('info', `Binary is executable (${mode})`);
        } else {
            log('warn', `Binary may not be executable (${mode})`);
        }
    }
    
    // Count commands
    const activeDir = path.join(packageDir, 'commands/active');
    const experimentalDir = path.join(packageDir, 'commands/experiments');
    
    if (fs.existsSync(activeDir)) {
        const activeCount = fs.readdirSync(activeDir).filter(f => f.endsWith('.md')).length;
        log('info', `Found ${activeCount} active commands`);
    }
    
    if (fs.existsSync(experimentalDir)) {
        const expCount = fs.readdirSync(experimentalDir).filter(f => f.endsWith('.md')).length;
        log('info', `Found ${expCount} experimental commands`);
    }
    
    console.log('');
    console.log(`📊 Validation Summary:`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Warnings: ${warnings}`);
    
    if (errors > 0) {
        console.log('');
        console.log('❌ Package validation failed');
        process.exit(1);
    } else {
        console.log('');
        console.log('✅ Package validation passed');
    }
    
} catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
}