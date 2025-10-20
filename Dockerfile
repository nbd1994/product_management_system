# 1) Composer deps
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-progress --no-interaction --optimize-autoloader --no-scripts
COPY . .
RUN composer dump-autoload -o

# 2) Frontend build
FROM node:20 AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY resources resources
COPY vite.config.js ./
COPY tailwind.config.js* postcss.config.js* ./
RUN npm run build

# 3) Final runtime (non-root PHP + Nginx)
FROM trafex/php-nginx:latest

# Become root for file ops during build
USER root
WORKDIR /var/www/html

# Copy app code, vendor, and built assets with correct ownership
COPY --chown=nobody:nobody . .
COPY --chown=nobody:nobody --from=vendor /app/vendor /var/www/html/vendor
COPY --chown=nobody:nobody --from=frontend /app/public/build /var/www/html/public/build

# Ensure writable dirs
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache \
 && chown -R nobody:nobody /var/www/html/storage /var/www/html/bootstrap/cache \
 && chmod -R ug+rwX /var/www/html/storage /var/www/html/bootstrap/cache

# Entrypoint
COPY --chown=nobody:nobody .docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Drop privileges for runtime
USER nobody

CMD ["/entrypoint.sh"]