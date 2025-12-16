#!/bin/bash

# Wave Studio Admin Dashboard - Start Frontend Only
# Properly sets PATH for macOS

echo "🚀 Starting Wave Studio Frontend..."
echo "Dashboard will open at http://localhost:5173"
echo ""
echo "Demo Credentials:"
echo "Username: admin"
echo "Password: Admin123456"
echo ""
echo "Press Ctrl+C to stop the dev server"
echo ""

# Setup PATH for Homebrew
if [[ $(uname -m) == "arm64" ]]; then
    export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"
else
    export PATH="/usr/local/bin:/usr/local/sbin:$PATH"
fi

# Source nvm if available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
fi

cd "$(dirname "$0")/frontend"
npm run dev
