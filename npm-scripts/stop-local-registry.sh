#!/bin/bash

echo "🛑 Stopping Verdaccio Local Private NPM Registry"

REGISTRY_PID_FILE="/tmp/verdaccio.pid"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [[ -f "$REGISTRY_PID_FILE" ]]; then
    PID=$(cat "$REGISTRY_PID_FILE")
    if ps -p $PID > /dev/null; then
        echo "Stopping Verdaccio (PID: $PID)..."
        kill $PID
        sleep 2
        
        # Force kill if still running
        if ps -p $PID > /dev/null; then
            echo "Force killing Verdaccio..."
            kill -9 $PID
        fi
        
        echo -e "${GREEN}✅ Verdaccio stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Verdaccio not running (PID $PID not found)${NC}"
    fi
    
    rm -f "$REGISTRY_PID_FILE"
else
    echo -e "${YELLOW}⚠️  No PID file found${NC}"
fi

# Reset npm registry to default
npm set registry https://registry.npmjs.org
echo -e "${GREEN}✅ NPM registry reset to default${NC}"

echo "🧹 Cleanup complete"