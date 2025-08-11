# 🚀 Quick Start Guide - Learn & Earn Educational App

## ⚡ 5-Minute Setup

### 1. Install & Run
```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Start the app
npm run dev
```

### 2. Open the App
Go to: `http://localhost:3000`

### 3. For Tablet Use
```bash
# Build for production
npm run build

# Start production server
npm start

# On tablet, open: http://YOUR_COMPUTER_IP:3000
# (Find your IP: run `ipconfig` on Windows or `ifconfig` on Mac)
```

## 🎮 How to Use

### For Your Daughter (Child Mode)
1. **Select Learning Mode**: Choose Math or English
2. **Set Session Time**: Pick 15, 30, or 45 minutes
3. **Start Learning**: Answer questions to earn points
4. **Customize Avatar**: Use earned points to dress up character
5. **Track Rewards**: See screen time and Roblox credits earned

### For You (Parent Mode)
1. **Access Parent Dashboard**: Click "Parent Dashboard" on main page
2. **Enter Password**: Default is `parent123`
3. **Set Limits**: Configure daily/weekly time limits
4. **Monitor Progress**: View detailed performance reports
5. **Manage Rewards**: Approve reward redemptions

## 🏆 Reward System

- **1 Correct Answer** = 1 Point
- **100 Points** = 15 minutes screen time
- **200 Points** = $5 Roblox credit
- **Complete Session** = Bonus 50 points

## 📱 Tablet Setup

1. **Connect to Same Wi-Fi**: Tablet and computer on same network
2. **Open Browser**: Chrome or Safari recommended
3. **Enter URL**: `http://YOUR_COMPUTER_IP:3000`
4. **Add to Home Screen**: 
   - Tap share button
   - Select "Add to Home Screen"
   - Name it "Learn & Earn"

## 🔧 Common Issues

**Port Already in Use?**
```bash
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -i :3000
kill -9 <PID>
```

**Database Issues?**
```bash
npm run db:reset
npm run db:generate
```

## 🎉 Ready to Learn!

Your educational app is now ready! Your daughter can:
- Practice multiplication and division
- Improve grammar and reading comprehension
- Earn rewards for screen time and Roblox
- Customize her avatar
- Track her progress

You can:
- Monitor her learning progress
- Set appropriate time limits
- Manage the reward system
- Customize difficulty levels

Happy learning! 🎓✨