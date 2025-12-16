#!/bin/bash

# Wave Studio Admin Dashboard - Linux Setup Script
# Complete installation and setup for Linux (Ubuntu/Debian)
# Usage: ./setup-linux.sh

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
echo "║   Wave Studio Admin Dashboard - Linux Setup Script       ║"
echo "║   Production-Ready Full-Stack Application                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${RED}✗ This script is for Linux only${NC}"
    exit 1
fi

# Check if running with sudo
if [[ $EUID -ne 0 ]]; then
    echo -e "${YELLOW}→ Requesting sudo privileges...${NC}"
    sudo "$0" "$@"
    exit $?
fi

echo -e "${YELLOW}Starting setup for Linux...${NC}\n"

# ============================================================================
# 1. UPDATE SYSTEM PACKAGES
# ============================================================================
echo -e "${BLUE}[1/8] Updating system packages...${NC}"

apt-get update
apt-get upgrade -y

echo -e "${GREEN}✓ System packages updated${NC}"

# ============================================================================
# 2. INSTALL BUILD TOOLS
# ============================================================================
echo -e "${BLUE}[2/8] Installing build tools...${NC}"

apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    openssl \
    libssl-dev

echo -e "${GREEN}✓ Build tools installed${NC}"

# ============================================================================
# 3. INSTALL NODE.JS AND NPM
# ============================================================================
echo -e "${BLUE}[3/8] Installing Node.js and npm...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}→ Installing Node.js 18+...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js already installed: $NODE_VERSION${NC}"
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm version: $NPM_VERSION${NC}"

# ============================================================================
# 4. INSTALL POSTGRESQL
# ============================================================================
echo -e "${BLUE}[4/8] Installing PostgreSQL...${NC}"

if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}→ Installing PostgreSQL 15...${NC}"
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    echo -e "${GREEN}✓ PostgreSQL installed and started${NC}"
else
    PSQL_VERSION=$(psql --version)
    echo -e "${GREEN}✓ PostgreSQL already installed: $PSQL_VERSION${NC}"
    systemctl start postgresql
fi

# ============================================================================
# 5. CREATE DATABASE
# ============================================================================
echo -e "${BLUE}[5/8] Setting up database...${NC}"

echo -e "${YELLOW}→ Creating database and user...${NC}"

# Create database
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'wave_studio'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE wave_studio;"

echo -e "${GREEN}✓ Database created/verified${NC}"

# ============================================================================
# 6. SETUP BACKEND
# ============================================================================
echo -e "${BLUE}[6/8] Setting up Backend...${NC}"

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
# 7. SETUP FRONTEND
# ============================================================================
echo -e "${BLUE}[7/8] Setting up Frontend...${NC}"

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
    sudo systemctl start postgresql
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
echo "  ✓ Build tools and dependencies"
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
echo "  PG Status: sudo systemctl status postgresql"
echo ""

echo -e "${BLUE}Troubleshooting:${NC}"
echo "  Port 5000 in use?  sudo lsof -i :5000"
echo "  Port 5173 in use?  sudo lsof -i :5173"
echo "  PostgreSQL down?   sudo systemctl restart postgresql"
echo ""

echo -e "${BLUE}Documentation:${NC}"
echo "  📖 Main README:           README.md"
echo "  📖 API Reference:         docs/API.md"
echo "  📖 Project Status:        FINAL_PROJECT_STATUS.md"
echo "  📖 Frontend Setup:        frontend/README.md"
echo ""

echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
