# Use Node.js 22 alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install Bun
RUN npm install -g bun

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

# Start the development server
CMD ["bun", "run", "dev"]
