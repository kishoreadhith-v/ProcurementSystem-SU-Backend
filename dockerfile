# Use the Node.js base image
FROM node:18

# Install Bun.js
RUN curl -fsSL https://bun.sh/install | bash

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and bun.lockb
COPY package.json bun.lockb ./

# Install application dependencies using Bun
RUN bun install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to start the application using PM2
CMD ["bun", "pm2-runtime", "ecosystem.config.js"]
