#!/bin/bash

# Learn & Earn Educational App - LXC Proxmox Docker Installation Script
# This script will install Docker and deploy the educational app using Docker containers

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get container IP
get_container_ip() {
    ip route get 1.1.1.1 | awk '{print $7}' | head -n 1
}

# Start installation
print_status "🎓 Learn & Earn Educational App - LXC Docker Installation"
print_status "======================================================"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# Update system
print_status "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install prerequisites
print_status "Installing prerequisites..."
apt-get install -y curl wget git sudo unzip apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
print_status "Installing Docker..."
if ! command_exists docker; then
    # Remove old versions
    apt-get remove -y docker docker-engine docker.io containerd runc
    
    # Add Docker's official GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up the repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command_exists docker-compose; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Start and enable Docker
print_status "Starting Docker service..."
systemctl start docker
systemctl enable docker

# Verify Docker installation
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker $DOCKER_VERSION installed"
else
    print_error "Docker installation failed"
    exit 1
fi

# Create app directory
APP_DIR="/opt/learnandearn"
print_status "Creating app directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Copy app files
print_status "Copying application files..."
if [ -d "/home/z/my-project" ]; then
    cp -r /home/z/my-project/* $APP_DIR/
    print_success "Application files copied"
else
    print_warning "Source files not found at /home/z/my-project"
    print_status "You may need to manually copy the application files"
fi

# Create database directory
mkdir -p $APP_DIR/db
mkdir -p $APP_DIR/logs

# Build and start containers
print_status "Building Docker containers..."
docker-compose down 2>/dev/null || true
docker-compose build --no-cache

print_status "Starting containers..."
docker-compose up -d

# Wait for containers to start
print_status "Waiting for containers to start..."
sleep 30

# Check container status
if docker-compose ps | grep -q "Up"; then
    print_success "Containers started successfully"
else
    print_error "Containers failed to start"
    docker-compose logs
    exit 1
fi

# Get container IP
CONTAINER_IP=$(get_container_ip)
print_success "Container IP: $CONTAINER_IP"

# Create firewall rules if ufw is active
if command_exists ufw && ufw status | grep -q "active"; then
    print_status "Configuring firewall..."
    ufw allow 3000/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    print_success "Firewall configured"
fi

# Create management script
cat > /usr/local/bin/learnandearn << 'EOF'
#!/bin/bash

# Learn & Earn Docker Management Script

APP_DIR="/opt/learnandearn"

case "$1" in
    start)
        cd $APP_DIR
        docker-compose up -d
        echo "Learn & Earn started"
        ;;
    stop)
        cd $APP_DIR
        docker-compose down
        echo "Learn & Earn stopped"
        ;;
    restart)
        cd $APP_DIR
        docker-compose restart
        echo "Learn & Earn restarted"
        ;;
    status)
        cd $APP_DIR
        docker-compose ps
        ;;
    logs)
        cd $APP_DIR
        docker-compose logs -f
        ;;
    update)
        cd $APP_DIR
        git pull
        docker-compose build --no-cache
        docker-compose up -d
        echo "Learn & Earn updated"
        ;;
    shell)
        cd $APP_DIR
        docker-compose exec learnandearn sh
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|update|shell}"
        exit 1
        ;;
esac
EOF

chmod +x /usr/local/bin/learnandearn

# Create backup script
cat > /usr/local/bin/learnandearn-backup << 'EOF'
#!/bin/bash

# Learn & Earn Backup Script

APP_DIR="/opt/learnandearn"
BACKUP_DIR="/opt/learnandearn-backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "Creating backup..."

# Backup database
cp -r $APP_DIR/db $BACKUP_DIR/db_$DATE

# Backup configuration
cp $APP_DIR/docker-compose.yml $BACKUP_DIR/docker-compose_$DATE.yml

# Create compressed backup
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $APP_DIR .

echo "Backup created: $BACKUP_DIR/backup_$DATE.tar.gz"

# Keep only last 7 backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup complete"
EOF

chmod +x /usr/local/bin/learnandearn-backup

# Create systemd service for auto-start (optional)
print_status "Creating systemd service..."
cat > /etc/systemd/system/learnandearn-docker.service << EOF
[Unit]
Description=Learn & Earn Educational App (Docker)
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/learnandearn start
ExecStop=/usr/local/bin/learnandearn stop
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable service
systemctl daemon-reload
systemctl enable learnandearn-docker

# Installation complete
print_success "🎉 Docker Installation Complete!"
print_status "=================================="
print_status "App Information:"
print_status "- URL: http://$CONTAINER_IP:3000"
print_status "- Management: learnandearn {start|stop|restart|status|logs|update|shell}"
print_status "- Backup: learnandearn-backup"
print_status "- Service: systemctl status learnandearn-docker"
print_status ""
print_status "Parent Dashboard:"
print_status "- Password: parent123"
print_status "- Access: Click 'Parent Dashboard' on main page"
print_status ""
print_status "Docker Commands:"
print_status "- View containers: docker-compose ps"
print_status "- View logs: docker-compose logs"
print_status "- Access shell: learnandearn shell"
print_status ""
print_status "Next Steps:"
print_status "1. Access the app from your tablet: http://$CONTAINER_IP:3000"
print_status "2. Add to home screen for easy access"
print_status "3. Set up parent account and preferences"
print_status "4. Start learning and earning rewards!"
print_status ""
print_success "Your educational app is now ready with Docker! 🎓✨"