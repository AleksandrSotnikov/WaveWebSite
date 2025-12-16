#!/bin/bash

# Wave Studio Admin Dashboard - Start Backend Only
# Properly sets PATH for macOS

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

cd "$(dirname "$0")/backend"
npm start
