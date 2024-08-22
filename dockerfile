# Use the Bun base image
FROM bunsh/bun:latest

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

# Command to start the application using PM2
CMD ["bun", "pm2-runtime", "ecosystem.config.cjs"]
