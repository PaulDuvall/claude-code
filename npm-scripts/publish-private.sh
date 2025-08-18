#!/bin/bash
set -e

echo "🔐 Publishing claude-dev-toolkit to GitHub Packages (Private Registry)"
echo "This allows UX testing before public npm registry publication"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PACKAGE_NAME="claude-dev-toolkit"
GITHUB_REPO="PaulDuvall/claude-code"
REGISTRY_URL="https://npm.pkg.github.com"

echo -e "${BLUE}📦 Step 1: Building package...${NC}"
cd claude-dev-toolkit

# Verify package.json exists
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ package.json not found in claude-dev-toolkit directory${NC}"
    echo "Run the package builder first:"
    echo "  cd npm-package && python3 -c \"from package_builder import NPMPackageBuilder; NPMPackageBuilder('..').build()\""
    exit 1
fi

echo -e "${GREEN}✅ Package structure found${NC}"

echo -e "${BLUE}📝 Step 2: Configuring for GitHub Packages...${NC}"

# Update package.json for GitHub Packages
cat package.json | jq --arg repo "@${GITHUB_REPO/\//-}" '.name = $repo + "/claude-dev-toolkit"' > package.json.tmp
mv package.json.tmp package.json

# Add publishConfig to package.json
cat package.json | jq --arg registry "$REGISTRY_URL" '.publishConfig = {"registry": $registry}' > package.json.tmp
mv package.json.tmp package.json

echo -e "${GREEN}✅ Package configured for GitHub Packages${NC}"

echo -e "${BLUE}🔍 Step 3: Pre-publication testing...${NC}"

# Run our comprehensive test suite
echo "Running pre-publication tests..."
cd ..
python3 -c "
from npm_package.pre_publication_tester import PrePublicationTester
from pathlib import Path

print('🧪 Running pre-publication test suite...')
tester = PrePublicationTester(Path('claude-dev-toolkit'))
readiness = tester.assess_publication_readiness()

if readiness['ready_for_publication']:
    print('✅ Package ready for publication!')
    print(f'Confidence score: {readiness[\"confidence_score\"]:.1f}%')
else:
    print('❌ Publication blocked by issues:')
    for issue in readiness['blocking_issues']:
        print(f'  - {issue[\"message\"]}')
    exit(1)
"

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Pre-publication tests passed${NC}"
else
    echo -e "${RED}❌ Pre-publication tests failed${NC}"
    exit 1
fi

cd claude-dev-toolkit

echo -e "${BLUE}📦 Step 4: Creating package tarball...${NC}"
npm pack --dry-run
echo -e "${GREEN}✅ Package tarball verified${NC}"

echo -e "${BLUE}🔑 Step 5: Authentication check...${NC}"

# Check if authenticated to GitHub Packages
if npm whoami --registry=$REGISTRY_URL > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Authenticated to GitHub Packages${NC}"
else
    echo -e "${YELLOW}⚠️  Not authenticated to GitHub Packages${NC}"
    echo
    echo "To authenticate:"
    echo "1. Create a Personal Access Token at: https://github.com/settings/tokens"
    echo "   - Check 'write:packages' and 'read:packages' permissions"
    echo "2. Run: npm login --registry=$REGISTRY_URL"
    echo "   - Username: your-github-username"
    echo "   - Password: your-personal-access-token"
    echo "3. Or set up ~/.npmrc:"
    echo "   echo '//npm.pkg.github.com/:_authToken=YOUR_TOKEN' >> ~/.npmrc"
    echo
    read -p "Press Enter after authentication, or Ctrl+C to cancel..."
fi

echo -e "${BLUE}🚀 Step 6: Publishing to GitHub Packages...${NC}"

# Publish to GitHub Packages
if npm publish --registry=$REGISTRY_URL; then
    echo
    echo -e "${GREEN}🎉 Successfully published to GitHub Packages!${NC}"
    echo
    echo "📦 Package Details:"
    echo "  Name: @${GITHUB_REPO/\//-}/claude-dev-toolkit"
    echo "  Registry: $REGISTRY_URL"
    echo "  Version: $(cat package.json | jq -r '.version')"
    echo
    echo "🧪 Testing Installation:"
    echo "  npm install @${GITHUB_REPO/\//-}/claude-dev-toolkit --registry=$REGISTRY_URL"
    echo
    echo "🔧 Or add to .npmrc for easier access:"
    echo "  echo '@${GITHUB_REPO/\//-}:registry=$REGISTRY_URL' >> ~/.npmrc"
    echo
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "1. Test the UX with real installation"
    echo "2. Get feedback from beta users"
    echo "3. Once satisfied, publish to public npm registry"
    echo "4. Run: ./publish-public.sh"
    
else
    echo -e "${RED}❌ Failed to publish to GitHub Packages${NC}"
    echo "Check the error messages above and try again"
    exit 1
fi

echo
echo -e "${GREEN}✅ Private registry publication complete!${NC}"