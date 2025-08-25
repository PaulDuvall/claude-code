/**
 * File System Utilities
 * Extracted common file system operations used across commands
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class FileSystemUtils {
    /**
     * Format file size for human-readable display
     */
    static formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    /**
     * Calculate directory size recursively
     */
    static getDirectorySize(dirPath) {
        let size = 0;
        
        try {
            const entries = fs.readdirSync(dirPath);
            entries.forEach(entry => {
                const fullPath = path.join(dirPath, entry);
                const stats = fs.statSync(fullPath);
                
                if (stats.isDirectory()) {
                    size += this.getDirectorySize(fullPath);
                } else {
                    size += stats.size;
                }
            });
        } catch (error) {
            // Ignore errors and return partial size
        }
        
        return size;
    }

    /**
     * Ensure directory exists with proper permissions
     */
    static ensureDirectory(dirPath, mode = 0o755) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true, mode });
        }
    }

    /**
     * Copy file with error handling
     */
    static copyFile(source, destination, mode = 0o644) {
        try {
            fs.copyFileSync(source, destination);
            fs.chmodSync(destination, mode);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if path exists and is readable
     */
    static isReadable(filePath) {
        try {
            fs.accessSync(filePath, fs.constants.R_OK);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if path exists and is writable
     */
    static isWritable(filePath) {
        try {
            fs.accessSync(filePath, fs.constants.W_OK);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get file stats safely
     */
    static getStats(filePath) {
        try {
            return fs.statSync(filePath);
        } catch (error) {
            return null;
        }
    }

    /**
     * Read file safely with encoding
     */
    static readFile(filePath, encoding = 'utf8') {
        try {
            return fs.readFileSync(filePath, encoding);
        } catch (error) {
            return null;
        }
    }

    /**
     * Write file safely with mode
     */
    static writeFile(filePath, content, mode = 0o644) {
        try {
            fs.writeFileSync(filePath, content, { mode });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Remove file or directory safely
     */
    static remove(targetPath) {
        try {
            if (fs.existsSync(targetPath)) {
                const stats = fs.statSync(targetPath);
                if (stats.isDirectory()) {
                    fs.rmSync(targetPath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(targetPath);
                }
            }
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = FileSystemUtils;