#!/bin/bash

# Wave Studio Admin Dashboard - Start All Services
# Handles PATH setup for macOS (both Apple Silicon and Intel)

echo "🚀 Starting Wave Studio Admin Dashboard (Full Stack)..."
echo ""

# ============================================================================
# SETUP PATH FOR HOMEBREW AND NODE
# ============================================================================

# Detect Mac architecture and set Homebrew path
if [[ $(uname -m) == "arm64" ]]; then
    # Apple Silicon - Homebrew installed to /opt/homebrew
    export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"
    HOMEBREW_PREFIX="/opt/homebrew"
else
    # Intel Mac - Homebrew installed to /usr/local
    export PATH="/usr/local/bin:/usr/local/sbin:$PATH"
    HOMEBREW_PREFIX="/usr/local"
fi

# Add nvm if it exists (for Node.js)
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
fi

# Verify commands are available
echo "🔍 Checking environment..."
echo "  PATH: $PATH"
echo "  Node: $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo "  npm: $(npm --version 2>/dev/null || echo 'NOT FOUND')"
echo ""

# ============================================================================
# START POSTGRESQL
# ============================================================================

echo "📦 Checking PostgreSQL..."
if command -v brew &> /dev/null; then
    if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        echo "  → Starting PostgreSQL..."
        brew services start postgresql@15 2>/dev/null || echo "  ⚠ PostgreSQL may not be installed"
        sleep 2
    else
        echo "  ✓ PostgreSQL already running"
    fi
else
    echo "  ⚠ Homebrew not found, skipping PostgreSQL startup"
fi
echo ""

# ============================================================================
# START BACKEND
# ============================================================================

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found in PATH"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "  1. Try running: source ~/.bash_profile or source ~/.zprofile"
    echo "  2. Try installing Node.js manually from https://nodejs.org/"
    echo "  3. Or run: brew install node"
    echo ""
    echo "📖 For more help, see: MACOS_TROUBLESHOOTING.md"
    exit 1
fi

echo "🔧 Starting Backend on port 5000..."
echo "  Location: $(cd "$(dirname "$0")/backend" && pwd)"
echo ""

cd "$(dirname "$0")/backend" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "  → Installing backend dependencies..."
    npm install || true
fi

# Start backend in background
npm start &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"
echo ""

# Wait for backend to start
sleep 3

# ============================================================================
# START FRONTEND
# ============================================================================

echo "📱 Starting Frontend on port 5173..."
echo "  Location: $(cd "$(dirname "$0")/frontend" && pwd)"
echo ""

cd "$(dirname "$0")/frontend" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "  → Installing frontend dependencies..."
    npm install || true
fi

# Start frontend in background
npm run dev &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"
echo ""

# ============================================================================
# SHOW STATUS
# ============================================================================

echo ""
echo "========================================"
echo "✅ Wave Studio is running!"
echo "========================================"
echo ""
echo "🔗 Frontend:  http://localhost:5173"
echo "🔗 Backend:   http://localhost:5000"
echo "🔗 API:       http://localhost:5000/api"
echo ""
echo "📝 Demo Credentials:"
echo "   Username: admin"
echo "   Password: Admin123456"
echo ""
echo "⚙️  Processes:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 Commands:"
echo "   Stop Backend:  kill $BACKEND_PID"
echo "   Stop Frontend: kill $FRONTEND_PID"
echo "   Stop All:      Press Ctrl+C"
echo ""
echo "📖 Documentation:"
echo "   README.md              - Project overview"
echo "   INSTALL.md             - Installation guide"
echo "   docs/API.md            - API reference"
echo "   MACOS_TROUBLESHOOTING.md - Common issues"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep the script running
wait
