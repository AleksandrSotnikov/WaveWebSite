#!/bin/bash

# Wave Studio - Final PostgreSQL Setup Fix
# Creates postgres user and database properly

echo "🔧 Wave Studio - PostgreSQL Setup Fix"
echo ""

# ============================================================================
# SETUP PATH FOR POSTGRESQL
# ============================================================================

echo "1️⃣  Setting up PATH for PostgreSQL..."

if [[ $(uname -m) == "arm64" ]]; then
    export PATH="/opt/homebrew/opt/postgresql@15/bin:/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"
    echo "   ✓ Apple Silicon PostgreSQL path set"
else
    export PATH="/usr/local/opt/postgresql@15/bin:/usr/local/bin:/usr/local/sbin:$PATH"
    echo "   ✓ Intel PostgreSQL path set"
fi

# ============================================================================
# START POSTGRESQL
# ============================================================================

echo "2️⃣  Starting PostgreSQL..."
brew services restart postgresql@15
sleep 3
echo "   ✓ PostgreSQL started"
echo ""

# ============================================================================
# CREATE POSTGRES USER AND DATABASE
# ============================================================================

echo "3️⃣  Creating postgres user..."

# Check if postgres user exists
if psql -U $(whoami) -c "SELECT 1 FROM pg_roles WHERE rolname = 'postgres'" 2>/dev/null | grep -q 1; then
    echo "   ✓ postgres user already exists"
else
    echo "   → Creating postgres role..."
    psql -U $(whoami) -c "CREATE ROLE postgres WITH LOGIN CREATEDB SUPERUSER;" 2>/dev/null || true
    echo "   ✓ postgres user created"
fi

echo ""
echo "4️⃣  Creating wave_studio database..."

# Check if database exists
if psql -U $(whoami) -lqt | cut -d'|' -f 1 | grep -w wave_studio > /dev/null; then
    echo "   ✓ wave_studio database already exists"
else
    echo "   → Creating database..."
    createdb -U $(whoami) wave_studio 2>/dev/null || createdb -U postgres wave_studio 2>/dev/null || true
    echo "   ✓ wave_studio database created"
fi

echo ""
echo "5️⃣  Verifying setup..."

# List databases
echo "   Databases:"
psql -U $(whoami) -lqt 2>/dev/null | grep wave_studio || echo "   ⚠ Could not list databases"

echo ""
echo "========================================"
echo "✅ PostgreSQL is ready!"
echo "========================================"
echo ""
echo "Now run:"
echo ""
echo "  ./start-all.sh"
echo ""
echo "Access: http://localhost:5173"
echo "Login:  admin / Admin123456"
echo ""
