# 🎓 Learn & Earn - Proxmox LXC Setup Guide

This guide will help you deploy the Learn & Earn educational app in a Proxmox LXC container.

## 🚀 Quick Start

### Option 1: Direct Installation (Recommended)
```bash
# Download and run the installation script
wget https://your-server.com/lxc-install.sh
chmod +x lxc-install.sh
./lxc-install.sh
```

### Option 2: Docker Installation (Advanced)
```bash
# Download and run the Docker installation script
wget https://your-server.com/lxc-docker-install.sh
chmod +x lxc-docker-install.sh
./lxc-docker-install.sh
```

## 📋 Prerequisites

### Proxmox Server Requirements
- Proxmox VE 7.x or higher
- Internet connection for downloads
- At least 1GB RAM for the LXC container
- 2GB disk space for the application

### Network Requirements
- Static IP address or DHCP reservation
- Port 3000 open (or port 80 if using Nginx)
- Firewall access from your tablet

## 🏗️ LXC Container Setup

### Step 1: Create LXC Container

In Proxmox Web Interface:
1. **Create CT**: Click "Create CT" in the Proxmox interface
2. **General**:
   - Hostname: `learnandearn`
   - Password: Set a secure password
   - SSH Public Key: (Optional) Add your SSH key
3. **Template**:
   - Select `Debian 11` or `Ubuntu 22.04`
4. **Storage**:
   - Storage: Your local storage
   - Disk size: 8GB (minimum)
   - Filesystem: ext4
5. **CPU**:
   - Cores: 1 or 2
   - CPU Type: host
6. **Memory**:
   - Memory: 1024MB (minimum)
   - Swap: 512MB
7. **Network**:
   - Bridge: vmbr0
   - VLAN: (If applicable)
   - IPv4: DHCP or Static
   - IPv6: (Optional)
8. **DNS**:
   - Use your local DNS server
   - Hostname: `learnandearn`
9. **Confirm**: Click "Finish" to create the container

### Step 2: Configure Container

After creation, configure the container:

```bash
# Start the container
pct start 100  # Replace 100 with your CT ID

# Access the container console
pct enter 100

# Update the system
apt update && apt upgrade -y

# Install prerequisites
apt install -y curl wget git sudo unzip
```

### Step 3: Copy Application Files

Choose one of these methods:

#### Method A: Direct Copy (if files are on Proxmox host)
```bash
# Exit container console (type 'exit')
# Copy files from host to container
pct push 100 /home/z/my-project /opt/learnandearn -r
# Enter container again
pct enter 100
```

#### Method B: Git Clone (if repository is available)
```bash
# Inside container
cd /opt
git clone https://your-repo.com/learnandearn.git
cd learnandearn
```

#### Method C: SCP Transfer (from another machine)
```bash
# From your development machine
scp -r /home/z/my-project root@proxmox-ip:/opt/learnandearn
```

## 🔧 Installation Methods

### Method 1: Direct Installation (Recommended)

```bash
# Inside the LXC container
cd /opt/learnandearn
chmod +x lxc-install.sh
./lxc-install.sh
```

**Features:**
- Direct Node.js installation
- Systemd service management
- Built-in Nginx reverse proxy
- Simple management commands

### Method 2: Docker Installation

```bash
# Inside the LXC container
cd /opt/learnandearn
chmod +x lxc-docker-install.sh
./lxc-docker-install.sh
```

**Features:**
- Containerized deployment
- Easy updates and rollbacks
- Built-in backup system
- Isolated environment

## 🌐 Access Configuration

### Network Access

After installation, access the app using:

```bash
# Get container IP
ip addr show
# or
hostname -I
```

Access from your tablet:
- **Direct access**: `http://container-ip:3000`
- **With Nginx**: `http://container-ip`

### Firewall Configuration

If using UFW firewall:

```bash
# Allow necessary ports
ufw allow 3000/tcp    # Direct access
ufw allow 80/tcp      # Nginx proxy
ufw allow 443/tcp     # HTTPS (if configured)
ufw --force enable
```

### Proxmox Firewall

If using Proxmox firewall:

1. Go to Datacenter -> Firewall -> Options
2. Enable Firewall
3. Go to your CT -> Firewall -> Security
4. Add rules:
   - Input: TCP, Port 3000, ACCEPT
   - Input: TCP, Port 80, ACCEPT

## 🎮 Management Commands

### Direct Installation Management

