#!/bin/bash

# Learn & Earn Educational App Setup Script
# This script helps you set up the app for local or network use

echo "🎓 Learn & Earn - Educational App Setup"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up database
echo "🗄️ Setting up database..."
npm run db:push
npm run db:generate

# Get local IP address
echo "🌐 Getting network information..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    # Windows (assuming Git Bash)
    LOCAL_IP=$(ipconfig | grep "IPv4" | awk '{print $14}' | head -n 1)
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 How to use your app:"
echo ""
echo "1. Development mode (for testing):"
echo "   npm run dev"
echo "   Then open: http://localhost:3000"
echo ""
echo "2. Production mode (for tablet use):"
echo "   npm run build"
echo "   npm start"
echo "   Then on your tablet, open: http://$LOCAL_IP:3000"
echo ""
echo "3. Add to tablet home screen:"
echo "   - Open the app URL in your tablet's browser"
echo "   - Tap the share button"
echo "   - Select 'Add to Home Screen'"
echo "   - Name it 'Learn & Earn'"
echo ""
echo "🔐 Parent Dashboard:"
echo "   - Default password: parent123"
echo "   - Access from the main page"
echo ""
echo "📱 Tablet Optimization Tips:"
echo "   - Use Chrome or Safari browser"
echo "   - Enable full-screen mode"
echo "   - Connect to the same Wi-Fi network as your computer"
echo ""
echo "🎉 Happy learning!"