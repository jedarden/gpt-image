# GPT-Image-1 UI Dockerfile (multi-stage, single port, stateless)
FROM node:20-alpine AS builder

WORKDIR /app

# Install frontend dependencies and build
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Install backend dependencies
WORKDIR /app
COPY backend ./backend
WORKDIR /app/backend
RUN npm install
RUN npx tsc

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy backend code
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/tsconfig.json ./
COPY --from=builder /app/backend/node_modules ./node_modules

# Copy built frontend
COPY --from=builder /app/frontend/build ./frontend/build

# Install only production dependencies
RUN npm install --omit=dev

# Expose single port
ENV PORT=8080
EXPOSE 8080

# Serve frontend statically and run backend
CMD ["node", "dist/server.js"]