```bash
# Service management
learnandearn start      # Start the app
learnandearn stop       # Stop the app
learnandearn restart    # Restart the app
learnandearn status     # Check status
learnandearn logs       # View logs
learnandearn update     # Update the app
```

### Docker Installation Management

```bash
# Container management
learnandearn start      # Start containers
learnandearn stop       # Stop containers
learnandearn restart    # Restart containers
learnandearn status     # Check status
learnandearn logs       # View logs
learnandearn update     # Update containers
learnandearn shell      # Access container shell
```

### System Commands

```bash
# System service (both methods)
systemctl status learnandearn        # Direct install
systemctl status learnandearn-docker # Docker install

# View logs
journalctl -u learnandearn -f         # Direct install
docker-compose logs -f                # Docker install
```

## 🔄 Updates and Maintenance

### Updating the Application

#### Direct Installation
```bash
learnandearn update
```

#### Docker Installation
```bash
learnandearn update
```

### Manual Update Process

```bash
# Navigate to app directory
cd /opt/learnandearn

# Pull latest changes (if using git)
git pull

# Install dependencies
npm install

# Rebuild application
npm run build

# Restart service
learnandearn restart
```

### Backup and Restore

#### Direct Installation Backup
```bash
# Backup database and config
cp -r /opt/learnandearn/db /backup/location
cp /opt/learnandearn/package.json /backup/location
```

#### Docker Installation Backup
```bash
# Use built-in backup script
learnandearn-backup
```

#### Restore Process
```bash
# Stop the service
learnandearn stop

# Restore files
cp -r /backup/location/db /opt/learnandearn/

# Restart service
learnandearn start
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### 2. Service Won't Start
```bash
# Check service status
systemctl status learnandearn

# View logs
journalctl -u learnandearn -n 50

# Check for errors
npm run lint
```

#### 3. Database Issues
```bash
# Reset database
npm run db:reset
npm run db:generate
```

#### 4. Permission Issues
```bash
# Fix permissions
chown -R learnandearn:learnandearn /opt/learnandearn
chmod +x /usr/local/bin/learnandearn
```

#### 5. Network Access Issues
```bash
# Check if service is running
netstat -tlnp | grep :3000

# Check firewall status
ufw status

# Test local access
curl http://localhost:3000
```

### Log Files

#### Direct Installation
```bash
# Application logs
journalctl -u learnandearn -f

# Nginx logs (if using)
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

#### Docker Installation
```bash
# Container logs
docker-compose logs -f learnandearn
docker-compose logs -f nginx
```

## 🎯 Optimization

### Performance Tuning

#### System Level
```bash
# Increase file descriptor limit
echo '* soft nofile 65536' >> /etc/security/limits.conf
echo '* hard nofile 65536' >> /etc/security/limits.conf

# Optimize sysctl settings
echo 'net.core.somaxconn = 1024' >> /etc/sysctl.conf
sysctl -p
```

#### Application Level
```bash
# Set Node.js production mode
export NODE_ENV=production

# Increase memory limit (if needed)
export NODE_OPTIONS="--max-old-space-size=1024"
```

### Security Hardening

#### System Security
```bash
# Update system regularly
apt update && apt upgrade -y

# Configure firewall
ufw enable
ufw default deny incoming
ufw allow 22/tcp    # SSH
ufw allow 3000/tcp  # App
ufw allow 80/tcp    # HTTP
```

#### Application Security
```bash
# Change default parent password
# (Update in the application settings)

# Use HTTPS (if domain available)
# Configure SSL certificates with Let's Encrypt
```

## 📊 Monitoring

### Health Checks

The application includes a health check endpoint:
```bash
curl http://localhost:3000/api/health
```

### Resource Monitoring

```bash
# System resources
htop
df -h
free -h

# Application monitoring
docker stats  # Docker installation
systemctl status learnandearn  # Direct installation
```

### Log Monitoring

```bash
# Real-time log monitoring
learnandearn logs

# Error log monitoring
journalctl -u learnandearn -f | grep ERROR
```

## 🎉 Success!

Your Learn & Earn educational app is now running in a Proxmox LXC container! 

### Next Steps:
1. **Access the app**: Open `http://container-ip:3000` on your tablet
2. **Set up parent account**: Use password `parent123`
3. **Configure settings**: Set time limits and reward values
4. **Start learning**: Your daughter can begin earning rewards!

### Management:
- Use `learnandearn` commands for easy management
- Monitor logs and performance regularly
- Keep the app updated with `learnandearn update`
- Set up regular backups

Your educational app is now ready to make learning fun and rewarding! 🎓✨