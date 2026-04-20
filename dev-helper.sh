#!/bin/bash

# Development server helper script
echo "🧹 Cleaning up any existing processes on port 3000..."

# Kill any processes using port 3000
lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true

# Wait a moment for cleanup
sleep 1

echo "🚀 Starting development server..."
npm run dev 