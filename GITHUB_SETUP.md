# 🚀 GitHub Setup Guide

Your Learn & Earn educational app is now ready to be pushed to GitHub! Follow these steps to get your repository online.

## 📋 Prerequisites

### GitHub Account
- Create a GitHub account at [github.com](https://github.com)
- Verify your email address
- Enable two-factor authentication (recommended)

### Git Configuration
```bash
# Configure Git (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🎯 Step-by-Step GitHub Setup

### Step 1: Create GitHub Repository

#### Option A: GitHub Website
1. Go to [GitHub](https://github.com)
2. Click "+" → "New repository"
3. Fill in repository details:
   - **Repository name**: `learn-and-earn`
   - **Description**: `Educational game for kids - Learn math and English while earning rewards`
   - **Visibility**: Choose Public or Private
   - **Initialize**: ❌ Uncheck "Add a README file"
   - **Template**: ❌ Uncheck "Add .gitignore"
   - **License**: ❌ Uncheck "Add a license"
4. Click "Create repository"

#### Option B: GitHub CLI
```bash
# Install GitHub CLI (if not installed)
# macOS: brew install gh
# Windows: scoop install gh
# Ubuntu: sudo apt install gh

# Login to GitHub
gh auth login

# Create repository
gh repo create learn-and-earn \
  --public \
  --description "Educational game for kids - Learn math and English while earning rewards" \
  --source=. \
  --remote=origin \
  --push
```

### Step 2: Push to GitHub

#### If you created repository via website:
```bash
# Add remote repository
git remote add origin https://github.com/your-username/learn-and-earn.git

# Push to GitHub
git push -u origin master

# Or if you use main branch
git push -u origin main
```

#### If you used GitHub CLI:
```bash
# Already pushed if you used --push flag
# Otherwise:
git push -u origin master
```

### Step 3: Verify Repository

1. **Check GitHub Repository**
   - Go to: `https://github.com/your-username/learn-and-earn`
   - Verify all files are present
   - Check that README.md displays correctly

2. **Check File Structure**
   - Source code in `src/` directory
   - Documentation files in root
   - Docker and deployment files
   - GitHub Actions workflow

## 🔧 Configure Repository Settings

### Step 1: Repository Settings

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Configure the following:

#### General Settings
- **Repository name**: `learn-and-earn`
- **Description**: Update if needed
- **Website**: Add your deployed app URL later
- **Default branch**: `master` or `main`

#### Features
- **Issues**: ✅ Enable (for bug reports)
- **Projects**: ❌ Disable (unless needed)
- **Wiki**: ❌ Disable (documentation is in repo)
- **Discussions**: ✅ Enable (for community help)

#### Merge Button
- **Allow merge commits**: ✅ Enable
- **Allow squash merging**: ✅ Enable
- **Allow rebase merging**: ❌ Disable

### Step 2: Configure GitHub Actions

1. Go to "Settings" → "Actions" → "General"
2. **Workflow permissions**: Allow all actions
3. **Fork pull request workflows**: Enable
4. **Artifact and log retention**: 30 days (recommended)

### Step 3: Add Repository Secrets

1. Go to "Settings" → "Secrets and variables" → "Actions"
2. Click "New repository secret"
3. Add these secrets (as needed):

#### For Docker Hub (optional)
```bash
DOCKERHUB_USERNAME=your-dockerhub-username
DOCKERHUB_TOKEN=your-dockerhub-token
```

#### For Vercel Deployment (optional)
```bash
VERCEL_TOKEN=your-vercel-api-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
```

#### For Railway Deployment (optional)
```bash
RAILWAY_TOKEN=your-railway-token
```

### Step 4: Configure Branch Protection

1. Go to "Settings" → "Branches"
2. Click "Add branch protection rule"
3. **Branch name pattern**: `master` or `main`
4. Enable protections:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging
   - ❌ Require status checks to pass before merging (select CI checks)
   - ✅ Require linear history
   - ✅ Include administrators

## 🚀 Deploy from GitHub

### Option 1: Vercel (Recommended)

#### 1. Connect GitHub to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Import project
vercel import

# Deploy
vercel --prod
```

#### 2. Automatic Deployment
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Select "Import Git Repository"
4. Choose your `learn-and-earn` repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
6. Add environment variables:
   ```env
   NODE_ENV=production
   DATABASE_URL=your-database-url
   ```
7. Click "Deploy"

### Option 2: Railway

#### 1. Deploy via Railway
1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will automatically detect Next.js
6. Add environment variables
7. Click "Deploy"

### Option 3: Self-Hosted with Docker

#### 1. Build from GitHub
```bash
# Clone repository
git clone https://github.com/your-username/learn-and-earn.git
cd learn-and-earn

# Build and run
docker-compose up -d
```

#### 2. Auto-Deploy with Webhooks
Set up GitHub webhooks to trigger deployments on push.

## 📊 Monitor Your Repository

### GitHub Actions

1. **Check CI/CD Pipeline**
   - Go to "Actions" tab in your repository
   - View workflow runs
   - Check for any failures

2. **Workflow Status**
   - ✅ Tests passing
   - ✅ Build successful
   - ✅ Security audit passed
   - ✅ Docker image built (if configured)

### Repository Insights

1. **Traffic Analytics**
   - Go to "Insights" → "Traffic"
   - Monitor clone and visitor statistics

2. **Contributors**
   - Track contributions if working with a team

3. **Dependencies**
   - GitHub will automatically show dependency alerts
   - Keep dependencies updated

## 🔒 Security Best Practices

### Repository Security

1. **Dependabot**
   - Go to "Settings" → "Code security and analysis"
   - Enable Dependabot alerts
   - Enable Dependabot security updates

2. **CodeQL Analysis**
   - Enable CodeQL code scanning
   - Configure security rules

3. **Secret Scanning**
   - Enable secret scanning
   - Monitor for leaked credentials

### Access Control

1. **Collaborators**
   - Add team members if needed
   - Set appropriate permission levels

2. **Branch Protection**
   - Keep main branch protected
   - Require PRs for changes

3. **Webhook Security**
   - Use secret tokens for webhooks
   - Validate webhook payloads

## 📝 Update Documentation

### README.md Links

Update any links in README.md to point to your repository:
```markdown
# Replace these links
- [GitHub Repository](https://github.com/your-username/learn-and-earn)
- [Issues](https://github.com/your-username/learn-and-earn/issues)
- [Discussions](https://github.com/your-username/learn-and-earn/discussions)
```

### Deployment URLs

Update documentation with your deployed app URL:
```markdown
## Live Demo
- **App URL**: https://your-app-url.vercel.app
- **Parent Dashboard**: https://your-app-url.vercel.app/parent
```

## 🎉 Success!

Your Learn & Earn educational app is now on GitHub! Here's what you have:

### ✅ Complete Repository
- **Source Code**: All application files
- **Documentation**: Comprehensive guides
- **CI/CD Pipeline**: Automated testing and deployment
- **Docker Support**: Containerized deployment
- **LXC Scripts**: Proxmox deployment ready

### 🚀 Deployment Options
- **Vercel**: One-click deployment
- **Railway**: Easy container deployment
- **Self-Hosted**: Full control with Docker
- **Proxmox**: LXC container deployment

### 📊 Monitoring
- **GitHub Actions**: Automated CI/CD
- **Dependabot**: Security updates
- **Insights**: Repository analytics
- **Issues**: Bug tracking

### 🎯 Next Steps
1. **Deploy your app** using one of the methods above
2. **Test all features** on the deployed version
3. **Set up monitoring** and alerts
4. **Share with others** if you made it public
5. **Maintain and update** regularly

### 📞 Community
- **Star the repository** if you find it useful
- **Report issues** for bugs or feature requests
- **Start discussions** for questions and help
- **Contribute** if you want to improve the app

Your educational app is now ready to help kids learn while having fun! 🎓✨

---

**Repository URL**: `https://github.com/your-username/learn-and-earn`
**Live Demo**: Add your deployed URL here
**Issues**: Report bugs and request features
**Discussions**: Get help and share ideas