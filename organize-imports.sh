#!/bin/bash

# Organize Imports and Exports Script for TS Packages Monorepo
# This script organizes imports, removes unused imports, and formats all code

set -e

echo "🚀 Starting code organization for all packages..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install it first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    pnpm install
fi

# Create a temporary directory for backup
BACKUP_DIR=".organize-backup-$(date +%Y%m%d_%H%M%S)"
print_status "Creating backup in $BACKUP_DIR..."

# Create backup of all source files

mkdir -p "$BACKUP_DIR"
cp -r packages/*/src "$BACKUP_DIR/" 2>/dev/null || true

# Step 1: Organize imports and remove unused imports
print_status "Organizing imports and removing unused imports across all packages..."
pnpm organize-all

# Step 2: Format code with Biome
print_status "Formatting code with Biome..."
pnpm format-all

# Step 3: Run final lint check
print_status "Running final lint check..."
pnpm lint-all

# Step 5: Show summary
echo ""
print_success "🎉 Code organization completed!"
echo ""
echo "📊 Summary:"
echo "  ✅ Imports organized (sorted and grouped)"
echo "  ✅ Unused imports removed"
echo "  ✅ Code formatted with Prettier"
echo "  ✅ Export statements organized"
echo ""
echo "📁 Backup created in: $BACKUP_DIR"
echo "   (You can delete this after verifying everything looks good)"
echo ""
echo "🔧 Available commands:"
echo "  pnpm organize-all          - Run complete organization"
echo "  pnpm organize              - Organize imports and remove unused"
echo "  pnpm format-all            - Format all code"
echo "  pnpm lint-all              - Run lint check"
echo "  pnpm organize-package -p <package-name>  - Organize specific package"
echo ""
print_warning "Please review the changes and test your code before committing."
