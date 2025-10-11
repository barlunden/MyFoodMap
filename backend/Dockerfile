# Use Node.js LTS with glibc instead of Alpine
FROM node:18-slim

# Install OpenSSL and other dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and shared files
COPY . .

# Generate Prisma client with explicit binary target
RUN npx prisma generate --schema=./shared/prisma/schema.prisma

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]