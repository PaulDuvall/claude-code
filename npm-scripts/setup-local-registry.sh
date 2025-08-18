#!/bin/bash
set -e

echo "🏠 Setting up Verdaccio Local Private NPM Registry"
echo "Perfect for completely local UX testing"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

REGISTRY_URL="http://localhost:4873"
REGISTRY_PID_FILE="/tmp/verdaccio.pid"

echo -e "${BLUE}📦 Step 1: Installing Verdaccio...${NC}"

# Check if Verdaccio is installed
if ! command -v verdaccio &> /dev/null; then
    echo "Installing Verdaccio globally..."
    npm install -g verdaccio
else
    echo -e "${GREEN}✅ Verdaccio already installed${NC}"
fi

echo -e "${BLUE}🚀 Step 2: Starting Verdaccio server...${NC}"

# Kill existing Verdaccio if running
if [[ -f "$REGISTRY_PID_FILE" ]]; then
    OLD_PID=$(cat "$REGISTRY_PID_FILE")
    if ps -p $OLD_PID > /dev/null; then
        echo "Stopping existing Verdaccio (PID: $OLD_PID)..."
        kill $OLD_PID
        sleep 2
    fi
    rm -f "$REGISTRY_PID_FILE"
fi

# Start Verdaccio in background
echo "Starting Verdaccio on $REGISTRY_URL..."
nohup verdaccio > /tmp/verdaccio.log 2>&1 &
VERDACCIO_PID=$!
echo $VERDACCIO_PID > "$REGISTRY_PID_FILE"

# Wait for Verdaccio to start
echo "Waiting for Verdaccio to start..."
for i in {1..10}; do
    if curl -s $REGISTRY_URL > /dev/null; then
        echo -e "${GREEN}✅ Verdaccio started successfully${NC}"
        break
    fi
    sleep 2
    if [[ $i -eq 10 ]]; then
        echo -e "${RED}❌ Failed to start Verdaccio${NC}"
        exit 1
    fi
done

echo -e "${BLUE}👤 Step 3: Setting up user authentication...${NC}"

# Create user for publishing
echo "Setting up npm user for local registry..."
echo "Default credentials: admin / admin"

# Add user automatically (bypass interactive prompt)
curl -X PUT \
  "$REGISTRY_URL/-/user/org.couchdb.user:admin" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "admin",
    "password": "admin",
    "email": "admin@local.test",
    "type": "user",
    "roles": [],
    "date": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"
  }' > /tmp/verdaccio-user.log 2>&1

# Set npm registry
npm set registry $REGISTRY_URL

# Set up authentication automatically using npmrc
echo "//localhost:4873/:_authToken=admin" >> ~/.npmrc || true
echo "Setting up automatic authentication..."

echo -e "${BLUE}📦 Step 4: Preparing package for local publishing...${NC}"

# Build package if not exists
if [[ ! -d "claude-dev-toolkit" ]]; then
    echo "Building package structure..."
    cd npm-package
    python3 -c "from package_builder import NPMPackageBuilder; NPMPackageBuilder('..').build()"
    cd ..
fi

cd claude-dev-toolkit

# Reset package.json for local registry
cp package.json package.json.backup
cat package.json | jq 'del(.publishConfig)' | jq '.name = "claude-dev-toolkit"' > package.json.tmp
mv package.json.tmp package.json

echo -e "${BLUE}🧪 Step 5: Running pre-publication tests...${NC}"

cd ..
export PYTHONPATH="${PYTHONPATH}:$(pwd)/npm-package"
python3 -c "
import sys, os
sys.path.insert(0, os.path.join(os.getcwd(), 'npm-package'))
from pre_publication_tester import PrePublicationTester
from pathlib import Path

print('🧪 Running pre-publication test suite...')
tester = PrePublicationTester(Path('claude-dev-toolkit'))
readiness = tester.assess_publication_readiness()

if readiness['ready_for_publication']:
    print('✅ Package ready for publication!')
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

echo -e "${BLUE}🚀 Step 6: Publishing to local registry...${NC}"

if npm publish --registry $REGISTRY_URL; then
    echo
    echo -e "${GREEN}🎉 Successfully published to local registry!${NC}"
    echo
    echo "📦 Package Details:"
    echo "  Name: claude-dev-toolkit"
    echo "  Registry: $REGISTRY_URL"
    echo "  Version: $(cat package.json | jq -r '.version')"
    echo
    echo "🧪 Testing Installation:"
    echo "  npm install claude-dev-toolkit --registry=$REGISTRY_URL"
    echo
    echo "🌐 Registry Dashboard:"
    echo "  Open: $REGISTRY_URL"
    echo
    echo -e "${BLUE}📋 Commands for Testing:${NC}"
    echo
    echo "# Test global installation:"
    echo "npm install -g claude-dev-toolkit --registry=$REGISTRY_URL"
    echo
    echo "# Test CLI availability:"
    echo "claude-commands --help"
    echo
    echo "# View registry dashboard:"
    echo "open $REGISTRY_URL"
    echo
    echo -e "${YELLOW}⚠️  Registry Management:${NC}"
    echo "# Stop registry:"
    echo "./stop-local-registry.sh"
    echo
    echo "# Restart registry:"
    echo "./setup-local-registry.sh"
    echo
    echo "# View logs:"
    echo "tail -f /tmp/verdaccio.log"
    
else
    echo -e "${RED}❌ Failed to publish to local registry${NC}"
    echo "Check /tmp/verdaccio.log for errors"
    exit 1
fi

echo
echo -e "${GREEN}✅ Local private registry setup complete!${NC}"
echo -e "${BLUE}🔗 Registry URL: $REGISTRY_URL${NC}"
echo -e "${BLUE}📊 PID File: $REGISTRY_PID_FILE${NC}"