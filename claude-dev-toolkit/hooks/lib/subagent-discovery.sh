#!/usr/bin/env bash

# Subagent Discovery Module for Subagent-Hook Integration
# 
# This module provides functionality to discover, locate, and enumerate
# available subagents across different directory hierarchies.

# Source required modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-constants.sh"
source "$SCRIPT_DIR/file-utils.sh"
source "$SCRIPT_DIR/error-handler.sh"

##################################
# Discovery Functions
##################################

find_subagent() {
    local subagent_name="$1"
    
    if [[ -z "$subagent_name" ]]; then
        log_error "Subagent name is required for discovery"
        return $EXIT_VALIDATION_FAILED
    fi
    
    log_debug "Searching for subagent: $subagent_name"
    
    # Use the file utilities function for path resolution
    local subagent_path
    if subagent_path=$(resolve_subagent_path "$subagent_name"); then
        log_debug "Found subagent at: $subagent_path"
        echo "$subagent_path"
        return $EXIT_SUCCESS
    else
        log_debug "Subagent not found: $subagent_name"
        return $EXIT_SUBAGENT_NOT_FOUND
    fi
}

discover_available_subagents() {
    local search_dir="${1:-$SUBAGENTS_DIR}"
    local subagents=()
    
    log_debug "Discovering subagents in: $search_dir"
    
    if [[ ! -d "$search_dir" ]]; then
        log_debug "Subagents directory does not exist: $search_dir"
        return $EXIT_SUCCESS
    fi
    
    # Find all .md files in the subagents directory
    while IFS= read -r -d '' file; do
        if is_valid_subagent_file "$file"; then
            local name
            name=$(basename "$file" "$SUBAGENT_FILE_EXTENSION")
            subagents+=("$name")
            log_debug "Discovered valid subagent: $name"
        else
            log_debug "Invalid subagent file skipped: $file"
        fi
    done < <(find "$search_dir" -name "*$SUBAGENT_FILE_EXTENSION" -type f -print0 2>/dev/null)
    
    # Sort subagents alphabetically
    IFS=$'\n' subagents=($(sort <<<"${subagents[*]}"))
    unset IFS
    
    log_debug "Discovery complete: ${#subagents[@]} valid subagents found"
    
    # Output results
    printf '%s\n' "${subagents[@]}"
    return $EXIT_SUCCESS
}

get_all_available_subagents() {
    local all_subagents=()
    local user_subagents project_subagents
    
    log_debug "Getting all available subagents from all locations"
    
    # Get user-level subagents
    if user_subagents=$(discover_available_subagents "$SUBAGENTS_DIR" 2>/dev/null); then
        while IFS= read -r subagent; do
            [[ -n "$subagent" ]] && all_subagents+=("$subagent")
        done <<< "$user_subagents"
    fi
    
    # Get project-level subagents (these take priority)
    if [[ -d "$PROJECT_SUBAGENTS_DIR" ]]; then
        if project_subagents=$(discover_available_subagents "$PROJECT_SUBAGENTS_DIR" 2>/dev/null); then
            while IFS= read -r subagent; do
                [[ -n "$subagent" ]] && all_subagents+=("$subagent")
            done <<< "$project_subagents"
        fi
    fi
    
    # Remove duplicates (project-level takes precedence)
    local unique_subagents=()
    local -A seen
    
    for subagent in "${all_subagents[@]}"; do
        if [[ -z "${seen[$subagent]}" ]]; then
            unique_subagents+=("$subagent")
            seen[$subagent]=1
        fi
    done
    
    # Sort results
    IFS=$'\n' unique_subagents=($(sort <<<"${unique_subagents[*]}"))
    unset IFS
    
    log_debug "Total unique subagents available: ${#unique_subagents[@]}"
    
    # Output results
    printf '%s\n' "${unique_subagents[@]}"
    return $EXIT_SUCCESS
}

##################################
# Subagent Information Functions
##################################

