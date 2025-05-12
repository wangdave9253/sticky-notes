# Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Expose the port
EXPOSE 3000

# Use the production startup script
CMD ["node", "src/server.js"]
