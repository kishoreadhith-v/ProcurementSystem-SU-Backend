#!/bin/sh

# Start PM2 and the application
pm2-runtime start bun --name 'procurement-system' -- run index.ts -i 4 --watch

# Show PM2 logs
pm2 logs procurement-system
