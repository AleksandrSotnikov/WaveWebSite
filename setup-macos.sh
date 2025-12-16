#!/bin/bash

# Wave Studio Admin Dashboard - macOS Setup Script
# Complete installation and setup for macOS
# Usage: ./setup-macos.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Welcome banner
clear
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   Wave Studio Admin Dashboard - macOS Setup Script       ║"
echo "║   Production-Ready Full-Stack Application                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}✗ This script is for macOS only${NC}"
    exit 1
fi

echo -e "${YELLOW}Starting setup for macOS...${NC}\n"

# ============================================================================
# 1. CHECK PREREQUISITES
# ============================================================================
echo -e "${BLUE}[1/8] Checking prerequisites...${NC}"

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}→ Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo -e "${GREEN}✓ Homebrew already installed${NC}"
fi

# Update Homebrew
echo -e "${YELLOW}→ Updating Homebrew...${NC}"
brew update

# ============================================================================
# 2. INSTALL NODE.JS AND NPM
# ============================================================================
echo -e "${BLUE}[2/8] Installing Node.js and npm...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}→ Installing Node.js 18+...${NC}"
    brew install node
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js already installed: $NODE_VERSION${NC}"
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm version: $NPM_VERSION${NC}"

# ============================================================================
# 3. INSTALL POSTGRESQL
# ============================================================================
echo -e "${BLUE}[3/8] Installing PostgreSQL...${NC}"

if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}→ Installing PostgreSQL...${NC}"
    brew install postgresql@15
    brew services start postgresql@15
    echo -e "${GREEN}✓ PostgreSQL started${NC}"
else
    PSQL_VERSION=$(psql --version)
    echo -e "${GREEN}✓ PostgreSQL already installed: $PSQL_VERSION${NC}"
fi

# ============================================================================
# 4. CREATE DATABASE
# ============================================================================
echo -e "${BLUE}[4/8] Setting up database...${NC}"

# Wait for PostgreSQL to start
sleep 2

# Create database and user
echo -e "${YELLOW}→ Creating database and user...${NC}"
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'wave_studio'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE wave_studio;"
echo -e "${GREEN}✓ Database created/verified${NC}"

# ============================================================================
# 5. BACKEND SETUP
# ============================================================================
echo -e "${BLUE}[5/8] Setting up Backend...${NC}"

if [ ! -d "backend" ]; then
    echo -e "${RED}✗ Backend directory not found${NC}"
    exit 1
fi

cd backend
echo -e "${YELLOW}→ Installing backend dependencies...${NC}"
npm install

# Create .env file
echo -e "${YELLOW}→ Creating .env file...${NC}"
cat > .env << EOF
# Backend Environment Configuration
NODE_ENV=development
API_PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wave_studio
DB_USER=postgres
DB_PASSWORD=
DB_DIALECT=postgres

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
EOF

echo -e "${GREEN}✓ .env file created${NC}"

cd ..

# ============================================================================
# 6. FRONTEND SETUP
# ============================================================================
echo -e "${BLUE}[6/8] Setting up Frontend...${NC}"

if [ ! -d "frontend" ]; then
    echo -e "${RED}✗ Frontend directory not found${NC}"
    exit 1
fi

cd frontend
echo -e "${YELLOW}→ Installing frontend dependencies...${NC}"
npm install

# Create .env.local file
echo -e "${YELLOW}→ Creating .env.local file...${NC}"
cat > .env.local << EOF
# Frontend Environment Configuration
VITE_API_BASE_URL=http://localhost:5000/api
EOF

echo -e "${GREEN}✓ .env.local file created${NC}"

cd ..

# ============================================================================
# 7. INSTALL GIT HOOKS (Optional)
# ============================================================================
echo -e "${BLUE}[7/8] Setting up Git hooks...${NC}"

mkdir -p .git/hooks

cat > .git/hooks/pre-commit << 'HOOK'
#!/bin/bash
echo "Running pre-commit checks..."

# Check for console.log in backend
if grep -r "console.log" backend/src --include="*.js" 2>/dev/null; then
    echo "⚠ Warning: console.log found in backend"
fi

echo "✓ Pre-commit checks passed"
HOOK

chmod +x .git/hooks/pre-commit
echo -e "${GREEN}✓ Git hooks installed${NC}"

# ============================================================================
# 8. CREATE START SCRIPTS
# ============================================================================
echo -e "${BLUE}[8/8] Creating start scripts...${NC}"

# Backend start script
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Wave Studio Backend..."
echo "Server will run on http://localhost:5000"
echo "API Documentation: http://localhost:5000/api/docs"
echo ""
echo "Demo Credentials:"
echo "Username: admin"
echo "Password: Admin123456"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
cd backend
npm start
EOF

chmod +x start-backend.sh

# Frontend start script
cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Wave Studio Frontend..."
echo "Dashboard will open at http://localhost:5173"
echo ""
echo "Demo Credentials:"
echo "Username: admin"
echo "Password: Admin123456"
echo ""
echo "Press Ctrl+C to stop the dev server"
echo ""
cd frontend
npm run dev
EOF

chmod +x start-frontend.sh

# Full stack start script
cat > start-all.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Wave Studio Admin Dashboard (Full Stack)..."
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "📦 Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 2
fi

echo "🔧 Starting Backend on port 5000..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

sleep 3

echo "📱 Starting Frontend on port 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

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
echo "Press Ctrl+C to stop all services"
echo ""

# Keep the script running
wait
EOF

chmod +x start-all.sh

echo -e "${GREEN}✓ Start scripts created${NC}"

# ============================================================================
# COMPLETION
# ============================================================================
clear
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           ✅ Setup Complete! Ready to Start              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1️⃣  Start the full stack (Backend + Frontend):"
echo -e "   ${YELLOW}./start-all.sh${NC}"
echo ""
echo "2️⃣  Or start services separately:"
echo -e "   ${YELLOW}./start-backend.sh${NC}  (Terminal 1)"
echo -e "   ${YELLOW}./start-frontend.sh${NC}  (Terminal 2)"
echo ""
echo "3️⃣  Access the dashboard:"
echo -e "   ${YELLOW}http://localhost:5173${NC}"
echo ""
echo "4️⃣  Login with demo credentials:"
echo -e "   ${YELLOW}Username: admin${NC}"
echo -e "   ${YELLOW}Password: Admin123456${NC}"
echo ""

echo -e "${BLUE}What's Installed:${NC}"
echo "  ✓ Node.js 18+ and npm"
echo "  ✓ PostgreSQL 15"
echo "  ✓ Backend dependencies (Express, Sequelize, etc.)"
echo "  ✓ Frontend dependencies (React 18, Vite, TailwindCSS, etc.)"
echo "  ✓ Environment files (.env, .env.local)"
echo "  ✓ Start scripts for easy development"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo "  Backend:   cd backend && npm run dev"
echo "  Frontend:  cd frontend && npm run dev"
echo "  Build:     cd frontend && npm run build"
echo "  Database:  psql -U postgres -d wave_studio"
echo ""

echo -e "${BLUE}Documentation:${NC}"
echo "  📖 Main README:           README.md"
echo "  📖 API Reference:         docs/API.md"
echo "  📖 Project Status:        FINAL_PROJECT_STATUS.md"
echo "  📖 Frontend Setup:        frontend/README.md"
echo ""

echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
