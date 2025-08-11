#!/bin/bash

# Learn & Earn Educational App - LXC Proxmox Installation Script
# This script will install and configure the educational app in an LXC container

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
print_status "🎓 Learn & Earn Educational App - LXC Installation"
print_status "=============================================="

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
apt-get install -y curl wget git sudo unzip

# Install Node.js
print_status "Installing Node.js..."
if ! command_exists node; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Verify Node.js installation
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION installed"
else
    print_error "Node.js installation failed"
    exit 1
fi

# Install npm
if ! command_exists npm; then
    apt-get install -y npm
fi

# Verify npm installation
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm $NPM_VERSION installed"
else
    print_error "npm installation failed"
    exit 1
fi

# Create app user
print_status "Creating app user..."
if ! id "learnandearn" &>/dev/null; then
    useradd -m -s /bin/bash learnandearn
    print_success "User 'learnandearn' created"
else
    print_warning "User 'learnandearn' already exists"
fi

# Create app directory
APP_DIR="/opt/learnandearn"
print_status "Creating app directory..."
mkdir -p $APP_DIR
chown learnandearn:learnandearn $APP_DIR

# Switch to app user for the rest of the installation
print_status "Switching to app user for installation..."
cd $APP_DIR

# Copy app files (assuming they're in the current directory)
print_status "Copying application files..."
if [ -d "/home/z/my-project" ]; then
    cp -r /home/z/my-project/* $APP_DIR/
    chown -R learnandearn:learnandearn $APP_DIR
    print_success "Application files copied"
else
    print_warning "Source files not found at /home/z/my-project"
    print_status "You may need to manually copy the application files"
fi

# Install dependencies
print_status "Installing Node.js dependencies..."
sudo -u learnandearn npm install

# Set up database
print_status "Setting up database..."
sudo -u learnandearn npm run db:push
sudo -u learnandearn npm run db:generate

# Create systemd service
print_status "Creating systemd service..."
cat > /etc/systemd/system/learnandearn.service << EOF
[Unit]
Description=Learn & Earn Educational App
After=network.target

[Service]
Type=simple
User=learnandearn
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
print_status "Enabling and starting service..."
systemctl daemon-reload
systemctl enable learnandearn
systemctl start learnandearn

# Check service status
if systemctl is-active --quiet learnandearn; then
    print_success "Service started successfully"
else
    print_error "Service failed to start"
    systemctl status learnandearn
    exit 1
fi

# Get container IP
CONTAINER_IP=$(get_container_ip)
print_success "Container IP: $CONTAINER_IP"

# Create firewall rules if ufw is active
if command_exists ufw && ufw status | grep -q "active"; then
    print_status "Configuring firewall..."
    ufw allow 3000/tcp
    ufw --force enable
    print_success "Firewall configured"
fi

# Create start script for easy management
cat > /usr/local/bin/learnandearn << 'EOF'
#!/bin/bash

# Learn & Earn Management Script

case "$1" in
    start)
        systemctl start learnandearn
        echo "Learn & Earn started"
        ;;
    stop)
        systemctl stop learnandearn
        echo "Learn & Earn stopped"
        ;;
    restart)
        systemctl restart learnandearn
        echo "Learn & Earn restarted"
        ;;
    status)
        systemctl status learnandearn
        ;;
    logs)
        journalctl -u learnandearn -f
        ;;
    update)
        cd /opt/learnandearn
        sudo -u learnandearn git pull
        sudo -u learnandearn npm install
        sudo -u learnandearn npm run build
        systemctl restart learnandearn
        echo "Learn & Earn updated"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|update}"
        exit 1
        ;;
esac
EOF

chmod +x /usr/local/bin/learnandearn

# Create Nginx configuration (optional)
print_status "Creating Nginx configuration..."
cat > /etc/nginx/sites-available/learnandearn << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Nginx site if Nginx is installed
if command_exists nginx; then
    ln -sf /etc/nginx/sites-available/learnandearn /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    print_success "Nginx configured"
fi

# Installation complete
print_success "🎉 Installation Complete!"
print_status "================================"
print_status "App Information:"
print_status "- URL: http://$CONTAINER_IP:3000"
print_status "- Management: learnandearn {start|stop|restart|status|logs|update}"
print_status "- Service: systemctl status learnandearn"
print_status "- Logs: journalctl -u learnandearn -f"
print_status ""
print_status "Parent Dashboard:"
print_status "- Password: parent123"
print_status "- Access: Click 'Parent Dashboard' on main page"
print_status ""
print_status "Next Steps:"
print_status "1. Access the app from your tablet: http://$CONTAINER_IP:3000"
print_status "2. Add to home screen for easy access"
print_status "3. Set up parent account and preferences"
print_status "4. Start learning and earning rewards!"
print_status ""
print_success "Your educational app is now ready! 🎓✨"