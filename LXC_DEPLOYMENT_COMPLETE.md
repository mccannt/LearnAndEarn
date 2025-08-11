# 🎉 Complete LXC Deployment Package for Proxmox

## 📦 What's Included

I've created a complete deployment package for your Learn & Earn educational app that can be easily installed on a Proxmox LXC container. Here's everything you need:

### 🚀 Installation Scripts

#### 1. **Direct Installation Script** (`lxc-install.sh`)
- **Best for**: Simple, straightforward deployment
- **Features**:
  - Automatic Node.js installation
  - Systemd service management
  - Built-in Nginx reverse proxy
  - Firewall configuration
  - Easy management commands

#### 2. **Docker Installation Script** (`lxc-docker-install.sh`)
- **Best for**: Advanced users, easy updates
- **Features**:
  - Docker containerization
  - Built-in backup system
  - Easy rollbacks
  - Isolated environment
  - Container management tools

### 🐳 Docker Configuration

#### **Dockerfile**
- Multi-stage build for optimization
- Alpine Linux base for small size
- Health checks included
- Security-hardened user setup

#### **docker-compose.yml**
- Complete container orchestration
- Network configuration
- Volume management for persistence
- Health monitoring
- Optional Nginx proxy

#### **nginx.conf**
- Production-ready Nginx configuration
- Reverse proxy setup
- Security headers
- Gzip compression
- SSL-ready (add your certificates)

### 📚 Documentation

#### **PROXMOX_SETUP.md**
- Complete step-by-step setup guide
- LXC container creation instructions
- Network configuration
- Troubleshooting section
- Performance optimization tips

#### **PACKAGING_GUIDE.md**
- General packaging and deployment guide
- Multiple deployment options
- Tablet setup instructions
- Security considerations

#### **QUICK_START.md**
- 5-minute quick start guide
- Immediate usage instructions
- Common troubleshooting

## 🎯 How to Deploy

### Method 1: Direct Installation (Recommended)

1. **Create LXC Container in Proxmox**:
   - Debian 11 or Ubuntu 22.04 template
   - 1GB RAM, 8GB disk
   - Network bridge enabled

2. **Copy Files to Container**:
   ```bash
   # Copy all files to your Proxmox host
   scp -r /home/z/my-project root@proxmox-ip:/tmp/
   
   # Push files to LXC container
   pct push 100 /tmp/my-project /opt/learnandearn -r
   ```

3. **Run Installation Script**:
   ```bash
   # Enter container
   pct enter 100
   
   # Navigate to app directory
   cd /opt/learnandearn
   
   # Make script executable and run
   chmod +x lxc-install.sh
   ./lxc-install.sh
   ```

4. **Access the App**:
   - Get container IP: `ip addr show`
   - Access from tablet: `http://container-ip:3000`

### Method 2: Docker Installation

1. **Create LXC Container** (same as above)

2. **Copy Files and Run Docker Script**:
   ```bash
   # Enter container
   pct enter 100
   
   # Navigate to app directory
   cd /opt/learnandearn
   
   # Make script executable and run
   chmod +x lxc-docker-install.sh
   ./lxc-docker-install.sh
   ```

3. **Access the App**:
   - Same as direct installation
   - Additional management commands available

## 🎮 App Management

### Direct Installation Commands
```bash
learnandearn start    # Start the app
learnandearn stop     # Stop the app
learnandearn restart  # Restart the app
learnandearn status   # Check status
learnandearn logs     # View logs
learnandearn update   # Update the app
```

### Docker Installation Commands
```bash
learnandearn start    # Start containers
learnandearn stop     # Stop containers
learnandearn restart  # Restart containers
learnandearn status   # Check status
learnandearn logs     # View logs
learnandearn update   # Update containers
learnandearn shell    # Access container shell
learnandearn-backup   # Create backup
```

## 🔧 Configuration Files

### **server.ts** - Custom Server
- Socket.IO integration
- Production-ready configuration
- Error handling
- Logging setup

### **package.json** - Dependencies
- All required Node.js packages
- Build and start scripts
- Database management commands

