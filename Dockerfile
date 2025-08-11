# Learn & Earn Educational App - Docker Container
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    unzip

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY . .

# Create database directory
RUN mkdir -p /app/db

# Build the application
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Set permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]