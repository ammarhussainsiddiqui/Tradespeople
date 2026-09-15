#!/bin/bash
set -e

echo "Starting Next.js app with PM2..."
cd /home/ubuntu/development
# sudo pm2 start npm --name "tradepeople-dev" -- run start -- -p 5000
sudo pm2 restart 2

cd /home/ubuntu/development
# sudo pm2 start npm --name "tradepeople-production" -- run start -- -p 3001
# sudo pm2 restart 3
# echo "Saving PM2 process..."
# sudo pm2 save
# sudo pm2 startup

