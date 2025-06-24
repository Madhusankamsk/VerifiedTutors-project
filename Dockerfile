FROM node:18-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY . .

# Build the frontend application
RUN npm run build

# Backend and final stage
FROM node:18-alpine

# Set working directory for backend
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Create a directory for static files
RUN mkdir -p ./public

# Copy built frontend from the frontend-build stage
COPY --from=frontend-build /app/frontend/dist ./public

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"] 