# Use the Node.js base image
FROM oven/bun:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and bun.lockb
COPY package.json bun.lockb ./

# Install application dependencies using Bun
RUN bun install

# Install PM2 globally
RUN bun add pm2

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Add the entrypoint script
COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

# Set the entrypoint to the script
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
