#!/usr/bin/env sh
set -e

# Make Nginx listen on the port Render provides
PORT="${PORT:-8080}"
if [ -f /etc/nginx/conf.d/default.conf ]; then
  sed -i "s/listen 8080;/listen ${PORT};/g" /etc/nginx/conf.d/default.conf || true
fi

# Warm caches and run migrations (don’t fail hard on first boot)
php artisan key:generate --force || true
php artisan config:cache || true
php artisan route:cache || true
php artisan migrate --force || true

# Start services (trafex image uses supervisord)
exec /usr/bin/supervisord -c /etc/supervisord.conf