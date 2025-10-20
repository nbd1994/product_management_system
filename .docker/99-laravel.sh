#!/usr/bin/env bash
set -e

# Make Nginx listen on the port Render provides
export LISTEN_PORT="${PORT:-8080}"

# Warm caches and run migrations on boot
php artisan key:generate --force || true
php artisan config:cache
php artisan route:cache
# php artisan migrate --force || true