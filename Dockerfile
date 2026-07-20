# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build NestJS application
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application output from builder stage
COPY --from=builder /app/dist ./dist

# Security best practice: Run container as non-root node user
USER node

# Default port exposure
EXPOSE 4000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-4000}/api/v1/health || exit 1

# Start production server
CMD ["node", "dist/main.js"]

