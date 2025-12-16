# 🚀 Installation Guide - Wave Studio Admin Dashboard

Complete installation instructions for all operating systems.

---

## 🌟 Quick Installation

### macOS (One Command)

```bash
# Clone the repository
git clone https://github.com/AleksandrSotnikov/WaveWebSite.git
cd WaveWebSite

# Run the setup script
chmod +x setup-macos.sh
./setup-macos.sh

# After setup completes, run:
./start-all.sh
```

### Linux / Ubuntu / Debian (One Command)

```bash
# Clone the repository
git clone https://github.com/AleksandrSotnikov/WaveWebSite.git
cd WaveWebSite

# Run the setup script (requires sudo)
chmod +x setup-linux.sh
sudo ./setup-linux.sh

# After setup completes, run:
./start-all.sh
```

### Windows (Manual Setup)

See [Windows Manual Setup](#windows-manual-setup) section below.

---

## 🔧 What the Setup Scripts Do

### setup-macos.sh

1. ✅ Checks and installs Homebrew (macOS package manager)
2. ✅ Installs Node.js 18+ and npm
3. ✅ Installs PostgreSQL 15
4. ✅ Creates wave_studio database
5. ✅ Installs backend dependencies
6. ✅ Installs frontend dependencies
7. ✅ Creates environment files (.env, .env.local)
8. ✅ Creates start scripts
9. ✅ Generates comprehensive setup guide

### setup-linux.sh

Same as macOS, plus:

1. ✅ Updates system packages (apt-get)
2. ✅ Installs build tools and dependencies
3. ✅ Manages PostgreSQL via systemctl
4. ✅ Includes troubleshooting guide

---

## 🎶 Starting the Application

After setup is complete, you have three options:

### Option 1: Start Everything (Recommended)

```bash
./start-all.sh
```

This will:
- Start PostgreSQL (if not running)
- Start backend server on port 5000
- Start frontend dev server on port 5173
- Open dashboard in browser

### Option 2: Start Services Separately

In Terminal 1:
```bash
./start-backend.sh
```

In Terminal 2:
```bash
./start-frontend.sh
```

### Option 3: Manual Start

In Terminal 1:
```bash
cd backend
npm start
```

In Terminal 2:
```bash
cd frontend
npm run dev
```

---

## 🌐 Access the Dashboard

After starting, access:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **API Docs:** http://localhost:5000/docs

### Demo Credentials

```
Username: admin
Password: Admin123456
```

---

## 👨‍💻 Windows Manual Setup

### Prerequisites

1. **Install Node.js 18+**
   - Download from https://nodejs.org/
   - Choose LTS version
   - Run installer and follow steps

2. **Install PostgreSQL 15**
   - Download from https://www.postgresql.org/download/windows/
   - Run installer
   - Remember the password for postgres user
   - PostgreSQL service will start automatically

3. **Install Git (if not installed)**
   - Download from https://git-scm.com/download/win
   - Run installer with default settings

### Clone Repository

```powershell
# In Command Prompt or PowerShell
git clone https://github.com/AleksandrSotnikov/WaveWebSite.git
cd WaveWebSite
```

### Create Database

1. Open pgAdmin 4 (installed with PostgreSQL)
2. Connect to server with postgres user
3. Right-click "Databases" → Create → Database
4. Name: `wave_studio`
5. Click "Save"

### Setup Backend

```powershell
cd backend
npm install

# Create .env file
# Copy the content below into .env file
```

Create `backend/.env`:

```
NODE_ENV=development
API_PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wave_studio
DB_USER=postgres
DB_PASSWORD=[your-postgres-password]
DB_DIALECT=postgres
JWT_SECRET=[generate-random-32-char-secret]
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### Setup Frontend

```powershell
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Start Services

In Command Prompt 1:
```powershell
cd backend
npm start
```

In Command Prompt 2:
```powershell
cd frontend
npm run dev
```

Then open browser and go to http://localhost:5173

---

## 📃 Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=development          # development or production
API_PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wave_studio
DB_USER=postgres
DB_PASSWORD=
DB_DIALECT=postgres

# JWT
JWT_SECRET=your-32-char-min-secret-key
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

### Frontend (.env.local)

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📃 Troubleshooting

### Port Already in Use

**macOS/Linux:**
```bash
# Find process using port 5000
lsof -i :5000

# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 [PID]
```

**Windows:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID [PID] /F
```

### PostgreSQL Connection Error

1. Verify PostgreSQL is running
   - macOS: `brew services list` should show postgresql running
   - Linux: `sudo systemctl status postgresql`
   - Windows: Check Services app

2. Check connection settings in `.env`
   - DB_HOST should be `localhost` or `127.0.0.1`
   - DB_PORT default is `5432`
   - DB_NAME should be `wave_studio`

3. Verify database exists
   ```bash
   psql -U postgres -l | grep wave_studio
   ```

### npm install Fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Frontend Won't Build

```bash
cd frontend

# Clear Vite cache
rm -rf dist .vite

# Rebuild
npm run build
```

---

## 🚠 Production Deployment

### Backend Production

```bash
cd backend

# Install production dependencies only
npm install --production

# Build
npm run build

# Start production server
NODE_ENV=production node src/index.js
```

### Frontend Production Build

```bash
cd frontend

# Build for production
npm run build

# Output: dist/ folder
# Serve with nginx, Apache, or any static server
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📖 Useful Commands

### Backend

```bash
cd backend

# Development with auto-reload
npm run dev

# Production
npm start

# Run tests
npm test

# Database migrations
npm run migrate

# Seed database
npm run seed
```

### Frontend

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

### Database

```bash
# Connect to database
psql -U postgres -d wave_studio

# List databases
\l

# List tables
\dt

# Backup database
pg_dump -U postgres -d wave_studio -f backup.sql

# Restore database
psql -U postgres -d wave_studio -f backup.sql
```

---

## 📄 Documentation

- **README.md** - Main project overview
- **docs/API.md** - Complete API reference
- **FINAL_PROJECT_STATUS.md** - Project status and statistics
- **frontend/README.md** - Frontend-specific guide

---

## 🚀 Next Steps

1. ✅ Run setup script for your OS
2. ✅ Start the application
3. ✅ Login with demo credentials
4. ✅ Explore the dashboard
5. ✅ Read API documentation
6. ✅ Customize for your needs

---

## 📞 Support

For issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review error messages in terminal
3. Check documentation files
4. Open GitHub issue with error details

---

**Happy coding! 🚀**

Wave Studio Admin Dashboard is ready to use!
