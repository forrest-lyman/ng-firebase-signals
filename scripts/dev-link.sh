#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting ng-firebase-signals development build and link...${NC}"

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
npm run clean

# Build the library
echo -e "${YELLOW}🔨 Building library...${NC}"
npm run build

# Link the package
echo -e "${YELLOW}🔗 Linking package...${NC}"
npm link

echo -e "${GREEN}✅ Library built and linked successfully!${NC}"
echo -e "${YELLOW}📝 To use in another project:${NC}"
echo -e "   cd /path/to/your/test/project"
echo -e "   npm link ng-firebase-signals"
echo ""
echo -e "${YELLOW}🔄 Starting watch mode...${NC}"
echo -e "${YELLOW}   Press Ctrl+C to stop${NC}"

# Start watch mode
npm run build:watch
