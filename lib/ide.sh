#!/usr/bin/env bash
# IDE extension installation for Claude Code

##################################
# IDE Installation Instructions
##################################
show_ide_instructions() {
    local ide="$1"
    local cmd="$2"
    
    echo "$ide command '$cmd' not found."
    echo "Please ensure $ide is installed and the command-line tool is available."
    
    case "$ide" in
        vscode)
            echo "Install VSCode command line tools: View > Command Palette > 'Shell Command: Install code command in PATH'"
            ;;
        cursor)
            echo "Install Cursor command line tools from the application menu"
            ;;
        windsurf)
            echo "Install Windsurf command line tools from within the IDE"
            ;;
    esac
    echo "Skipping extension installation..."
}

##################################
# Create Temp Directory
##################################
create_temp_directory() {
    local tempdir
    if [[ "$TARGET_OS" == "macos" ]]; then
        tempdir=$(mktemp -d -t claude-install)
    else
        tempdir=$(mktemp -d --tmpdir claude-install.XXXXXX)
    fi
    echo "$tempdir"
}

##################################
# Download and Extract Package
##################################
download_claude_package() {
    local tempdir="$1"
    
    echo "Downloading Claude Code package..."
    if ! npm pack @anthropic-ai/claude-code; then
        error "Failed to download Claude Code package"
        return 1
    fi
    
    if ! tar -xzf anthropic-ai-claude-code-*.tgz; then
        error "Failed to extract Claude Code package"
        return 1
    fi
    
    return 0
}

##################################
# Install IDE Extension
##################################
install_ide_extension() {
    local ide_cmd="$1"
    local ide_name="$2"
    local tempdir="$3"
    
    echo "Installing Claude Code extension for $ide_name..."
    if ! "$ide_cmd" --install-extension package/vendor/claude-code.vsix; then
        error "Failed to install Claude Code extension for $ide_name"
        echo "You may need to install it manually later"
        echo "Extension file: $tempdir/package/vendor/claude-code.vsix"
        return 1
    else
        echo "✓ Extension installed successfully for $ide_name"
        echo "  You may need to reload/restart $ide_name for the extension to take effect"
        return 0
    fi
}

##################################
# Main IDE Extension Installation
##################################
setup_ide_extension() {
    if [[ "$TARGET_IDE" == "none" ]] || [[ -z "$IDE_CMD" ]]; then
        log "Skipping IDE extension installation (TARGET_IDE=$TARGET_IDE)"
        return
    fi

    # Check if IDE command exists
    if ! command -v "$IDE_CMD" &> /dev/null; then
        show_ide_instructions "$TARGET_IDE" "$IDE_CMD"
        return
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would install Claude Code extension for $TARGET_IDE"
        return
    fi

    # Create temp directory and download package
    local tempdir
    tempdir=$(create_temp_directory)
    local original_dir=$(pwd)
    
    cd "$tempdir" || {
        error "Failed to change to temp directory"
        return 1
    }

    # Download and extract
    if ! download_claude_package "$tempdir"; then
        cd "$original_dir" || true
        rm -rf "$tempdir"
        return 1
    fi
    
    # Install extension
    if install_ide_extension "$IDE_CMD" "$TARGET_IDE" "$tempdir"; then
        echo "IDE extension installation completed successfully"
    fi
    
    # Cleanup
    cd "$original_dir" || true
    rm -rf "$tempdir"
}