### **prisma/schema.prisma** - Database Schema
- Complete data model
- User management
- Progress tracking
- Reward system
- Avatar customization

## 🌐 Network Setup

### Access Options
1. **Direct Access**: `http://container-ip:3000`
2. **Nginx Proxy**: `http://container-ip`
3. **Domain Access**: Add your domain and SSL certificate

### Firewall Configuration
```bash
# Allow necessary ports
ufw allow 22/tcp    # SSH
ufw allow 3000/tcp  # Direct app access
ufw allow 80/tcp    # HTTP proxy
ufw allow 443/tcp   # HTTPS (SSL)
```

### Port Forwarding (if needed)
Configure your router to forward:
- Port 3000 to container IP
- Port 80 to container IP (if using Nginx)

## 📱 Tablet Setup

### 1. **Connect to Network**
- Ensure tablet is on same network as Proxmox server
- Test connectivity: `ping container-ip`

### 2. **Access the App**
- Open browser: Chrome or Safari recommended
- Go to: `http://container-ip:3000`
- Test all features

### 3. **Add to Home Screen**
- Tap share button
- Select "Add to Home Screen"
- Name it "Learn & Earn"

### 4. **Parent Setup**
- Click "Parent Dashboard"
- Enter password: `parent123`
- Configure time limits and rewards

## 🔒 Security Features

### System Security
- Non-root user for app
- Firewall configuration
- Secure file permissions
- Regular security updates

### Application Security
- Password-protected parent dashboard
- No external links or ads
- Local data storage
- Session timeout protection

### Network Security
- Optional SSL/TLS support
- Reverse proxy protection
- Security headers
- Rate limiting ready

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Application health
curl http://localhost:3000/api/health

# Service status
systemctl status learnandearn

# Container status (Docker)
docker-compose ps
```

### Log Management
```bash
# Application logs
learnandearn logs

# System logs
journalctl -u learnandearn -f

# Error monitoring
journalctl -u learnandearn -f | grep ERROR
```

### Backup Strategy
```bash
# Direct installation backup
cp -r /opt/learnandearn/db /backup/location

# Docker backup
learnandearn-backup

# Automated backup (add to crontab)
0 2 * * * /usr/local/bin/learnandearn-backup
```

## 🚀 Performance Optimization

### System Level
- Adequate RAM allocation (1GB minimum)
- SSD storage for database
- Network optimization
- Regular system updates

### Application Level
- Production build optimization
- Database indexing
- Caching strategies
- Efficient state management

### Network Level
- Local network access
- Quality of Service (QoS) configuration
- Bandwidth monitoring
- Latency optimization

## 🎉 Ready to Deploy!

Your complete LXC deployment package is ready! Here's what to do next:

### Immediate Steps
1. **Create LXC container** in Proxmox
2. **Copy application files** to container
3. **Run installation script** of your choice
4. **Configure network** access
5. **Test from tablet** and start using!

### Long-term Management
1. **Regular updates** using management commands
2. **Monitor performance** and logs
3. **Backup data** regularly
4. **Scale resources** as needed

### Support Resources
- **PROXMOX_SETUP.md** - Detailed setup instructions
- **PACKAGING_GUIDE.md** - General deployment guide
- **QUICK_START.md** - Quick reference
- Built-in **management commands** for easy operation

Your educational app is now ready to provide a fun, rewarding learning experience for your daughter, with the reliability and scalability of Proxmox LXC containerization! 🎓✨

---

## 📞 Quick Reference

**Access URLs**:
- App: `http://container-ip:3000`
- Parent Dashboard: Click "Parent Dashboard" button
- Health Check: `http://container-ip:3000/api/health`

**Default Credentials**:
- Parent Password: `parent123`

**Management Commands**:
- Start: `learnandearn start`
- Stop: `learnandearn stop`
- Restart: `learnandearn restart`
- Status: `learnandearn status`
- Logs: `learnandearn logs`
- Update: `learnandearn update`

**File Locations**:
- App Directory: `/opt/learnandearn`
- Database: `/opt/learnandearn/db`
- Logs: Systemd journal or Docker logs
- Config: Application settings in parent dashboard

Happy learning! 🎉