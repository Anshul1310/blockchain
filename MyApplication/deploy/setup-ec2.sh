#!/bin/bash

echo "🚀 Starting AWS EC2 t2.micro Setup for BlindHire AI..."

# 1. Create 1GB Swap File for t2.micro (Prevents OOM during build)
if [ ! -f /swapfile ]; then
    echo "Creating 1GB Swap file for t2.micro RAM optimization..."
    sudo fallocate -l 1G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 2. Update package manager
sudo apt update && sudo apt upgrade -y

# 3. Install Node.js 20, Nginx, Git, PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2

# 4. Create Deployment Folder
sudo mkdir -p /var/www/blindhire
sudo chown -R $USER:$USER /var/www/blindhire

# 5. Copy Repository Files
cp -r . /var/www/blindhire/

# 6. Build Shared Package
cd /var/www/blindhire/shared
npm install
npm run build

# 7. Build Backend
cd /var/www/blindhire/backend
npm install
npm run build

# 8. Build Frontend Production Dist
cd /var/www/blindhire/frontend
npm install
npm run build

# 9. Configure Nginx
sudo cp /var/www/blindhire/deploy/nginx.conf /etc/nginx/sites-available/blindhire
sudo ln -sf /etc/nginx/sites-available/blindhire /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 10. Start Backend via PM2
cd /var/www/blindhire
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup

echo "✅ AWS EC2 t2.micro Deployment Complete! Nginx is serving your dApp on Port 80."
