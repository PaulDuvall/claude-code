#!/bin/bash
set -e

echo "🧪 Testing claude-dev-toolkit package installation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test variables
PACKAGE_FILE="claude-dev-toolkit-0.0.1-alpha.1.tgz"
TEST_DIR="/tmp/claude-package-test-$$"

# Cleanup function
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    npm uninstall -g claude-dev-toolkit 2>/dev/null || true
    rm -rf "$TEST_DIR" 2>/dev/null || true
}

# Set trap for cleanup
trap cleanup EXIT

echo -e "${YELLOW}📦 Step 1: Verifying package exists...${NC}"
if [[ ! -f "$PACKAGE_FILE" ]]; then
    echo -e "${RED}❌ Package file $PACKAGE_FILE not found!${NC}"
    echo "Run 'npm pack' first to create the package."
    exit 1
fi

echo -e "${GREEN}✅ Package file found: $PACKAGE_FILE${NC}"

echo -e "${YELLOW}📦 Step 2: Installing package globally...${NC}"
npm install -g "./$PACKAGE_FILE"

echo -e "${YELLOW}🔍 Step 3: Testing CLI availability...${NC}"
if command -v claude-commands >/dev/null 2>&1; then
    echo -e "${GREEN}✅ claude-commands is available in PATH${NC}"
else
    echo -e "${RED}❌ claude-commands not found in PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Step 4: Testing help command...${NC}"
if claude-commands --help >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Help command works${NC}"
else
    echo -e "${RED}❌ Help command failed${NC}"
    exit 1
fi

echo -e "${YELLOW}📝 Step 5: Testing list command...${NC}"
if claude-commands list >/dev/null 2>&1; then
    echo -e "${GREEN}✅ List command works${NC}"
else
    echo -e "${RED}❌ List command failed${NC}"
    exit 1
fi

echo -e "${YELLOW}📊 Step 6: Testing status command...${NC}"
if claude-commands status >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Status command works${NC}"
else
    echo -e "${RED}❌ Status command failed${NC}"
    exit 1
fi

echo -e "${YELLOW}🔧 Step 7: Testing version command...${NC}"
if claude-commands --version >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Version command works${NC}"
else
    echo -e "${RED}❌ Version command failed${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Step 8: Checking file permissions...${NC}"
CLAUDE_COMMANDS_PATH=$(which claude-commands)
if [[ -x "$CLAUDE_COMMANDS_PATH" ]]; then
    echo -e "${GREEN}✅ claude-commands is executable${NC}"
else
    echo -e "${RED}❌ claude-commands is not executable${NC}"
    exit 1
fi

echo -e "${YELLOW}🏠 Step 9: Testing with different working directories...${NC}"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"
if claude-commands --help >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Works from different directory${NC}"
else
    echo -e "${RED}❌ Fails from different directory${NC}"
    exit 1
fi

echo -e "${YELLOW}🔐 Step 10: Testing permission scenarios...${NC}"
# Test with different user contexts if possible
if [[ "$EUID" -eq 0 ]]; then
    echo -e "${YELLOW}⚠️  Running as root - cannot test non-root scenarios${NC}"
else
    echo -e "${GREEN}✅ Running as non-root user${NC}"
fi

echo ""
echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
echo -e "${GREEN}📦 Package is ready for publication${NC}"
echo ""
echo "To publish:"
echo "  npm publish $PACKAGE_FILE"
echo ""
echo "To test in fresh environment:"
echo "  docker run -it --rm -v \$(pwd):/app -w /app node:18 bash"
echo "  npm install -g ./$PACKAGE_FILE"