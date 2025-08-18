#!/bin/bash
# Test runner for NPM package requirements

set -e

echo "================================================"
echo "Running TDD Tests for NPM Package Requirements"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Run REQ-001 tests
echo "Testing REQ-001: NPM Package Structure"
echo "---------------------------------------"
if python3 ../tests/npm-package/test_req_001_package_structure.py 2>&1; then
    echo -e "${GREEN}✅ REQ-001: All tests passed${NC}"
else
    echo -e "${RED}❌ REQ-001: Tests failed${NC}"
    exit 1
fi

echo ""
echo "Testing REQ-002: Command Organization"
echo "--------------------------------------"
if python3 ../tests/npm-package/test_req_002_command_organization.py 2>&1; then
    echo -e "${GREEN}✅ REQ-002: All tests passed${NC}"
else
    echo -e "${RED}❌ REQ-002: Tests failed${NC}"
    exit 1
fi

echo ""
echo "Testing REQ-003: CLI Entry Point"
echo "---------------------------------"
if python3 ../tests/npm-package/test_req_003_cli_entry_point.py 2>&1; then
    echo -e "${GREEN}✅ REQ-003: All tests passed${NC}"
else
    echo -e "${RED}❌ REQ-003: Tests failed${NC}"
    exit 1
fi

echo ""
echo "Testing REQ-004: Global NPM Installation"
echo "----------------------------------------"
if python3 ../tests/npm-package/test_req_004_global_npm_installation.py 2>&1; then
    echo -e "${GREEN}✅ REQ-004: All tests passed${NC}"
else
    echo -e "${RED}❌ REQ-004: Tests failed${NC}"
    exit 1
fi

echo ""
echo "================================================"
echo -e "${GREEN}All requirements tests passed successfully!${NC}"
echo "================================================"
echo ""
echo "TDD Cycle Complete:"
echo "🔴 RED - Wrote failing tests"
echo "🟢 GREEN - Implemented minimal code to pass"
echo "🔄 REFACTOR - Improved code quality"
echo ""
echo "Next steps:"
echo "- Continue with REQ-002 through REQ-008"
echo "- Then move to security requirements"
echo "- Follow same TDD approach for each"