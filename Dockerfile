# Use Node 16 (required by server environment)
FROM node:16-slim

# Create app directory
WORKDIR /app

# Copy package.json + package-lock.json first (layer caching)
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy all project files
COPY . .

# Expose the port (your app runs on console, but we expose for container logs)
EXPOSE 3000

# Set environment variable for production mode
ENV NODE_ENV=production

# Run the application
CMD ["node", "main.js"]