get_subagent_info() {
    local subagent_name="$1"
    local info_type="${2:-all}"
    
    if [[ -z "$subagent_name" ]]; then
        log_error "Subagent name is required"
        return $EXIT_VALIDATION_FAILED
    fi
    
    local subagent_path
    if ! subagent_path=$(find_subagent "$subagent_name"); then
        log_error "Subagent not found: $subagent_name"
        return $EXIT_SUBAGENT_NOT_FOUND
    fi
    
    local content
    if ! content=$(read_file_safely "$subagent_path"); then
        log_error "Failed to read subagent file: $subagent_path"
        return $EXIT_GENERAL_ERROR
    fi
    
    # Parse YAML frontmatter
    local in_frontmatter=false
    local name="" description="" version="" tools="" tags=""
    
    while IFS= read -r line; do
        if [[ "$line" == "---" ]]; then
            if [[ "$in_frontmatter" == true ]]; then
                break  # End of frontmatter
            else
                in_frontmatter=true
                continue
            fi
        fi
        
        if [[ "$in_frontmatter" == true ]]; then
            case "$line" in
                name:*)
                    name="${line#*: }"
                    name="${name#\"}"
                    name="${name%\"}"
                    ;;
                description:*)
                    description="${line#*: }"
                    description="${description#\"}"
                    description="${description%\"}"
                    ;;
                version:*)
                    version="${line#*: }"
                    version="${version#\"}"
                    version="${version%\"}"
                    ;;
                tools:*)
                    tools="${line#*: }"
                    tools="${tools#\"}"
                    tools="${tools%\"}"
                    ;;
                tags:*)
                    tags="${line#*: }"
                    ;;
            esac
        fi
    done <<< "$content"
    
    # Output requested information
    case "$info_type" in
        "name")
            echo "$name"
            ;;
        "description")
            echo "$description"
            ;;
        "version")
            echo "$version"
            ;;
        "tools")
            echo "$tools"
            ;;
        "tags")
            echo "$tags"
            ;;
        "path")
            echo "$subagent_path"
            ;;
        "all"|*)
            cat <<EOF
Name: $name
Description: $description
Version: ${version:-unknown}
Tools: ${tools:-all}
Tags: ${tags:-none}
Path: $subagent_path
EOF
            ;;
    esac
    
    return $EXIT_SUCCESS
}

list_subagents_with_info() {
    local format="${1:-table}"
    local available_subagents
    
    log_debug "Listing all subagents with information (format: $format)"
    
    if ! available_subagents=$(get_all_available_subagents); then
        log_error "Failed to get available subagents"
        return $EXIT_GENERAL_ERROR
    fi
    
    if [[ -z "$available_subagents" ]]; then
        echo "No subagents found."
        return $EXIT_SUCCESS
    fi
    
    case "$format" in
        "json")
            echo "["
            local first=true
            while IFS= read -r subagent; do
                [[ -z "$subagent" ]] && continue
                
                if [[ "$first" == true ]]; then
                    first=false
                else
                    echo ","
                fi
                
                local name description version tools path
                name=$(get_subagent_info "$subagent" "name" 2>/dev/null || echo "$subagent")
                description=$(get_subagent_info "$subagent" "description" 2>/dev/null || echo "")
                version=$(get_subagent_info "$subagent" "version" 2>/dev/null || echo "unknown")
                tools=$(get_subagent_info "$subagent" "tools" 2>/dev/null || echo "all")
                path=$(get_subagent_info "$subagent" "path" 2>/dev/null || echo "")
                
                cat <<EOF
  {
    "name": "$name",
    "description": "$description",
    "version": "$version",
    "tools": "$tools",
    "path": "$path"
  }
