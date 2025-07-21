#!/usr/bin/env bash
# OS and environment detection for Claude Code configuration

##################################
# Global Variables
##################################
TARGET_OS=""
TARGET_IDE=""
SHELL_CONFIG=""
IDE_CMD=""

##################################
# OS Detection
##################################
detect_os() {
    if [[ "$TARGET_OS" == "auto" ]] || [[ -z "$TARGET_OS" ]]; then
        case "$OSTYPE" in
            darwin*)
                TARGET_OS="macos"
                ;;
            linux*)
                TARGET_OS="linux"
                ;;
            *)
                TARGET_OS="unknown"
                ;;
        esac
    fi
    
    log "Detected/specified OS: $TARGET_OS"
}

validate_os() {
    case "$TARGET_OS" in
        macos|linux)
            log "✓ OS $TARGET_OS is supported"
            ;;
        unknown)
            echo "Warning: Unknown OS detected ($OSTYPE)"
            echo "This script is tested on macOS and Linux"
            if ! confirm "Continue anyway?"; then
                exit 1
            fi
            ;;
        *)
            echo "Unsupported OS: $TARGET_OS"
            echo "Supported values: macos, linux, auto"
            exit 1
            ;;
    esac
}

##################################
# IDE Detection
##################################
detect_ide() {
    if [[ -z "$TARGET_IDE" ]]; then
        TARGET_IDE="windsurf"  # Default
    fi
    
    case "$TARGET_IDE" in
        windsurf)
            IDE_CMD="windsurf"
            ;;
        vscode)
            IDE_CMD="code"
            ;;
        cursor)
            IDE_CMD="cursor"
            ;;
        none)
            IDE_CMD=""
            ;;
        *)
            echo "Unknown IDE: $TARGET_IDE"
            echo "Supported IDEs: windsurf, vscode, cursor, none"
            exit 1
            ;;
    esac
    
    log "Target IDE: $TARGET_IDE"
}

##################################
# Shell Configuration Detection
##################################
detect_shell_config() {
    if [[ "$SHELL_CONFIG" == "auto" ]] || [[ -z "$SHELL_CONFIG" ]]; then
        case "$SHELL" in
            */zsh)
                SHELL_CONFIG="~/.zshrc"
                ;;
            */bash)
                if [[ "$TARGET_OS" == "macos" ]]; then
                    SHELL_CONFIG="~/.bash_profile"
                else
                    SHELL_CONFIG="~/.bashrc"
                fi
                ;;
            */fish)
                SHELL_CONFIG="~/.config/fish/config.fish"
                ;;
            *)
                SHELL_CONFIG="~/.profile"
                ;;
        esac
    fi
    
    log "Shell configuration file: $SHELL_CONFIG"
}

##################################
# Complete Environment Detection
##################################
detect_environment() {
    detect_os
    detect_ide
    detect_shell_config
    validate_os
}