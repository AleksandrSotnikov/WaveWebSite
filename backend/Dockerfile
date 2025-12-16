FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install development dependencies for development image
RUN npm install

# Copy source code
COPY src ./src
COPY migrations ./migrations

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
