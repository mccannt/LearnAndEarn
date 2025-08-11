# 🚀 GitHub Deployment Guide

This guide will help you deploy the Learn & Earn educational app directly from GitHub to various platforms.

## 📋 Prerequisites

### GitHub Repository
- Fork or create a new repository
- Push all project files to GitHub
- Configure repository settings

### Required Secrets
Add these secrets to your repository (`Settings` > `Secrets and variables` > `Actions`):

```bash
# Docker Hub (optional)
DOCKERHUB_USERNAME=your-dockerhub-username
DOCKERHUB_TOKEN=your-dockerhub-token

# Deployment platforms (add as needed)
VERCEL_TOKEN=your-vercel-token
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
RAILWAY_TOKEN=your-railway-token
```

## 🎯 Deployment Options

### Option 1: Vercel (Recommended)

#### 1. Connect to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from GitHub
vercel --prod
```

#### 2. Automatic Deployment
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Select your GitHub repository
4. Configure environment variables:
   ```env
   NODE_ENV=production
   DATABASE_URL=your-database-url
   ```
5. Deploy

#### 3. Custom Domain
- Add your domain in Vercel dashboard
- Configure DNS settings
- Enable HTTPS

### Option 2: Railway

#### 1. Deploy via Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### 2. GitHub Integration
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Configure environment variables
6. Deploy

### Option 3: Docker + Self-Hosted

#### 1. Build and Push to Docker Hub
```bash
# Build image
docker build -t your-username/learn-and-earn:latest .

# Push to Docker Hub
docker push your-username/learn-and-earn:latest
```

#### 2. Deploy on Server
```bash
# Pull image
docker pull your-username/learn-and-earn:latest

# Run container
docker run -d \
  --name learn-and-earn \
  -p 3000:3000 \
  -v $(pwd)/db:/app/db \
  your-username/learn-and-earn:latest
```

#### 3. Docker Compose
```yaml
version: '3.8'
services:
  learnandearn:
    image: your-username/learn-and-earn:latest
    ports:
      - "3000:3000"
    volumes:
      - ./db:/app/db
    restart: unless-stopped
```

### Option 4: AWS ECS

#### 1. Create ECS Task Definition
```json
{
  "family": "learn-and-earn",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "learn-and-earn",
      "image": "your-username/learn-and-earn:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/learn-and-earn",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 2. Deploy using AWS CLI
```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster your-cluster \
  --service-name learn-and-earn \
  --task-definition learn-and-earn \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### Option 5: DigitalOcean App Platform

#### 1. Create App Spec
```yaml
name: learn-and-earn
services:
- name: web
  source_dir: /
  github:
    repo: your-username/learn-and-earn
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
databases:
- engine: PG
  name: db
  size: db-s-dev-database
  version: "13"
```

#### 2. Deploy
```bash
# Install doctl
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.100.0/doctl-1.100.0-linux-amd64.tar.gz | tar xz
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init

# Create app
doctl apps create --spec app-spec.yaml
```

## 🔧 Environment Configuration

### Production Environment Variables
```env
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="file:./production.db"

# Security (optional)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
```

### Development Environment Variables
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The repository includes a comprehensive CI/CD pipeline (`.github/workflows/ci.yml`) that:

1. **Tests**: Runs on multiple Node.js versions
2. **Linting**: Ensures code quality
3. **Type Checking**: Validates TypeScript types
4. **Security Audit**: Checks for vulnerabilities
5. **Docker Build**: Creates container images
6. **Deployment**: Deploys to production

### Manual Deployment

#### Trigger Deployment
```bash
# Trigger GitHub Actions workflow
gh workflow run ci.yml

# Check workflow status
gh run list --limit 10

# View workflow logs
gh run view <run-id>
```

#### Rollback Deployment
```bash
# Rollback to previous commit
git revert HEAD
git push origin main

# Or use GitHub UI to rollback deployment
```

## 📊 Monitoring and Logging

### Application Monitoring

#### Health Check
```bash
curl https://your-domain.com/api/health
```

#### Error Tracking (Sentry)
```env
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
```

#### Performance Monitoring
```bash
# Add to package.json
"scripts": {
  "analyze": "ANALYZE=true npm run build"
}
```

### Log Management

#### Application Logs
```bash
# Vercel logs
vercel logs

# Docker logs
docker logs learn-and-earn

# Systemd logs
journalctl -u learnand-earn -f
```

#### Structured Logging
```javascript
// Add to your application
const logger = {
  info: (message, data) => console.log(JSON.stringify({ level: 'info', message, data })),
  error: (message, error) => console.error(JSON.stringify({ level: 'error', message, error: error?.stack }))
};
```

## 🔒 Security Best Practices

### HTTPS Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Security Headers
```javascript
// Add to middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

### Rate Limiting
```javascript
// Add rate limiting middleware
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Update all dependencies
- [ ] Run tests and linting
- [ ] Build application successfully
- [ ] Set up environment variables
- [ ] Configure database
- [ ] Set up domain and DNS
- [ ] Configure SSL certificates

### Post-Deployment
- [ ] Verify application is running
- [ ] Test all features
- [ ] Check database connectivity
- [ ] Verify parent dashboard access
- [ ] Test reward system
- [ ] Monitor performance
- [ ] Set up backups
- [ ] Configure monitoring

### Security Checklist
- [ ] Change default parent password
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Set up monitoring
- [ ] Enable backups
- [ ] Review environment variables
- [ ] Test security headers
- [ ] Verify data privacy

## 📞 Support

### Getting Help
- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check deployment guides
- **Community**: Join discussions for help

### Common Issues
1. **Build Failures**: Check Node.js version compatibility
2. **Database Issues**: Verify DATABASE_URL configuration
3. **Port Conflicts**: Ensure port 3000 is available
4. **Permission Issues**: Check file and directory permissions
5. **Memory Issues**: Monitor resource usage

---

Your Learn & Earn educational app is now ready for GitHub deployment! 🎓✨