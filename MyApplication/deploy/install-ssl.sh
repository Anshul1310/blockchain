#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./deploy/install-ssl.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1

echo "🔒 Installing Let's Encrypt Certbot SSL for domain: $DOMAIN..."

sudo apt update
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email

sudo systemctl status certbot.timer

echo "✅ SSL Certificate Installed Successfully! HTTPS is active at https://$DOMAIN"
