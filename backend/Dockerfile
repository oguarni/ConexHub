# =====================================
# Multi-Stage Dockerfile for Backend
# =====================================

# ===== STAGE 1: Dependencies =====
FROM node:18-alpine AS dependencies

WORKDIR /app

# Install security updates and build dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init python3 make g++ && \
    rm -rf /var/cache/apk/*

# Copy package files for dependency installation
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# ===== STAGE 2: Build =====
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Run any build steps if needed (transpilation, etc.)
RUN if [ -f "scripts/build.js" ]; then npm run build; fi

# Validate configuration
RUN npm run validate-config || echo "Config validation skipped"

# ===== STAGE 3: Production =====
FROM node:18-alpine AS production

# Install security updates and runtime dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

WORKDIR /app

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copy application source from builder stage
COPY --from=builder --chown=nodeuser:nodejs /app/src ./src
COPY --from=builder --chown=nodeuser:nodejs /app/package*.json ./
COPY --from=builder --chown=nodeuser:nodejs /app/scripts ./scripts

# Copy environment template (will be overridden by docker-compose)
COPY --chown=nodeuser:nodejs .env.example ./.env.example

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
