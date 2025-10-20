# Product Management System (Laravel + Vanilla JS)

A simple, fast Product and Category management system built with Laravel and Vanilla JavaScript. It supports AJAX-powered CRUD, filtering, search, sorting, pagination (numbered and “load more”), inline editing, modals, and toast notifications.

![Home Screen](docs/screenshot-home.png)

Table of Contents
- Overview
- Features
- Tech Stack
- Architecture
- Screenshots
- Getting Started
  - Option A: Run with Docker (recommended)
  - Option B: Run locally (PHP/Composer/Node)
- Environment Variables
- Database Schema
- Routes
- Frontend (Vite)
- Testing
- Deployment (Render)
- Troubleshooting
- Project Structure
- License

## Overview
This project is a CRUD web app for managing Products and Categories. It demonstrates a clean Laravel backend and a structured Vanilla JS frontend, providing a responsive UI and modern UX patterns without heavy frameworks.

## Features
- Products
  - Create, read, update, delete
  - Inline editing for name, price, stock
  - Client + server validation
- Categories
  - Full CRUD
  - Validate usage before delete
- Filters, Search, Sort
  - Combined filter+search+sort, debounced
  - Stateful with localStorage
- Pagination
  - Numbered pagination and “Load More” mode
- Modals & Toasts
  - Accessible modals (focus trap, Esc/Enter)
  - Auto-dismissing toasts
- Accessibility
  - ARIA labels, keyboard navigation, focus styles
- Architecture
  - Blade views + JS modules
  - Laravel Form Requests, Controllers, AJAX endpoints

## Tech Stack
- Backend: Laravel 12 (PHP 8.3)
- Frontend: Vanilla JS, Vite, Tailwind
- DB: SQLite
- Container: Multi-stage Docker (Composer, Node, PHP+Nginx)

## Architecture
- Backend
  - Controllers: ProductController, CategoryController
  - Requests: Store/Update Product & Category
  - Routes: Web routes return Blade/partials + JSON for AJAX
- Frontend
  - resources/js/products.js: AppState, API module, UI module, EventHandlers
  - AJAX calls hit /products/list and CRUD endpoints
- Views
  - Main page: resources/views/products/index.blade.php
  - Partials for list and card components


## Getting Started

### Prerequisites
- Option A (Docker): Docker Desktop installed
- Option B (Local): PHP 8.3+, Composer, Node 20+, npm

### Option A: Run with Docker (recommended)
The repository includes a Dockerfile that builds vendor dependencies, builds frontend assets, and runs PHP+Nginx. An entrypoint script warms caches and runs migrations.

- Build the image
  - PowerShell (Windows):
    - cd "c:\Users\Natnael Desalegn\Herd\product_management_system"
    - docker build -t pms:latest .

- Run with SQLite (no external DB)
  - Prepare .env and SQLite file:
    - copy .env.example .env
    - ni .\database\database.sqlite -ItemType File
    - Edit .env:
      - APP_ENV=local
      - APP_DEBUG=true
      - DB_CONNECTION=sqlite
      - Comment out DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
  - Start the container:
    - docker run --rm -p 8080:8080 -e PORT=8080 --name pms pms:latest
  - Open http://localhost:8080/products

### Option B: Run locally (PHP/Composer/Node)
- Install dependencies
  - composer install
  - npm install

- Environment
  - copy .env.example .env
  - php artisan key:generate
  - Configure DB in .env (SQLite recommended for quick start)
    - For SQLite: DB_CONNECTION=sqlite and create database/database.sqlite

- Database
  - php artisan migrate --seed

- Build frontend
  - npm run dev   (hot dev server)
  - or npm run build (production)

- Serve
  - php artisan serve
  - Open http://127.0.0.1:8000/products

## Database Schema
- categories
  - id, name, description (nullable), timestamps
- products
  - id, name, price (decimal 10,2), description (text), category_id (FK), stock (int), status (Active/Inactive), timestamps

Models
- Category hasMany Product
- Product belongsTo Category; status cast to enum/string

## Routes
- GET /products — Main page
- GET /products/list — Returns product list partial (AJAX)
- POST /products — Create product
- GET /products/{id}/edit — Get product data (JSON)
- PUT /products/{id} — Update product
- DELETE /products/{id} — Delete product
- Categories: GET/POST/PUT/DELETE /categories

## Frontend (Vite)
- Dev: npm run dev
- Build: npm run build
- Assets output: public/build

Key file
- resources/js/products.js
  - AppState with localStorage persistence
  - API module (fetch/create/update/delete for products/categories)
  - UI module (rendering, modals, toasts, inline edit)
  - EventHandlers (filters, search, sort, pagination, forms)

## Testing
- Feature tests (Pest):
  - php artisan test
- If you use browser/E2E tests, configure them per your setup.
- Run Pint (if configured):
  - ./vendor/bin/pint

## Deployment (Render)
This repo ships a Dockerfile that works on Render.

- Create a Web Service (Docker)
- Use repo root as the context
- No build/start command needed (Dockerfile handles it)
- Set environment variables:
  - APP_ENV=production
  - APP_DEBUG=false
  - APP_URL=https://pms-3cvz.onrender.com
- The container listens on $PORT via an entrypoint hook:

Persistent storage
- Container filesystem is ephemeral. Use a cloud storage (S3) for user uploads.

## Troubleshooting
- 404 or blank page
  - Ensure APP_URL matches your access URL
  - Check that public/build exists (npm run build) in production
- 500 errors
  - Ensure APP_KEY is set
  - Run migrations: php artisan migrate --force
- Port issues locally
  - Change the published port: docker run -p 8081:8080 -e PORT=8080 ...
- Permission errors (storage/bootstrap/cache)
  - Ensure writable by the app user (Dockerfile sets this)
- Composer “artisan not found” during build
  - Vendor stage uses --no-scripts and runs dump-autoload after code copy (already handled)

## Project Structure
```
app/
  Http/
    Controllers/
    Requests/
  Models/
database/
  migrations/
  factories/
  seeders/
resources/
  views/
    products/
      index.blade.php
      partials/
        list.blade.php
        card.blade.php
  js/
    products.js
public/
  build/
tests/
Dockerfile
```