EOF
            done <<< "$available_subagents"
            echo "]"
            ;;
        "table"|*)
            printf "%-20s %-50s %-10s\n" "NAME" "DESCRIPTION" "VERSION"
            printf "%-20s %-50s %-10s\n" "----" "-----------" "-------"
            
            while IFS= read -r subagent; do
                [[ -z "$subagent" ]] && continue
                
                local name description version
                name=$(get_subagent_info "$subagent" "name" 2>/dev/null || echo "$subagent")
                description=$(get_subagent_info "$subagent" "description" 2>/dev/null || echo "No description")
                version=$(get_subagent_info "$subagent" "version" 2>/dev/null || echo "unknown")
                
                # Truncate long descriptions
                if [[ ${#description} -gt 47 ]]; then
                    description="${description:0:44}..."
                fi
                
                printf "%-20s %-50s %-10s\n" "$name" "$description" "$version"
            done <<< "$available_subagents"
            ;;
    esac
    
    return $EXIT_SUCCESS
}

##################################
# Event-Based Discovery Functions
##################################

get_subagents_for_event() {
    local event_type="$1"
    local config_file="${2:-$CONFIG_FILE}"
    local subagents=()
    
    if [[ -z "$event_type" ]]; then
        log_error "Event type is required"
        return $EXIT_VALIDATION_FAILED
    fi
    
    log_debug "Finding subagents for event: $event_type"
    
    # Check if config file exists
    if [[ ! -f "$config_file" ]]; then
        log_debug "Configuration file not found: $config_file"
        return $EXIT_SUCCESS
    fi
    
    if ! file_exists_and_readable "$config_file"; then
        log_error "Configuration file not readable: $config_file"
        return $EXIT_GENERAL_ERROR
    fi
    
    # Simple YAML parsing for event mappings
    local in_event=false
    local content
    
    if ! content=$(read_file_safely "$config_file"); then
        log_error "Failed to read configuration file: $config_file"
        return $EXIT_GENERAL_ERROR
    fi
    
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ "$line" =~ ^[[:space:]]*# ]] && continue
        [[ -z "${line// }" ]] && continue
        
        # Check for event section
        if [[ "$line" =~ ^[[:space:]]*${event_type}:[[:space:]]*$ ]]; then
            in_event=true
            log_debug "Found event section: $event_type"
            continue
        elif [[ "$line" =~ ^[[:space:]]*[a-z_][a-z0-9_-]*:[[:space:]]*$ ]]; then
            in_event=false
            continue
        fi
        
        # Extract subagent names from list items
        if [[ "$in_event" == true ]] && [[ "$line" =~ ^[[:space:]]*-[[:space:]]*([a-z][a-z0-9-]*)[[:space:]]*$ ]]; then
            local subagent_name="${BASH_REMATCH[1]}"
            
            # Verify subagent exists before adding to list
            if find_subagent "$subagent_name" >/dev/null 2>&1; then
                subagents+=("$subagent_name")
                log_debug "Added subagent for event: $subagent_name"
            else
                log_warning "Configured subagent not found: $subagent_name"
            fi
        fi
    done <<< "$content"
    
    log_debug "Found ${#subagents[@]} subagents for event: $event_type"
    
    # Output results
    printf '%s\n' "${subagents[@]}"
    return $EXIT_SUCCESS
}

get_priority_for_subagent() {
    local subagent_name="$1"
    local config_file="${2:-$CONFIG_FILE}"
    local default_priority="$DEFAULT_PRIORITY"
    
    if [[ -z "$subagent_name" ]]; then
        log_error "Subagent name is required"
        return $EXIT_VALIDATION_FAILED
    fi
    
    # Check if config file exists and is readable
    if [[ ! -f "$config_file" ]] || ! file_exists_and_readable "$config_file"; then
        echo "$default_priority"
        return $EXIT_SUCCESS
    fi
    
    local content
    if ! content=$(read_file_safely "$config_file"); then
        echo "$default_priority"
        return $EXIT_SUCCESS
    fi
    
    # Look for priority configuration
    local in_priorities=false
    local in_subagent=false
    
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ "$line" =~ ^[[:space:]]*# ]] && continue
        [[ -z "${line// }" ]] && continue
        
        # Check for priorities section
        if [[ "$line" =~ ^[[:space:]]*priorities:[[:space:]]*$ ]]; then
            in_priorities=true
            continue
        elif [[ "$line" =~ ^[[:space:]]*[a-z_][a-z0-9_-]*:[[:space:]]*$ ]] && [[ "$in_priorities" == false ]]; then
            continue
        fi
        
        # Check for subagent in priorities section
        if [[ "$in_priorities" == true ]]; then
            if [[ "$line" =~ ^[[:space:]]*${subagent_name}:[[:space:]]*$ ]]; then
                in_subagent=true
                continue
            elif [[ "$line" =~ ^[[:space:]]*[a-z][a-z0-9-]*:[[:space:]]*$ ]]; then
                in_subagent=false
                continue
            fi
            
            # Extract priority value
            if [[ "$in_subagent" == true ]] && [[ "$line" =~ ^[[:space:]]*priority:[[:space:]]*([0-9]+)[[:space:]]*$ ]]; then
                echo "${BASH_REMATCH[1]}"
                return $EXIT_SUCCESS
            fi
        fi
    done <<< "$content"
    
    # Return default if not found
    echo "$default_priority"
    return $EXIT_SUCCESS
}

##################################
# Discovery Validation Functions
##################################

validate_discovery_environment() {
    log_debug "Validating discovery environment"
    
    # Check if subagents directory exists
    if [[ ! -d "$SUBAGENTS_DIR" ]]; then
        log_warning "User subagents directory does not exist: $SUBAGENTS_DIR"
        if ! ensure_directory_exists "$SUBAGENTS_DIR"; then
            log_error "Failed to create subagents directory: $SUBAGENTS_DIR"
            return $EXIT_GENERAL_ERROR
        fi
    fi
    
    # Check directory permissions
    if [[ ! -r "$SUBAGENTS_DIR" ]]; then
        log_error "Subagents directory not readable: $SUBAGENTS_DIR"
        return $EXIT_GENERAL_ERROR
    fi
    
    log_debug "Discovery environment validation complete"
    return $EXIT_SUCCESS
}

##################################
# Initialization
##################################

initialize_subagent_discovery() {
    log_debug "Subagent discovery module initialized"
    
    # Validate discovery environment
    validate_discovery_environment || return $?
    
    return $EXIT_SUCCESS
}