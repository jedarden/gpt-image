# GPT-Image-1 Combined Container Dockerfile (multi-stage, production, non-root, stateless)
# Builds both frontend and backend, serves frontend static files via backend (Express)
# See prompts_LS7.md for requirements

# --- Frontend build stage ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --omit=dev
COPY frontend/ ./
# Ensure build script exists
RUN if [ -f package.json ] && ! grep -q '"build":' package.json; then \
      npm pkg set scripts.build="react-scripts build"; \
    fi
RUN npm run build

# --- Backend build stage ---
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./
RUN npm run build

# --- Production image ---
FROM node:20-alpine

# Install tini for proper signal handling and graceful shutdown
RUN apk add --no-cache tini

WORKDIR /app

# Copy backend production node_modules and dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/tsconfig.json ./backend/

# Copy built frontend
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Set environment variables (override at runtime as needed)
ENV NODE_ENV=production \
    PORT=8080 \
    FRONTEND_BUILD_PATH=/app/frontend/build

# Use non-root user for security
RUN addgroup -g 1001 appuser && adduser -D -u 1001 -G appuser appuser
USER appuser

EXPOSE 8080

# Use tini as entrypoint for signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start backend (serves static files)
CMD ["node", "backend/dist/server.js"]