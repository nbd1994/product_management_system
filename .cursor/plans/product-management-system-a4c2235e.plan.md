<!-- a4c2235e-01a0-4584-864d-4229b127c399 b63ce759-e2e3-4e79-bdfc-281f782e0b1c -->
# Laravel + Vanilla JS Product Management System

## Database Schema & Models

### Migrations

- Create `categories` table: id, name, description (nullable), created_at, updated_at
- Create `products` table: id, name, price (decimal 10,2), description (text), category_id (foreign), stock (integer), status (enum: Active/Inactive), created_at, updated_at

### Models & Factories

- `Category` model with hasMany products relationship
- `Product` model with belongsTo category relationship, status enum cast
- Create factories for both models with realistic fake data
- Create seeders to populate initial data (10 categories, 50 products)

## Backend Architecture

### Routes (web.php)

- `GET /products` - Main product management page (Blade view)
- `GET /products/list` - AJAX endpoint returning product list partial
- `POST /products` - Create product (Form Request validation)
- `GET /products/{id}/edit` - Get product data for editing (JSON)
- `PUT /products/{id}` - Update product (Form Request validation)
- `DELETE /products/{id}` - Delete product
- Category routes: GET/POST/PUT/DELETE `/categories`

### Controllers

- `ProductController` with CRUD methods
  - Index: render main page
  - List: return partial with products (handle filter, search, sort, pagination)
  - Store/Update with Form Request validation
  - Destroy with JSON response
- `CategoryController` with similar structure

### Form Requests

- `StoreProductRequest` - validation rules for name (required, max:255), price (required, decimal:2, min:0), description (nullable), category_id (required, exists), stock (required, integer, min:0), status (required, in:Active,Inactive)
- `UpdateProductRequest` - same rules
- `StoreCategoryRequest` / `UpdateCategoryRequest` - name (required, max:255), description (nullable)

### Blade Structure

- `resources/views/products/index.blade.php` - Main container with filters, tabs, product grid container
- `resources/views/products/partials/list.blade.php` - Product cards grid partial
- `resources/views/products/partials/card.blade.php` - Single product card component
- `resources/views/components/modal.blade.php` - Reusable modal component
- `resources/views/components/toast.blade.php` - Toast notification component
- Layout includes meta CSRF token for AJAX

## Frontend Architecture (Vanilla JS)

### File: `resources/js/products.js`

#### State Management Object

```javascript
const AppState = {
  filters: { category: '', search: '', sortBy: 'name', sortOrder: 'asc' },
  currentPage: 1,
  paginationType: 'numbered', // or 'loadmore'
  loadFromStorage() { /* load from localStorage */ },
  saveToStorage() { /* save to localStorage */ },
  updateFilter(key, value) { /* update and save */ }
}
```

#### API Module

- `fetchProducts(params)` - GET request to /products/list
- `createProduct(data)` - POST request
- `updateProduct(id, data)` - PUT request
- `deleteProduct(id)` - DELETE request
- Similar category methods
- Handle CSRF token from meta tag

#### UI Module

- `renderProductList(html)` - Update product grid container
- `showModal(type, data)` - Open modal (create/edit product/category)
- `hideModal()` - Close modal with proper cleanup
- `showToast(message, type)` - Display success/error toast with auto-dismiss (3s)
- `enableInlineEdit(element)` - Toggle inline editing for quick fields
- `disableInlineEdit(element)` - Save inline changes

#### Event Handlers

- Filter dropdown change → debounced fetch
- Search input → debounced fetch (300ms)
- Sort buttons → fetch with new sort params
- Pagination clicks → fetch specific page
- Toggle pagination type → switch between numbered/loadmore
- Product card click → show edit modal
- Inline edit triggers → enable editing for name, price, stock
- Delete button → show confirmation modal, then delete
- Form submissions → validate, submit via AJAX

#### Form Validation (Client-side)

- Real-time validation on blur/input
- Display error messages inline
- Prevent submission if invalid
- Show validation states (red borders, error text)

### File: `resources/css/products.css`

#### Styling

- Modern card design with shadows (`box-shadow: 0 4px 6px rgba(0,0,0,0.1)`)
- Smooth hover effects (transform: translateY(-2px))
- Responsive grid layout (CSS Grid: 1 col mobile, 2 col tablet, 3-4 col desktop)
- Modal backdrop with blur effect
- Toast positioning (fixed top-right)
- Inline edit styling (border highlight, input fields)
- Filter bar with flexbox layout
- Tab navigation for Products/Categories sections
- Loading states and animations
- Accessibility focus styles

