FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build frontend
RUN npm run build --workspace=frontend

# Expose ports
EXPOSE 3000 5000

# Start command
CMD ["npm", "run", "dev"]
