#!/bin/bash

# Wave Studio - Quick Fix PATH and Install
# Automatically sets up PATH and installs all dependencies

echo "🔧 Wave Studio - Quick Setup Fix"
echo ""

# ============================================================================
# FIX PATH
# ============================================================================

echo "1️⃣  Setting up PATH for Homebrew..."

if [[ $(uname -m) == "arm64" ]]; then
    export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"
    echo "   ✓ Apple Silicon path set"
else
    export PATH="/usr/local/bin:/usr/local/sbin:$PATH"
    echo "   ✓ Intel Mac path set"
fi

# Verify
if ! command -v npm &> /dev/null; then
    echo "   ✗ npm still not found. Try:"
    echo "     echo 'export PATH=\"/opt/homebrew/bin:\$PATH\"' >> ~/.zprofile"
    echo "     source ~/.zprofile"
    exit 1
fi

echo "   ✓ npm version: $(npm --version)"
echo ""

# ============================================================================
# CLEAN AND REINSTALL BACKEND
# ============================================================================

echo "2️⃣  Cleaning backend dependencies..."
cd backend || exit 1

rm -rf node_modules package-lock.json
echo "   ✓ Cleaned node_modules and package-lock.json"

echo "3️⃣  Installing backend dependencies..."
echo "   This may take 2-3 minutes..."

if npm install --legacy-peer-deps 2>&1; then
    echo "   ✓ Backend dependencies installed"
else
    echo "   ✗ Installation failed. Trying with --force..."
    npm install --force --no-audit 2>&1 || {
        echo "   ✗ Still failed. Check internet connection and try again."
        exit 1
    }
fi

cd .. || exit 1
echo ""

# ============================================================================
# CLEAN AND REINSTALL FRONTEND
# ============================================================================

echo "4️⃣  Cleaning frontend dependencies..."
cd frontend || exit 1

rm -rf node_modules package-lock.json
echo "   ✓ Cleaned node_modules and package-lock.json"

echo "5️⃣  Installing frontend dependencies..."
echo "   This may take 2-3 minutes..."

if npm install --legacy-peer-deps 2>&1; then
    echo "   ✓ Frontend dependencies installed"
else
    echo "   ✗ Installation failed. Trying with --force..."
    npm install --force --no-audit 2>&1 || {
        echo "   ✗ Still failed. Check internet connection and try again."
        exit 1
    }
fi

cd .. || exit 1
echo ""

# ============================================================================
# MAKE SCRIPTS EXECUTABLE
# ============================================================================

echo "6️⃣  Preparing start scripts..."
chmod +x start-*.sh
echo "   ✓ Scripts ready"
echo ""

# ============================================================================
# READY TO START
# ============================================================================

echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "Next: Run the application"
echo ""
echo "  ./start-all.sh"
echo ""
echo "Or start services separately:"
echo ""
echo "  Terminal 1: ./start-backend.sh"
echo "  Terminal 2: ./start-frontend.sh"
echo ""
echo "Access: http://localhost:5173"
echo "Login:  admin / Admin123456"
echo ""
