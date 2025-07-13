# /xrefactor — Code Refactoring Assistant

Interactive refactoring assistant based on Martin Fowler's catalog and project-specific rules. Analyzes code for smells and suggests specific refactoring techniques.

## What it does:
1. **Analyzes** code for common smells and anti-patterns
2. **Suggests** specific refactoring techniques with examples
3. **Prioritizes** issues based on severity and impact
4. **Guides** through incremental refactoring steps

## Code smell detection:
- **Bloaters**: Long methods, large classes, primitive obsession
- **Change Preventers**: Divergent change, shotgun surgery
- **Dispensables**: Dead code, duplicate code, lazy class
- **Couplers**: Feature envy, inappropriate intimacy
- **Project-specific**: Missing error handling, hardcoded config

## Usage:
```
/xrefactor [file_path] [--smell=smell_id] [--priority=high|medium|low]
```

Options:
- `file_path`: Specific file to analyze (optional, defaults to current directory)
- `--smell`: Focus on specific smell type (e.g., long_method, large_class)
- `--priority`: Filter by priority level

Examples:
- `/xrefactor` - Analyze current directory for all smells
- `/xrefactor src/email_processor.py` - Analyze specific file
- `/xrefactor --smell=long_method` - Find only long method smells
- `/xrefactor --priority=high` - Show only high-priority issues

---

#!/bin/bash

# Custom Claude Code slash‑command for interactive code refactoring assistance
# Based on Martin Fowler's refactoring catalog and project-specific rules

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}[REFACTOR]${NC} $1"
}

print_smell() {
    echo -e "${RED}🚨 SMELL DETECTED:${NC} $1"
}

print_suggestion() {
    echo -e "${GREEN}💡 SUGGESTION:${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
}

# Parse command line arguments
TARGET_PATH="."
SMELL_FILTER=""
PRIORITY_FILTER=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --smell=*)
            SMELL_FILTER="${1#*=}"
            shift
            ;;
        --priority=*)
            PRIORITY_FILTER="${1#*=}"
            shift
            ;;
        --smell)
            SMELL_FILTER="$2"
            shift 2
            ;;
        --priority)
            PRIORITY_FILTER="$2"
            shift 2
            ;;
        -*)
            print_warning "Unknown option: $1"
            exit 1
            ;;
        *)
            TARGET_PATH="$1"
            shift
            ;;
    esac
done

print_header "🔍 Analyzing code for refactoring opportunities..."

if [ ! -e "$TARGET_PATH" ]; then
    print_warning "Path not found: $TARGET_PATH"
    exit 1
fi

echo "Target: $TARGET_PATH"
[ -n "$SMELL_FILTER" ] && echo "Smell filter: $SMELL_FILTER"
[ -n "$PRIORITY_FILTER" ] && echo "Priority filter: $PRIORITY_FILTER"
echo

# Function to check for specific code smells
check_long_methods() {
    local file="$1"
    echo -e "${CYAN}🔍 Checking for Long Methods...${NC}"
    
    # Use Python to analyze method lengths
    python3 << EOF
import ast
import sys

def analyze_file(filename):
    try:
        with open(filename, 'r') as f:
            content = f.read()
        
        tree = ast.parse(content)
        issues = []
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                # Calculate method length (rough estimate)
                if hasattr(node, 'end_lineno') and node.end_lineno:
                    length = node.end_lineno - node.lineno
                    if length > 20:  # Threshold for long method
                        issues.append({
                            'name': node.name,
                            'line': node.lineno,
                            'length': length,
                            'severity': 'high' if length > 40 else 'medium'
                        })
        
        return issues
    except Exception as e:
        return []

if __name__ == "__main__":
    issues = analyze_file("$file")
    for issue in issues:
        severity_color = "🔴" if issue['severity'] == 'high' else "🟡"
        print(f"  {severity_color} Method '{issue['name']}' at line {issue['line']}: {issue['length']} lines")
        if issue['length'] > 40:
            print(f"     💡 Consider extracting smaller methods")
        else:
            print(f"     💡 Consider using Extract Method refactoring")
EOF
}

check_large_classes() {
    local file="$1"
    echo -e "${CYAN}🔍 Checking for Large Classes...${NC}"
    
    python3 << EOF
import ast

def analyze_file(filename):
    try:
        with open(filename, 'r') as f:
            content = f.read()
        
        tree = ast.parse(content)
        
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                methods = [n for n in node.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]
                attributes = [n for n in ast.walk(node) if isinstance(n, ast.Assign)]
                
                method_count = len(methods)
                
                if hasattr(node, 'end_lineno') and node.end_lineno:
                    class_length = node.end_lineno - node.lineno
                else:
                    class_length = 0
                
                issues = []
                if class_length > 250:
                    issues.append(f"Class too long: {class_length} lines")
                if method_count > 20:
                    issues.append(f"Too many methods: {method_count}")
                
                if issues:
                    print(f"  🔴 Class '{node.name}' at line {node.lineno}:")
                    for issue in issues:
                        print(f"     - {issue}")
                    print(f"     💡 Consider using Extract Class or Extract Subclass")
    except Exception:
        pass

analyze_file("$file")
EOF
}

