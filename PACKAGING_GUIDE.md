# 📚 Learn & Earn - Educational App Packaging Guide

## 🎯 Overview
This guide will help you package and deploy your educational app for your 9-year-old daughter. The app includes math (multiplication/division) and English (grammar/reading comprehension) learning modules with a reward system for screen time and Roblox credits.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
# Push the database schema
npm run db:push

# Generate Prisma client
npm run db:generate
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access the App
Open your browser and go to `http://localhost:3000`

## 📱 Device Setup for Tablet Use

### Recommended Browsers
- **Chrome** (Recommended)
- **Safari** (iPad)
- **Firefox**

### Tablet Optimization Tips
1. **Add to Home Screen** (iOS):
   - Open Safari and go to `http://localhost:3000`
   - Tap the share button
   - Select "Add to Home Screen"
   - Name it "Learn & Earn"

2. **Browser Settings**:
   - Enable full-screen mode
   - Disable pop-up blockers
   - Allow local storage

## 🔧 Production Deployment Options

### Option 1: Local Network Access (Recommended for Home Use)

#### Step 1: Find Your Local IP
```bash
# On Windows
ipconfig

# On Mac/Linux
ifconfig | grep "inet "
```

#### Step 2: Update Server Configuration
Edit `server.ts`:
```typescript
const hostname = '0.0.0.0';  // Allows network access
const currentPort = 3000;
```

#### Step 3: Build and Start
```bash
# Build the application
npm run build

# Start production server
npm start
```

#### Step 4: Access from Tablet
- On your tablet, open browser and go to: `http://YOUR_LOCAL_IP:3000`
- Example: `http://192.168.1.100:3000`

### Option 2: Cloud Deployment (Vercel - Free)

#### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: Deploy to Vercel
```bash
vercel
```

#### Step 3: Configure Environment Variables
In Vercel dashboard, add:
- `DATABASE_URL` (your database connection string)

### Option 3: Docker Container

#### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### Step 2: Build and Run
```bash
docker build -t learn-and-earn .
docker run -p 3000:3000 learn-and-earn
```

## 🎮 App Features Overview

### Child Interface
- **Math Learning**: Multiplication and division practice
- **English Learning**: Grammar, vocabulary, reading comprehension
- **Avatar Customization**: Dress To Impress-inspired character
- **Rewards Dashboard**: Track earned screen time and Roblox credits
- **Progress Tracking**: Visual progress bars and statistics

### Parent Interface
- **Password Protected**: Secure parent dashboard
- **Session Controls**: Set daily/weekly time limits
- **Progress Analytics**: Detailed performance reports
- **Reward Management**: Track and approve rewards
- **Settings**: Customize learning difficulty and topics

## 🏆 Reward System Setup

### How Rewards Work
1. **Correct Answers**: Earn 1 point per correct answer
2. **Session Completion**: Bonus points for completing sessions
3. **Streak Bonuses**: Extra points for consecutive days

### Reward Conversion
- **100 points** = 15 minutes screen time
- **200 points** = $5 Roblox credit
- **500 points** = 1 hour screen time + $10 Roblox credit

### Manual Reward Tracking
Parents can:
- View earned points in real-time
- Approve reward redemptions
- Set custom reward values
- Track reward history

## 📊 Data Management

### Database Backup
```bash
# Backup SQLite database
cp db/custom.db backup/custom-$(date +%Y%m%d).db
```

### Data Export
The app includes export functionality for:
- Progress reports
- Reward history
- Session statistics

## 🔒 Security Considerations

### Parent Dashboard Protection
- Default password: `parent123` (change in settings)
- Encrypted password storage
- Session timeout after 5 minutes

### Child Safety
- No external links or ads
- No personal information collection
- All data stored locally

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Reset database
npm run db:reset

# Regenerate client
npm run db:generate
```

#### 2. Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### 3. Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### 4. Tablet Connection Issues
- Ensure both devices are on the same Wi-Fi network
- Check firewall settings
- Verify local IP address

## 📈 Performance Optimization

### For Better Performance
1. **Enable Caching**: Browser caching is automatically configured
2. **Image Optimization**: Uses Next.js Image component
3. **Code Splitting**: Automatic with Next.js
4. **Database Indexing**: Prisma handles optimization

### Tablet-Specific Optimizations
- Touch-friendly buttons (minimum 44px)
- Responsive design for all tablet sizes
- Offline capability for basic features

## 🎨 Customization Guide

### Change Colors and Theme
Edit `src/app/globals.css`:
```css
:root {
  --primary: 256, 66, 123;  /* Pink */
  --secondary: 255, 159, 64; /* Orange */
  --accent: 72, 187, 120;    /* Green */
}
```

### Add Custom Learning Topics
1. Update database schema in `prisma/schema.prisma`
2. Add question types to relevant pages
3. Update question banks

### Modify Reward Values
Edit the reward calculation in:
- `src/app/math/page.tsx`
- `src/app/english/page.tsx`

## 📞 Support and Maintenance

### Regular Updates
- Check for dependency updates: `npm outdated`
- Update packages: `npm update`
- Run tests: `npm test` (if tests are added)

### Monitoring
- Check server logs: `tail -f server.log`
- Monitor database performance
- Track user engagement metrics

## 🎉 Next Steps

1. **Test with Your Daughter**: Have her try the app and provide feedback
2. **Customize Difficulty**: Adjust question difficulty based on her level
3. **Set Up Parent Account**: Create your parent account and set preferences
4. **Establish Routine**: Set a regular learning schedule
5. **Monitor Progress**: Use the parent dashboard to track improvement

---

## 📋 Final Checklist

- [ ] Dependencies installed
- [ ] Database set up and migrated
- [ ] Development server running
- [ ] Tablet can access the app
- [ ] Parent account created
- [ ] Reward system configured
- [ ] Time limits set
- [ ] Test session completed
- [ ] Avatar customization working
- [ ] Progress tracking functional

Your educational app is now ready to use! 🎉

Built with ❤️ for your daughter's learning journey.