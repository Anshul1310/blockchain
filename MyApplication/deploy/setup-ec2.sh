#!/bin/bash

echo "🚀 Starting AWS EC2 Setup for BlindHire AI..."

# Update package manager
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 & Nginx & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2

# Create Deployment Folder
sudo mkdir -p /var/www/blindhire
sudo chown -R $USER:$USER /var/www/blindhire

# Copy Repository Files to /var/www/blindhire
cp -r . /var/www/blindhire/

# Build Shared Package
cd /var/www/blindhire/shared
npm install
npm run build

# Build Backend
cd /var/www/blindhire/backend
npm install
npm run build

# Build Frontend Production Dist
cd /var/www/blindhire/frontend
npm install
npm run build

# Configure Nginx
sudo cp /var/www/blindhire/deploy/nginx.conf /etc/nginx/sites-available/blindhire
sudo ln -sf /etc/nginx/sites-available/blindhire /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Start Backend via PM2
cd /var/www/blindhire
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup

echo "✅ AWS EC2 Deployment Complete! Nginx is serving your dApp on Port 80."
