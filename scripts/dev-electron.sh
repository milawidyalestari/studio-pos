#!/bin/bash

# Studio POS Electron Development Script
# macOS/Linux version

echo "🚀 Starting Studio POS Electron Development..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    read -p "Press Enter to exit"
    exit 1
fi

echo "📦 Installing dependencies if needed..."
npm install

echo ""
echo "🔧 Starting Vite dev server..."

# Start Vite dev server in background
npm run dev:electron &
VITE_PID=$!

echo ""
echo "⏳ Waiting for Vite server to start..."
sleep 5

echo ""
echo "⚡ Starting Electron app..."

# Start Electron app
npm run electron:dev:hot

echo ""
echo "🛑 Stopping Vite dev server..."
kill $VITE_PID

echo "✅ Development session ended!"
