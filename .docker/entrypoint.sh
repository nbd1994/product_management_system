#!/usr/bin/env sh
set -e

# Port from Render (or default)
PORT="${PORT:-8080}"

# Generate a minimal nginx config that listens on $PORT
cat > /tmp/nginx.conf <<EOF
worker_processes auto;
events { worker_connections 1024; }
http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  sendfile      on;
  keepalive_timeout 65;

  server {
    listen ${PORT};
    server_name _;

    root /var/www/html/public;
    index index.php index.html;

    location / {
      try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
      include fastcgi_params;
      fastcgi_pass 127.0.0.1:9000;
      fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
      fastcgi_param PATH_INFO \$fastcgi_path_info;
    }

    location ~* \.(?:css|js|png|jpg|jpeg|gif|ico|svg)$ {
      expires 7d;
      access_log off;
    }
  }
}
EOF

# Warm caches and run migrations (soft-fail)
php artisan key:generate --force || true
php artisan config:cache || true
php artisan route:cache || true
php artisan migrate --force || true

# Start PHP-FPM in background, then Nginx in foreground
if command -v php-fpm >/dev/null 2>&1; then
  php-fpm -D 2>/dev/null || php-fpm -F &
else
  # Some images name the binary php-fpm8.x
  PHP_FPM_BIN="$(command -v php-fpm8.3 || command -v php-fpm8.2 || true)"
  [ -n "$PHP_FPM_BIN" ] && "$PHP_FPM_BIN" -D 2>/dev/null || "$PHP_FPM_BIN" -F &
fi

exec nginx -g "daemon off;" -c /tmp/nginx.conf