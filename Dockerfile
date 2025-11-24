# Production-ready Dockerfile for fruitful-api-platform
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install (full install in builder)
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install all dependencies
RUN npm ci

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build frontend
RUN cd frontend && npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy only required files from builder
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend/package*.json ./backend/

# Install only production deps for backend
RUN cd backend && npm ci --production

EXPOSE 5000

# Ensure a proper start script exists in backend/package.json: "start": "node src/index.js"
CMD ["node", "backend/src/index.js"]
