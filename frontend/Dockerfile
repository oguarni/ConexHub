# =====================================
# Multi-Stage Dockerfile for Frontend
# =====================================

# ===== STAGE 1: Dependencies =====
FROM node:18-alpine AS dependencies

WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies with optimizations
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# ===== STAGE 2: Build =====
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --include=dev --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# ===== STAGE 3: Production =====
FROM node:18-alpine AS production

# Install security updates and runtime dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init nginx && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reactuser -u 1001 -G nodejs

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=reactuser:nodejs /app/build ./build
COPY --from=dependencies --chown=reactuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=reactuser:nodejs /app/package*.json ./

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Create nginx directories with proper permissions
RUN mkdir -p /var/log/nginx /var/cache/nginx /var/run && \
    chown -R reactuser:nodejs /var/log/nginx /var/cache/nginx /var/run

# Switch to non-root user
USER reactuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]