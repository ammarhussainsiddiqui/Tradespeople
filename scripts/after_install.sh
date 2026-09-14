#!/bin/bash
set -e

echo "Navigating to app directory..."

cd /home/ubuntu/development

echo "Removing old dependencies..."
sudo rm -rf node_modules
sudo rm -rf .next

echo "dependencies cache clean"
sudo npm cache clean --force

echo "Installing dependencies..."
sudo npm install

echo "Building Next.js app..."
sudo npm run build
