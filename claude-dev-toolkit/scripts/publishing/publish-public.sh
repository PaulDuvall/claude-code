#!/bin/bash
set -e

echo "🌍 Publishing claude-dev-toolkit to Public NPM Registry (npmjs.org)"
echo "This publishes the package for public consumption"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PACKAGE_NAME="claude-dev-toolkit"
PUBLIC_REGISTRY="https://registry.npmjs.org"

# Cleanup function for rollback
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    # Restore original package.json if backup exists
    if [[ -f "package.json.backup" ]]; then
        mv package.json.backup package.json
        echo -e "${YELLOW}📦 Restored original package.json${NC}"
    fi
}

# Set trap for cleanup on error
trap cleanup ERR EXIT

echo -e "${BLUE}📦 Step 1: Verifying package...${NC}"

# Verify package directory exists
if [[ ! -d "claude-dev-toolkit" ]]; then
    echo -e "${RED}❌ claude-dev-toolkit directory not found${NC}"
    echo "Please ensure the NPM package has been built"
    exit 1
fi

cd claude-dev-toolkit

# Verify package.json exists
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ package.json not found in claude-dev-toolkit directory${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Package structure found${NC}"

echo -e "${BLUE}📝 Step 2: Configuring for Public NPM Registry...${NC}"

# Backup original package.json
cp package.json package.json.backup

# Update package.json for public registry
cat package.json | jq '.name = "claude-dev-toolkit"' > package.json.tmp
mv package.json.tmp package.json

# Add publishConfig for public registry
cat package.json | jq --arg registry "$PUBLIC_REGISTRY" '.publishConfig = {"registry": $registry}' > package.json.tmp
mv package.json.tmp package.json

# Ensure access is public
cat package.json | jq '.publishConfig.access = "public"' > package.json.tmp
mv package.json.tmp package.json

echo -e "${GREEN}✅ Package configured for Public NPM Registry${NC}"

echo -e "${BLUE}🔍 Step 3: Package validation...${NC}"

# Run package validation
echo "Running package validation..."
if npm run validate; then
    echo -e "${GREEN}✅ Package validation passed${NC}"
else
    echo -e "${RED}❌ Package validation failed${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Step 4: Creating package tarball...${NC}"
npm pack --dry-run
echo -e "${GREEN}✅ Package tarball verified${NC}"

echo -e "${BLUE}🔑 Step 5: Authentication check...${NC}"

# Check if authenticated to public NPM registry
if npm whoami --registry=$PUBLIC_REGISTRY > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Authenticated to NPM Registry${NC}"
    CURRENT_USER=$(npm whoami --registry=$PUBLIC_REGISTRY)
    echo -e "${BLUE}📝 Publishing as: $CURRENT_USER${NC}"
else
    echo -e "${YELLOW}⚠️  Not authenticated to NPM Registry${NC}"
    echo
    echo "To authenticate:"
    echo "1. Create an account at: https://www.npmjs.com/"
    echo "2. Run: npm login --registry=$PUBLIC_REGISTRY"
    echo "   - Enter your npmjs.org username and password"
    echo "3. Or set NPM_TOKEN environment variable:"
    echo "   export NPM_TOKEN=your-npm-token"
    echo "   echo '//registry.npmjs.org/:_authToken=\${NPM_TOKEN}' >> ~/.npmrc"
    echo
    read -p "Press Enter after authentication, or Ctrl+C to cancel..."
    
    # Verify authentication again
    if ! npm whoami --registry=$PUBLIC_REGISTRY > /dev/null 2>&1; then
        echo -e "${RED}❌ Still not authenticated. Please authenticate and try again.${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}📋 Step 6: Version and tag preparation...${NC}"

# Extract version from package.json
PACKAGE_VERSION=$(cat package.json | jq -r '.version')
TAG_NAME="v${PACKAGE_VERSION}"

echo -e "${BLUE}📝 Package Version: $PACKAGE_VERSION${NC}"
echo -e "${BLUE}🏷️  Git Tag: $TAG_NAME${NC}"

# Check if tag already exists
if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Tag $TAG_NAME already exists${NC}"
    read -p "Continue with existing tag? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🚫 Publication cancelled${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Tag $TAG_NAME is available${NC}"
fi

echo -e "${BLUE}🚀 Step 7: Publishing to Public NPM Registry...${NC}"

# Publish to public registry
if npm publish --registry=$PUBLIC_REGISTRY; then
    echo
    echo -e "${GREEN}🎉 Successfully published to Public NPM Registry!${NC}"
    echo
    echo "📦 Package Details:"
    echo "  Name: claude-dev-toolkit"
    echo "  Registry: $PUBLIC_REGISTRY"
    echo "  Version: $PACKAGE_VERSION"
    echo
    echo "🔗 NPM Package URL:"
    echo "  https://www.npmjs.com/package/claude-dev-toolkit"
    echo
    echo "📥 Installation Command:"
    echo "  npm install claude-dev-toolkit"
    echo
    
    # Create and push git tag for this release
    echo -e "${BLUE}🏷️  Step 8: Creating git tag...${NC}"
    if ! git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
        git tag -a "$TAG_NAME" -m "Release version $PACKAGE_VERSION"
        echo -e "${GREEN}✅ Created tag $TAG_NAME${NC}"
        
        # Push tag to remote
        echo -e "${BLUE}📤 Pushing tag to remote...${NC}"
        git push origin "$TAG_NAME"
        echo -e "${GREEN}✅ Tag pushed to remote repository${NC}"
    else
        echo -e "${BLUE}ℹ️  Tag $TAG_NAME already exists, skipping creation${NC}"
    fi
    
    echo
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "1. Monitor NPM package page for downloads and issues"
    echo "2. Update project documentation with installation instructions"
    echo "3. Announce the release to the community"
    echo "4. Monitor GitHub issues for user feedback"
    
else
    echo -e "${RED}❌ Failed to publish to Public NPM Registry${NC}"
    echo "Check the error messages above and try again"
    exit 1
fi

# Success - disable cleanup trap
trap - ERR EXIT

# Clean up backup
if [[ -f "package.json.backup" ]]; then
    rm package.json.backup
fi

echo
echo -e "${GREEN}✅ Public NPM registry publication complete!${NC}"