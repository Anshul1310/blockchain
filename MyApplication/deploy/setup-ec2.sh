#!/bin/bash

echo "🚀 Starting AWS EC2 Setup for BlindHire AI (benchbae.in)..."

if [ ! -f /swapfile ]; then
    echo "Creating 1GB Swap file for RAM optimization..."
    sudo fallocate -l 1G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

sudo apt update && sudo apt upgrade -y

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2

sudo mkdir -p /var/www/blindhire
sudo chown -R $USER:$USER /var/www/blindhire

cp -r . /var/www/blindhire/

if [ ! -f /var/www/blindhire/backend/.env ]; then
    echo "Creating default backend/.env file..."
    cat <<EOT > /var/www/blindhire/backend/.env
PORT=5000
NODE_ENV=production
JWT_SECRET=super_secret_jwt_key_blindhire_2026_sepolia_zk
GROQ_API_KEY=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
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
IPFS_GATEWAY=https://ipfs.io/ipfs/
EOT
fi

cd /var/www/blindhire/shared
npm install
npm run build

cd /var/www/blindhire/backend
npm install
npm run build

cd /var/www/blindhire/frontend
npm install
npm run build

sudo cp /var/www/blindhire/deploy/nginx.conf /etc/nginx/sites-available/blindhire
sudo ln -sf /etc/nginx/sites-available/blindhire /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

cd /var/www/blindhire
pm2 delete blindhire-backend 2>/dev/null || true
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup

echo "✅ AWS EC2 Setup Complete! Nginx is serving your dApp on Port 80."
