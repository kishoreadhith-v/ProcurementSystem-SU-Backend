# Use the Node.js base image
FROM oven/bun:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and bun.lockb
COPY package.json bun.lockb ./

# Install application dependencies using Bun
RUN bun install

# Copy the rest of the application code
COPY . .

RUN npm install -g pm2

# Expose the port the app runs on
EXPOSE 3000

# Command to start the application using PM2
CMD pm2 start "bun run index.ts" --name procurement-system -i max --watch && pm2 logs procurement-system
