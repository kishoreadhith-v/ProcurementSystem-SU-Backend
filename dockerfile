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

# Expose the port the app runs on
EXPOSE 3000

# Command to start the application using PM2
CMD ["pm2-runtime", "start", "bun", "--name", "procurement-system", "--", "run", "index.ts", "-i", "max", "--watch"]
