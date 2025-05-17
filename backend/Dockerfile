# Use official Node.js LTS image
FROM node:lts

# Set working directory
WORKDIR /usr/src/app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose backend port
EXPOSE 5000

# Default command for development
CMD ["npm", "run", "dev"]