## Key Features Implementation

### 1. Combined Filter + Search + Sort

- All three controls update AppState
- Single debounced fetch function checks all params
- Server-side query builder applies all filters
- URL params reflect state for bookmarkability

### 2. Pagination (Both Types)

- Toggle button switches between types
- Numbered: Generate page links, highlight current
- Load More: Append results, track page state
- Scroll memory: Save scroll position to sessionStorage, restore on back navigation

### 3. Modal Forms

- Create/Edit forms in modal with client + server validation
- Focus trap implementation (Tab cycles within modal)
- Escape key closes modal
- Click outside closes modal
- Prevent body scroll when modal open

### 4. Inline Editing

- Double-click or click edit icon on name/price/stock fields
- Show input fields in-place
- Save on blur or Enter key
- Cancel on Escape key
- Show loading indicator during save

### 5. Confirmation Dialog

- Custom modal for delete confirmation
- Show product name in message
- Confirm/Cancel buttons
- Keyboard navigation (Enter = confirm, Esc = cancel)

### 6. Category CRUD

- Tab/section toggle between Products and Categories
- Separate grid for categories
- Same modal pattern for create/edit
- Validation for category usage before delete

### 7. Accessibility

- ARIA labels on interactive elements
- Focus trap in modals
- Keyboard navigation (Tab, Enter, Escape)
- Proper heading hierarchy
- Screen reader announcements for dynamic updates

## Testing Strategy

### Feature Tests (Pest)

- Product CRUD operations
- Category CRUD with cascade rules
- Filter/search/sort combinations
- Pagination responses
- Validation error responses
- AJAX endpoint responses

### Browser Tests (Pest v4)

- Complete user flow: create, edit, delete product
- Filter + search + sort interaction
- Modal open/close/submit
- Inline editing workflow
- Toast notifications appear/dismiss
- Pagination type toggle
- Accessibility (focus trap, keyboard nav)

## File Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── ProductController.php
│   │   └── CategoryController.php
│   └── Requests/
│       ├── StoreProductRequest.php
│       ├── UpdateProductRequest.php
│       ├── StoreCategoryRequest.php
│       └── UpdateCategoryRequest.php
├── Models/
│   ├── Product.php
│   └── Category.php
database/
├── migrations/
│   ├── xxxx_create_categories_table.php
│   └── xxxx_create_products_table.php
├── factories/
│   ├── CategoryFactory.php
│   └── ProductFactory.php
└── seeders/
    └── DatabaseSeeder.php (updated)
resources/
├── views/
│   ├── products/
│   │   ├── index.blade.php
│   │   └── partials/
│   │       ├── list.blade.php
│   │       └── card.blade.php
│   └── components/
│       ├── modal.blade.php
│       └── toast.blade.php
├── css/
│   └── products.css
└── js/
    └── products.js
tests/
├── Feature/
│   ├── ProductManagementTest.php
│   └── CategoryManagementTest.php
└── Browser/
    └── ProductManagementWorkflowTest.php
```

### To-dos

- [ ] Create migrations for categories and products tables with proper fields and relationships
- [ ] Create Category and Product models with relationships, enums, factories, and seeders
- [ ] Create Form Request classes for product and category validation
- [ ] Build ProductController and CategoryController with CRUD methods, set up routes
- [ ] Create main products index view with filter controls, tabs, and container structure
- [ ] Create Blade partials for product list, product card, and reusable components (modal, toast)
- [ ] Create products.css with modern card-based design, responsive grid, modal, toast, and accessibility styles
- [ ] Build JavaScript state management with localStorage persistence for filters, search, sort, and pagination
- [ ] Create API module for all AJAX operations (fetch, create, update, delete products/categories)
- [ ] Build UI module for rendering, modals, toasts, and inline editing functionality
- [ ] Implement event handlers for filters, search, sort, pagination, forms, and inline editing
- [ ] Add real-time client-side form validation with error display
- [ ] Implement focus trap, keyboard navigation, ARIA labels, and screen reader support
- [ ] Write Pest feature tests for product/category CRUD, filtering, sorting, validation
- [ ] Write Pest browser tests for complete user workflows and interactions
- [ ] Run all tests, format with Pint, verify all features work together