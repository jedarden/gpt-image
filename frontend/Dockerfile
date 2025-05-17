# Use official Node.js LTS image
FROM node:lts

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the development port
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]