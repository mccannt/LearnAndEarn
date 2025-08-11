@echo off
REM Learn & Earn Educational App Setup Script for Windows

echo 🎓 Learn & Earn - Educational App Setup
echo ======================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Set up database
echo 🗄️ Setting up database...
npm run db:push
npm run db:generate

REM Get local IP address
echo 🌐 Getting network information...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
    )
)

echo ✅ Setup complete!
echo.
echo 🚀 How to use your app:
echo.
echo 1. Development mode ^(for testing^):
echo    npm run dev
echo    Then open: http://localhost:3000
echo.
echo 2. Production mode ^(for tablet use^):
echo    npm run build
echo    npm start
echo    Then on your tablet, open: http://%LOCAL_IP%:3000
echo.
echo 3. Add to tablet home screen:
echo    - Open the app URL in your tablet's browser
echo    - Tap the share button
echo    - Select 'Add to Home Screen'
echo    - Name it 'Learn & Earn'
echo.
echo 🔐 Parent Dashboard:
echo    - Default password: parent123
echo    - Access from the main page
echo.
echo 📱 Tablet Optimization Tips:
echo    - Use Chrome or Safari browser
echo    - Enable full-screen mode
echo    - Connect to the same Wi-Fi network as your computer
echo.
echo 🎉 Happy learning!
pause