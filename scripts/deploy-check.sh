#!/bin/bash

# Ebad Academy - Pre-Deployment Check Script
# This script verifies your application is ready for production deployment

set -e

echo "🚀 Ebad Academy - Pre-Deployment Check"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS_PASSED++))
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
    ((CHECKS_FAILED++))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "1. Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    success "Node.js version: $(node -v)"
else
    error "Node.js version too old. Need v18 or higher, got $(node -v)"
fi

echo ""
echo "2. Checking dependencies..."
if [ -d "node_modules" ]; then
    success "Dependencies installed"
else
    error "Dependencies not installed. Run: npm install"
fi

echo ""
echo "3. Checking environment files..."
if [ -f ".env.example" ]; then
    success ".env.example exists"
else
    error ".env.example missing"
fi

if [ -f ".env.local" ]; then
    success ".env.local exists (for local dev)"
else
    warning ".env.local missing (optional for local dev)"
fi

echo ""
echo "4. Running linter..."
if npm run lint > /dev/null 2>&1; then
    success "ESLint passed"
else
    error "ESLint failed. Run: npm run lint"
fi

echo ""
echo "5. Running tests..."
if npm run test:unit -- --run > /dev/null 2>&1; then
    success "All tests passed (159 tests)"
else
    error "Tests failed. Run: npm run test:unit"
fi

echo ""
echo "6. Checking build..."
if npm run build > /dev/null 2>&1; then
    success "Build successful"
else
    error "Build failed. Run: npm run build"
fi

echo ""
echo "7. Checking required files..."
REQUIRED_FILES=(
    "package.json"
    "next.config.ts"
    "tsconfig.json"
    "prisma/schema.prisma"
    "vercel.json"
    ".github/workflows/test.yml"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        success "$file exists"
    else
        error "$file missing"
    fi
done

echo ""
echo "8. Checking Git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    success "Git repository initialized"
    
    # Check if there are uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        success "No uncommitted changes"
    else
        warning "You have uncommitted changes. Commit before deploying."
    fi
    
    # Check if remote is set
    if git remote -v | grep -q "origin"; then
        success "Git remote configured"
    else
        error "Git remote not configured. Run: git remote add origin <url>"
    fi
else
    error "Not a Git repository"
fi

echo ""
echo "9. Checking Vercel configuration..."
if [ -f "vercel.json" ]; then
    success "vercel.json exists"
    
    # Check if cron jobs are configured
    if grep -q "crons" vercel.json; then
        success "Cron jobs configured"
    else
        warning "No cron jobs configured in vercel.json"
    fi
else
    error "vercel.json missing"
fi

echo ""
echo "10. Checking documentation..."
DOCS=(
    "README.md"
    "DEPLOYMENT.md"
    "FIXES_APPLIED.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        success "$doc exists"
    else
        warning "$doc missing (recommended)"
    fi
done

echo ""
echo "========================================"
echo "Pre-Deployment Check Complete"
echo "========================================"
echo ""
echo -e "${GREEN}Checks Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Checks Failed: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Your application is ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub: git push origin main"
    echo "2. Go to vercel.com and import your repository"
    echo "3. Follow the deployment guide in DEPLOYMENT.md"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Please fix the errors above before deploying${NC}"
    echo ""
    exit 1
fi

