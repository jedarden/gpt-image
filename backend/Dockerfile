# Use official Node.js LTS image
# Multi-stage production Dockerfile for backend (Node.js/TypeScript)
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies and build
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

# Stage 2: Production image (minimal)
FROM node:18-alpine

WORKDIR /app

# Only copy production dependencies and built code
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Set environment for production
ENV NODE_ENV=production

# Expose backend port
EXPOSE 5000

# Run the production server
CMD ["node", "dist/server.js"]