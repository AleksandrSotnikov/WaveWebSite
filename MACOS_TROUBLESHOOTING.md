# 🚄 Quick Fix - macOS Setup Script Issues

## Problem Encountered

```
./setup-macos.sh: line 48: brew: command not found
zsh: no such file or directory: ./start-all.sh
```

## Issues Fixed

### Issue 1: Homebrew PATH not found after installation
**Cause:** Homebrew installs to different locations:
- Apple Silicon (M1/M2): `/opt/homebrew/bin`
- Intel Mac: `/usr/local/bin`

**Fix:** Updated script now:
- ✅ Detects Mac architecture (Apple Silicon vs Intel)
- ✅ Sets correct Homebrew path
- ✅ Adds path to environment
- ✅ Waits for PostgreSQL to start (30 seconds max)

### Issue 2: start-all.sh not found
**Cause:** Script not created yet (setup incomplete)

**Fix:** Script now creates all 3 start scripts at the end

## Updated Instructions

### Step 1: Remove old setup script
```bash
cd WaveWebSite
rm setup-macos.sh start-*.sh
```

### Step 2: Download updated script
```bash
git pull origin main
```

### Step 3: Run the fixed setup
```bash
chmod +x setup-macos.sh
./setup-macos.sh
```

### Step 4: Wait for completion
The script will:
- ✅ Detect your Mac architecture
- ✅ Install Homebrew (if needed)
- ✅ Install Node.js
- ✅ Install PostgreSQL
- ✅ Create database
- ✅ Install dependencies
- ✅ Create start scripts
- ✅ Show completion message

### Step 5: Start the app
```bash
./start-all.sh
```

## What Changed in setup-macos.sh

1. **Better Homebrew detection:**
   ```bash
   if [[ $(uname -m) == "arm64" ]]; then
       HOMEBREW_PREFIX="/opt/homebrew"  # M1/M2
   else
       HOMEBREW_PREFIX="/usr/local"     # Intel
   fi
   ```

2. **Proper PATH handling:**
   ```bash
   export PATH="$HOMEBREW_PREFIX/bin:$PATH"
   ```

3. **PostgreSQL startup verification:**
   ```bash
   for i in {1..30}; do
       if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
           break
       fi
       sleep 1
   done
   ```

4. **Fixed relative paths in start scripts:**
   ```bash
   cd "$(dirname "$0")/backend"
   ```

## If it still doesn't work

### Option 1: Manual Homebrew installation
```bash
# Install Homebrew manually
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add to PATH (Apple Silicon)
echo 'export PATH=/opt/homebrew/bin:$PATH' >> ~/.zprofile
source ~/.zprofile

# Verify
brew --version

# Then run setup
./setup-macos.sh
```

### Option 2: Install each tool manually
```bash
# Install Node.js
brew install node

# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Create database
creatdb wave_studio

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Create .env files manually
cd ../backend
cat > .env << EOF
NODE_ENV=development
API_PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wave_studio
DB_USER=postgres
DB_PASSWORD=
DB_DIALECT=postgres
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
EOF

cd ../frontend
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:5000/api
EOF
```

## Verification Commands

Test if everything is installed:

```bash
# Check Homebrew
brew --version

# Check Node.js
node -v
npm -v

# Check PostgreSQL
psql --version
pg_isready

# Check database
psql -U postgres -l | grep wave_studio

# Check backend
cd backend && npm list | head -20

# Check frontend
cd frontend && npm list | head -20
```

## Start the app

Once everything is installed:

```bash
# Full stack
./start-all.sh

# Or separately
./start-backend.sh   # Terminal 1
./start-frontend.sh  # Terminal 2
```

Access at: http://localhost:5173

Login: admin / Admin123456

---

**If you still have issues, check the error message and run:**
```bash
bash -x ./setup-macos.sh
```

This will show exactly where it fails.
