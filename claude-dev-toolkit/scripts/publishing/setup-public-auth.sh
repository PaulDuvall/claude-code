#!/bin/bash

echo "🔑 NPM Public Registry Authentication Setup"
echo "==========================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PUBLIC_REGISTRY="https://registry.npmjs.org"

echo -e "${BLUE}This script helps you set up authentication for NPM public registry publishing.${NC}"
echo

echo -e "${BLUE}📋 Authentication Options:${NC}"
echo "1. Interactive Login (npm login)"
echo "2. NPM Token Authentication"
echo "3. GitHub Actions Secret Setup"
echo

read -p "Choose option (1-3): " -n 1 -r
echo
echo

case $REPLY in
    1)
        echo -e "${BLUE}🔐 Option 1: Interactive NPM Login${NC}"
        echo "This will prompt for your npmjs.org credentials"
        echo
        
        # Check if already authenticated
        if npm whoami --registry=$PUBLIC_REGISTRY > /dev/null 2>&1; then
            CURRENT_USER=$(npm whoami --registry=$PUBLIC_REGISTRY)
            echo -e "${GREEN}✅ Already authenticated as: $CURRENT_USER${NC}"
            read -p "Re-authenticate? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${GREEN}🎉 Authentication setup complete!${NC}"
                exit 0
            fi
        fi
        
        echo "Logging in to NPM..."
        npm login --registry=$PUBLIC_REGISTRY
        
        # Verify authentication
        if npm whoami --registry=$PUBLIC_REGISTRY > /dev/null 2>&1; then
            USER=$(npm whoami --registry=$PUBLIC_REGISTRY)
            echo -e "${GREEN}✅ Successfully authenticated as: $USER${NC}"
        else
            echo -e "${RED}❌ Authentication failed${NC}"
            exit 1
        fi
        ;;
        
    2)
        echo -e "${BLUE}🔑 Option 2: NPM Token Authentication${NC}"
        echo
        echo "Steps to create an NPM token:"
        echo "1. Go to https://www.npmjs.com/settings/tokens"
        echo "2. Create a new token with 'Automation' type"
        echo "3. Copy the token (starts with 'npm_')"
        echo
        
        read -p "Enter your NPM token: " -s NPM_TOKEN
        echo
        echo
        
        if [[ -z "$NPM_TOKEN" ]]; then
            echo -e "${RED}❌ No token provided${NC}"
            exit 1
        fi
        
        # Configure npmrc
        NPMRC_LINE="//registry.npmjs.org/:_authToken=$NPM_TOKEN"
        
        if grep -q "//registry.npmjs.org/:_authToken=" ~/.npmrc 2>/dev/null; then
            echo "Updating existing token in ~/.npmrc..."
            sed -i.bak "s|//registry.npmjs.org/:_authToken=.*|$NPMRC_LINE|" ~/.npmrc
        else
            echo "Adding token to ~/.npmrc..."
            echo "$NPMRC_LINE" >> ~/.npmrc
        fi
        
        # Verify authentication
        if npm whoami --registry=$PUBLIC_REGISTRY > /dev/null 2>&1; then
            USER=$(npm whoami --registry=$PUBLIC_REGISTRY)
            echo -e "${GREEN}✅ Successfully authenticated as: $USER${NC}"
        else
            echo -e "${RED}❌ Token authentication failed${NC}"
            echo "Please verify your token is valid and has the correct permissions"
            exit 1
        fi
        ;;
        
    3)
        echo -e "${BLUE}🤖 Option 3: GitHub Actions Secret Setup${NC}"
        echo
        echo "To set up NPM authentication for GitHub Actions:"
        echo
        echo "1. Create an NPM Automation token:"
        echo "   - Go to https://www.npmjs.com/settings/tokens"
        echo "   - Click 'Generate New Token' > 'Automation'"
        echo "   - Copy the token (starts with 'npm_')"
        echo
        echo "2. Add to GitHub repository secrets:"
        echo "   - Go to your repository on GitHub"
        echo "   - Settings > Secrets and variables > Actions"
        echo "   - Click 'New repository secret'"
        echo "   - Name: NPM_TOKEN"
        echo "   - Value: [paste your npm token]"
        echo
        echo "3. The GitHub Actions workflow will use this secret automatically"
        echo
        echo -e "${YELLOW}⚠️  Keep your NPM token secure and never commit it to code!${NC}"
        echo
        echo -e "${GREEN}✅ GitHub Actions authentication setup guide complete!${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Invalid option selected${NC}"
        exit 1
        ;;
esac

echo
echo -e "${GREEN}🎉 NPM public registry authentication setup complete!${NC}"
echo
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Test publishing with: ./publish-public.sh"
echo "2. Verify your package permissions"
echo "3. Set up GitHub Actions secrets if using CI/CD"
echo

echo -e "${BLUE}🔒 Security Reminders:${NC}"
echo "- Never commit NPM tokens to version control"
echo "- Regularly rotate your authentication tokens"
echo "- Use automation tokens for CI/CD pipelines"
echo "- Keep your npmjs.org account secure with 2FA"