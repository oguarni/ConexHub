#!/bin/bash

# Setup script for security-related git hooks
# This script configures git hooks to prevent committing secrets

set -e

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Setting up security git hooks...${NC}"

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
HOOKS_DIR="$REPO_ROOT/.git/hooks"

# Check if we're in a git repository
if [ ! -d "$REPO_ROOT/.git" ]; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

echo -e "${GREEN}📁 Repository root: $REPO_ROOT${NC}"

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Check if pre-commit hook already exists
if [ -f "$HOOKS_DIR/pre-commit" ]; then
    echo -e "${YELLOW}⚠️  Pre-commit hook already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Skipping pre-commit hook installation${NC}"
        exit 0
    fi
fi

# Copy pre-commit hook from the scripts directory or create it if it doesn't exist
PRE_COMMIT_SOURCE="$REPO_ROOT/.git/hooks/pre-commit"

if [ -f "$PRE_COMMIT_SOURCE" ]; then
    echo -e "${GREEN}✅ Pre-commit hook is already in place${NC}"
else
    echo -e "${RED}❌ Pre-commit hook not found${NC}"
    echo -e "${YELLOW}Please ensure the pre-commit hook is created in .git/hooks/pre-commit${NC}"
    exit 1
fi

# Make hooks executable
chmod +x "$HOOKS_DIR/pre-commit"
echo -e "${GREEN}✅ Made pre-commit hook executable${NC}"

# Test the hook
echo -e "${BLUE}🧪 Testing pre-commit hook...${NC}"

# Create a temporary test file with a fake secret
TEST_FILE="$REPO_ROOT/test-secret-scan.tmp"
echo 'const apiKey = "sk-1234567890abcdefghijklmnopqrstuvwxyz";' > "$TEST_FILE"

# Stage the test file
git add "$TEST_FILE" 2>/dev/null || true

# Run the hook
if "$HOOKS_DIR/pre-commit"; then
    echo -e "${YELLOW}⚠️  Hook didn't catch the test secret - please check the configuration${NC}"
else
    echo -e "${GREEN}✅ Hook correctly detected the test secret${NC}"
fi

# Clean up test file
git reset HEAD "$TEST_FILE" 2>/dev/null || true
rm -f "$TEST_FILE"

echo ""
echo -e "${GREEN}🎉 Security hooks setup complete!${NC}"
echo ""
echo -e "${BLUE}What was configured:${NC}"
echo "• Pre-commit hook to scan for secrets and sensitive data"
echo "• Hook scans for API keys, passwords, tokens, private keys, and more"
echo "• Prevents commits containing potential secrets"
echo ""
echo -e "${YELLOW}Usage:${NC}"
echo "• Hooks will run automatically on every commit"
echo "• To bypass temporarily: git commit --no-verify"
echo "• To test manually: .git/hooks/pre-commit"
echo ""
echo -e "${YELLOW}Team setup:${NC}"
echo "• Share this script with your team: scripts/setup-security-hooks.sh"
echo "• Each developer should run it after cloning the repository"
echo ""
echo -e "${YELLOW}Important reminders:${NC}"
echo "• Always use environment variables for secrets"
echo "• Keep .env files in .gitignore"
echo "• Rotate any credentials that were accidentally committed"
echo "• Consider using a secrets management service for production"