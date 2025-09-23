# Multi-stage Dockerfile for Acquisitions API
# Supports both development and production environments

# Base stage with Node.js
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Dependencies stage - install all dependencies
FROM base AS deps
RUN npm ci --include=dev

# Development stage
FROM base AS development
ENV NODE_ENV=development

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Use node --watch for hot reloading in development
CMD ["npm", "run", "dev"]

# Production dependencies stage - install only production dependencies
FROM base AS prod-deps
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force

# Build stage for production
FROM base AS build
ENV NODE_ENV=production

# Copy node_modules from deps stage for building
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Run any build steps if needed (linting, etc.)
RUN npm run lint

# Production stage
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy production dependencies
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --from=build --chown=nextjs:nodejs /app/src ./src
COPY --from=build --chown=nextjs:nodejs /app/package*.json ./

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R nextjs:nodejs logs

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { hostname: 'localhost', port: 3000, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]