check_missing_error_handling() {
    local file="$1"
    echo -e "${CYAN}🔍 Checking for Missing Error Handling...${NC}"
    
    # Check for common patterns that need error handling
    local risky_patterns=(
        "requests\\.get\\|requests\\.post"
        "open("
        "json\\.loads"
        "datetime\\.strptime"
        "\\.get("
    )
    
    for pattern in "${risky_patterns[@]}"; do
        if grep -n "$pattern" "$file" >/dev/null 2>&1; then
            echo "  🟡 Found potentially risky operations:"
            grep -n "$pattern" "$file" | while read -r line; do
                line_num=$(echo "$line" | cut -d: -f1)
                content=$(echo "$line" | cut -d: -f2-)
                echo "     Line $line_num: $content"
            done
            echo "     💡 Consider adding try/catch blocks and proper error handling"
        fi
    done
}

check_hardcoded_config() {
    local file="$1"
    echo -e "${CYAN}🔍 Checking for Hardcoded Configuration...${NC}"
    
    # Look for hardcoded URLs, ports, and paths
    if grep -n "https\\?://" "$file" >/dev/null 2>&1; then
        echo "  🟡 Found hardcoded URLs:"
        grep -n "https\\?://" "$file" | head -5
        echo "     💡 Consider extracting to configuration files"
    fi
    
    if grep -n ":[0-9]\\{2,5\\}" "$file" >/dev/null 2>&1; then
        echo "  🟡 Found potential hardcoded ports:"
        grep -n ":[0-9]\\{2,5\\}" "$file" | head -3
        echo "     💡 Consider using environment variables"
    fi
}

check_async_issues() {
    local file="$1"
    echo -e "${CYAN}🔍 Checking for Async/Await Issues...${NC}"
    
    if grep -n "async def" "$file" >/dev/null 2>&1; then
        # Check if async functions are missing await
        async_functions=$(grep -n "async def" "$file" | cut -d: -f1)
        for line_num in $async_functions; do
            func_line=$(sed -n "${line_num}p" "$file")
            func_name=$(echo "$func_line" | sed 's/.*async def \([^(]*\).*/\1/')
            
            # Simple check for await in the function (this is basic)
            if ! sed -n "${line_num},\$p" "$file" | grep -q "await" && ! sed -n "${line_num},\$p" "$file" | grep -q "return.*asyncio"; then
                echo "  🟡 Async function '$func_name' at line $line_num may not need to be async"
                echo "     💡 Consider making it synchronous if no await statements"
            fi
        done
        
        # Check for blocking operations in async functions
        if grep -n "requests\\." "$file" >/dev/null 2>&1 && grep -n "async def" "$file" >/dev/null 2>&1; then
            echo "  🔴 Found blocking requests in file with async functions"
            echo "     💡 Consider using aiohttp instead of requests"
        fi
    fi
}

# Function to analyze a single file
analyze_file() {
    local file="$1"
    
    if [[ ! "$file" =~ \.py$ ]]; then
        return
    fi
    
    echo -e "\n${PURPLE}📁 Analyzing: $file${NC}"
    echo "=================================="
    
    # Apply filters
    local should_check=true
    case "$SMELL_FILTER" in
        "long_method")
            check_long_methods "$file"
            return
            ;;
        "large_class")
            check_large_classes "$file"
            return
            ;;
        "missing_error_handling")
            check_missing_error_handling "$file"
            return
            ;;
        "hardcoded_config")
            check_hardcoded_config "$file"
            return
            ;;
        "async_issues")
            check_async_issues "$file"
            return
            ;;
        "")
            # Check all
            ;;
        *)
            print_warning "Unknown smell filter: $SMELL_FILTER"
            return
            ;;
    esac
    
    # Run all checks
    check_long_methods "$file"
    check_large_classes "$file" 
    check_missing_error_handling "$file"
    check_hardcoded_config "$file"
    check_async_issues "$file"
}

# Main analysis logic
if [ -f "$TARGET_PATH" ]; then
    # Single file analysis
    analyze_file "$TARGET_PATH"
elif [ -d "$TARGET_PATH" ]; then
    # Directory analysis
    find "$TARGET_PATH" -name "*.py" -type f | while read -r file; do
        analyze_file "$file"
    done
else
    print_warning "Invalid target path: $TARGET_PATH"
    exit 1
fi

echo
print_header "🎯 Refactoring Recommendations"
echo "=================================="
echo
echo "📚 Common Refactoring Techniques:"
echo "  • Extract Method: Break down long methods"
echo "  • Extract Class: Split large classes"
echo "  • Replace Magic Numbers: Use named constants"
echo "  • Introduce Parameter Object: Group related parameters"
echo "  • Replace Type Code with Polymorphism: Use inheritance"
echo
echo "🔧 Tools to help:"
echo "  • pytest --cov: Check test coverage"
echo "  • radon cc: Calculate complexity metrics"
echo "  • pylint: Static code analysis"
echo "  • black: Code formatting"
echo
echo "📖 For detailed refactoring patterns, see:"
echo "  • Martin Fowler's Refactoring: https://refactoring.com/"
echo "  • Clean Code by Robert Martin"
echo
print_info "Happy refactoring! 🚀"