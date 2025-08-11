# 🎓 Learn & Earn - Educational Game for Kids

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

A fun, gamified educational app where kids learn math and English while earning rewards for screen time and Roblox credits. Built with Next.js, TypeScript, and designed specifically for tablet use.

## ✨ Features

### 🎮 For Kids
- **Math Learning**: Multiplication and division practice with adaptive difficulty
- **English Learning**: Grammar, vocabulary, and reading comprehension exercises
- **Avatar Customization**: Dress To Impress-inspired character customization
- **Reward System**: Earn points for correct answers and completed sessions
- **Visual Progress**: Track learning progress with engaging charts and statistics
- **Tablet Optimized**: Touch-friendly interface designed for tablets

### 👨‍👩‍👧‍👦 For Parents
- **Password-Protected Dashboard**: Secure parent access with default password `parent123`
- **Time Management**: Set daily/weekly learning session limits
- **Progress Monitoring**: Detailed performance reports and analytics
- **Reward Management**: Track and approve screen time and Roblox credit rewards
- **Customization**: Adjust learning difficulty and reward values
- **Safe Environment**: No external links, ads, or data collection

### 🏆 Reward System
- **1 Correct Answer** = 1 Point
- **100 Points** = 15 minutes screen time
- **200 Points** = $5 Roblox credit
- **500 Points** = 1 hour screen time + $10 Roblox credit
- **Session Completion** = 50 bonus points

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/learn-and-earn.git
cd learn-and-earn

# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📱 Tablet Setup

### Home Network Access
```bash
# Get your computer's IP address
ipconfig  # Windows
ifconfig  # Mac/Linux

# Start production server
npm start

# Access from tablet: http://YOUR_IP:3000
```

### Add to Home Screen
1. Open the app URL in your tablet's browser
2. Tap the share button
3. Select "Add to Home Screen"
4. Name it "Learn & Earn"

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Database**: SQLite with Prisma ORM
- **State Management**: React hooks and local state
- **Authentication**: Custom password protection for parent dashboard

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main landing page
│   ├── math/              # Math learning module
│   ├── english/           # English learning module
│   ├── avatar/            # Avatar customization
│   ├── rewards/           # Reward tracking
│   ├── progress/          # Progress statistics
│   └── parent/            # Parent dashboard
├── components/ui/         # shadcn/ui components
├── hooks/                 # Custom React hooks
└── lib/                   # Utilities and database
```

### Database Schema
- **Child**: User profile and learning preferences
- **Parent**: Account and dashboard settings
- **LearningSession**: Track all learning activities
- **Progress**: Individual skill progress tracking
- **Rewards**: Point system and redemption history
- **AvatarItem**: Customization options and unlocked items
- **Settings**: Application configuration
- **MathQuestion/EnglishQuestion**: Question banks and difficulty levels

## 🚢 Deployment Options

### Local Development
- **Development Server**: `npm run dev`
- **Hot Reload**: Automatic code refresh
- **Debug Mode**: Detailed error reporting

### Production
- **Standalone Server**: `npm run build && npm start`
- **Systemd Service**: Auto-restart on failure
- **Nginx Reverse Proxy**: SSL termination and load balancing

### Docker
```bash
# Build and run with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Proxmox LXC
```bash
# Direct installation
./lxc-install.sh

# Docker installation
./lxc-docker-install.sh
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="file:./dev.db"
```

### Parent Dashboard
- **Default Password**: `parent123`
- **Access**: Click "Parent Dashboard" on main page
- **Features**: Time limits, progress monitoring, reward management

### Learning Settings
- **Session Duration**: 15, 30, or 45 minutes
- **Difficulty Levels**: Adjustable based on child's progress
- **Topics**: Customizable math and English subjects

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Application Logs
```bash
# Development logs
npm run dev

# Production logs
journalctl -u learnandearn -f

# Docker logs
docker-compose logs -f
```

### Performance Metrics
- **Response Time**: < 100ms for API calls
- **Database Queries**: Optimized with Prisma
- **Memory Usage**: < 512MB for production
- **CPU Usage**: < 50% under normal load

## 🔒 Security

### Application Security
- **Password Protection**: Parent dashboard secured
- **No External Links**: Safe environment for kids
- **Local Data Storage**: No cloud data collection
- **Session Timeout**: Automatic logout after inactivity

### Network Security
- **HTTPS Ready**: SSL certificate support
- **Firewall Configuration**: Port access control
- **Rate Limiting**: Prevent abuse
- **CORS Protection**: Secure API access

## 🛠️ Development

### Adding New Features
1. **Database Changes**: Update `prisma/schema.prisma`
2. **Run Migration**: `npm run db:push`
3. **Create Components**: Use shadcn/ui components
4. **Add Routes**: Create pages in `src/app/`
5. **Update State**: Use React hooks for state management

### Code Style
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting (recommended)
- **Component Structure**: Follow existing patterns

### Testing
```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build verification
npm run build
```

## 📚 Documentation

- [Quick Start Guide](QUICK_START.md) - 5-minute setup
- [Packaging Guide](PACKAGING_GUIDE.md) - Deployment options
- [Proxmox Setup](PROXMOX_SETUP.md) - LXC container deployment
- [LXC Deployment](LXC_DEPLOYMENT_COMPLETE.md) - Complete deployment guide

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Commit your changes**: `git commit -am 'Add new feature'`
4. **Push to the branch**: `git push origin feature/new-feature`
5. **Submit a pull request**

### Development Guidelines
- Follow the existing code style
- Add TypeScript types for new features
- Include tests for new functionality
- Update documentation for changes
- Ensure all builds pass

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Database Issues
```bash
# Reset database
npm run db:reset
npm run db:generate
```

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Getting Help
- **Documentation**: Check the guides in the repository
- **Issues**: Create an issue on GitHub with detailed description
- **Discussions**: Join community discussions for questions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the excellent framework
- **shadcn/ui**: For the beautiful component library
- **Prisma**: For the modern ORM
- **Tailwind CSS**: For the utility-first CSS framework

## 📞 Support

For support, questions, or feature requests:
- Create an [issue](https://github.com/your-username/learn-and-earn/issues)
- Check the [documentation](docs/)
- Join community discussions

---

Built with ❤️ for making learning fun and rewarding for kids! 🎓✨