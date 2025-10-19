/**
 * Product Management System - Vanilla JavaScript
 * Advanced state management, AJAX operations, and UI interactions
 */

// State Management
const AppState = {
    filters: {
        category: '',
        search: '',
        sortBy: 'name',
        sortOrder: 'asc'
    },
    currentPage: 1,
    paginationType: 'numbered', // 'numbered' or 'loadmore'
    activeTab: 'products',
    
    // Load state from localStorage
    loadFromStorage() {
        const saved = localStorage.getItem('productManagementState');
        if (saved) {
            const state = JSON.parse(saved);
            this.filters = { ...this.filters, ...state.filters };
            this.paginationType = state.paginationType || 'numbered';
            this.activeTab = state.activeTab || 'products';
        }
    },
    
    // Save state to localStorage
    saveToStorage() {
        const state = {
            filters: this.filters,
            paginationType: this.paginationType,
            activeTab: this.activeTab
        };
        localStorage.setItem('productManagementState', JSON.stringify(state));
    },
    
    // Update filter and save
    updateFilter(key, value) {
        this.filters[key] = value;
        this.currentPage = 1; // Reset to first page when filters change
        this.saveToStorage();
    },
    
    // Update pagination type
    updatePaginationType(type) {
        this.paginationType = type;
        this.currentPage = 1;
        this.saveToStorage();
    },
    
    // Update active tab
    updateActiveTab(tab) {
        this.activeTab = tab;
        this.saveToStorage();
    }
};

// API Module
const API = {
    // Get CSRF token from meta tag
    getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    },
    
    // Generic fetch function with error handling
    async fetch(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': this.getCSRFToken(),
                'Accept': 'application/json',
                ...options.headers
            }
        };
        
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'An error occurred');
        }
        
        return response.json();
    },
    
    // Product operations
    async fetchProducts(params = {}) {
        const queryString = new URLSearchParams({
            ...AppState.filters,
            page: AppState.currentPage,
            ...params
        }).toString();
        
        const response = await fetch(`/products/list?${queryString}`);
        return response.text();
    },
    
    async createProduct(data) {
        return this.fetch('/products', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async updateProduct(id, data) {
        return this.fetch(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async deleteProduct(id) {
        return this.fetch(`/products/${id}`, {
            method: 'DELETE'
        });
    },
    
    async getProduct(id) {
        return this.fetch(`/products/${id}/edit`);
    },
    
    // Category operations
    async fetchCategories() {
        const response = await fetch('/categories/list');
        return response.text();
    },
    
    async createCategory(data) {
        return this.fetch('/categories', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async updateCategory(id, data) {
        return this.fetch(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async deleteCategory(id) {
        return this.fetch(`/categories/${id}`, {
            method: 'DELETE'
        });
    },
    
    async getCategory(id) {
        return this.fetch(`/categories/${id}/edit`);
    }
};

// UI Module
const UI = {
    // Show loading state
    showLoading(element) {
        element.classList.add('loading');
    },
    
    // Hide loading state
    hideLoading(element) {
        element.classList.remove('loading');
    },
    
    // Render product list
    async renderProductList(html) {
        const container = document.getElementById('products-container');
        container.innerHTML = html;
    },
    
    // Render category list
    async renderCategoryList(html) {
        const container = document.getElementById('categories-container');
        container.innerHTML = html;
    },
    
    // Show modal
    showModal(title, content, showFooter = true) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        const modalFooter = document.getElementById('modal-footer');
        
        modalTitle.textContent = title;
        modalContent.innerHTML = content;
        modalFooter.style.display = showFooter ? 'flex' : 'none';
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus trap
        this.setupFocusTrap(modal);
        
        // Focus first input
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    },
    
    // Hide modal
    hideModal() {
        const modal = document.getElementById('modal');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Clear content
        document.getElementById('modal-content').innerHTML = '';
    },
    
    // Setup focus trap for modal
    setupFocusTrap(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };
        
        modal.addEventListener('keydown', handleTabKey);
        
        // Store cleanup function
        modal._cleanupFocusTrap = () => {
            modal.removeEventListener('keydown', handleTabKey);
        };
    },
    
    // Show toast notification
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const template = document.getElementById('toast-template');
        const toast = template.cloneNode(true);
        
        toast.id = `toast-${Date.now()}`;
        toast.classList.remove('hidden');
        
        const title = toast.querySelector('#toast-title');
        const messageEl = toast.querySelector('#toast-message');
        const icon = toast.querySelector('#toast-icon');
        const successIcon = toast.querySelector('#success-icon');
        const errorIcon = toast.querySelector('#error-icon');
        
        if (type === 'success') {
            title.textContent = 'Success';
            successIcon.classList.remove('hidden');
            errorIcon.classList.add('hidden');
            toast.querySelector('.toast').classList.add('bg-green-50', 'border-green-200');
        } else {
            title.textContent = 'Error';
            errorIcon.classList.remove('hidden');
            successIcon.classList.add('hidden');
            toast.querySelector('.toast').classList.add('bg-red-50', 'border-red-200');
        }
        
        messageEl.textContent = message;
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            this.hideToast(toast);
        }, 5000);
        
        // Close button
        toast.querySelector('#toast-close').addEventListener('click', () => {
            this.hideToast(toast);
        });
    },
    
    // Hide toast notification
    hideToast(toast) {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    },
    
    // Enable inline editing
    enableInlineEdit(element, field) {
        const currentValue = element.textContent.trim();
        const isPrice = field === 'price';
        const isStock = field === 'stock';
        
        let input;
        if (isPrice || isStock) {
            input = document.createElement('input');
            input.type = 'number';
            input.step = isPrice ? '0.01' : '1';
            input.min = '0';
            input.value = isPrice ? currentValue.replace('$', '') : currentValue;
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.value = currentValue;
        }
        
        input.className = 'inline-edit-field';
        input.setAttribute('data-field', field);
        
        const buttons = document.createElement('div');
        buttons.className = 'inline-edit-buttons';
        buttons.innerHTML = `
            <button type="button" class="inline-edit-save">Save</button>
            <button type="button" class="inline-edit-cancel">Cancel</button>
        `;
        
        element.innerHTML = '';
        element.appendChild(input);
        element.appendChild(buttons);
        
        input.focus();
        input.select();
        
        // Event listeners
        const saveBtn = buttons.querySelector('.inline-edit-save');
        const cancelBtn = buttons.querySelector('.inline-edit-cancel');
        
        const save = () => {
            const newValue = input.value.trim();
            if (newValue !== currentValue) {
                this.saveInlineEdit(element, field, newValue);
            } else {
                this.cancelInlineEdit(element, currentValue);
            }
        };
        
        const cancel = () => {
            this.cancelInlineEdit(element, currentValue);
        };
        
        saveBtn.addEventListener('click', save);
        cancelBtn.addEventListener('click', cancel);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') cancel();
        });
    },
    
    // Save inline edit
    async saveInlineEdit(element, field, value) {
        const productId = element.closest('.product-card').dataset.productId;
        const data = { [field]: value };
        
        try {
            this.showLoading(element);
            await API.updateProduct(productId, data);
            this.showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
            this.cancelInlineEdit(element, value);
            // Refresh the product list to show updated data
            await EventHandlers.loadProducts();
        } catch (error) {
            this.showToast(error.message, 'error');
            this.cancelInlineEdit(element, element.textContent.trim());
        } finally {
            this.hideLoading(element);
        }
    },
    
    // Cancel inline edit
    cancelInlineEdit(element, originalValue) {
        element.innerHTML = originalValue;
    },
    
    // Update pagination type display
    updatePaginationTypeDisplay() {
        const button = document.getElementById('pagination-toggle');
        const text = document.getElementById('pagination-text');
        text.textContent = AppState.paginationType === 'numbered' ? 'Load More' : 'Numbered';
    }
};

// Event Handlers
const EventHandlers = {
    // Initialize all event listeners
    init() {
        this.setupTabSwitching();
        this.setupFilters();
        this.setupButtons();
        this.setupModals();
        this.setupPaginationToggle();
        this.loadInitialData();
    },
    
    // Setup tab switching
    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Update active tab
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
                
                // Show target content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${targetTab}-content`).classList.add('active');
                
                AppState.updateActiveTab(targetTab);
                
                // Load appropriate data
                if (targetTab === 'products') {
                    this.loadProducts();
                } else {
                    this.loadCategories();
                }
            });
        });
    },
    
    // Setup filter controls
    setupFilters() {
        const searchInput = document.getElementById('search');
        const categoryFilter = document.getElementById('category-filter');
        const sortSelect = document.getElementById('sort-select');
        const sortOrder = document.getElementById('sort-order');
        
        // Debounced search
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                AppState.updateFilter('search', searchInput.value);
                this.loadProducts();
            }, 300);
        });
        
        // Category filter
        categoryFilter.addEventListener('change', () => {
            AppState.updateFilter('category', categoryFilter.value);
            this.loadProducts();
        });
        
        // Sort controls
        sortSelect.addEventListener('change', () => {
            AppState.updateFilter('sortBy', sortSelect.value);
            this.loadProducts();
        });
        
        sortOrder.addEventListener('click', () => {
            const newOrder = AppState.filters.sortOrder === 'asc' ? 'desc' : 'asc';
            AppState.updateFilter('sortOrder', newOrder);
            
            // Update icon
            const icon = sortOrder.querySelector('svg path');
            icon.setAttribute('d', newOrder === 'asc' ? 
                'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'
            );
            
            this.loadProducts();
        });
    },
    
    // Setup buttons
    setupButtons() {
        // Add product button
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.showProductForm();
        });
        
        // Add category button
        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.showCategoryForm();
        });
    },
    
    // Setup modals
    setupModals() {
        const modal = document.getElementById('modal');
        const closeBtn = document.getElementById('modal-close');
        const cancelBtn = document.getElementById('modal-cancel');
        const confirmBtn = document.getElementById('modal-confirm');
        const backdrop = document.getElementById('modal-backdrop');
        
        // Close modal handlers
        [closeBtn, cancelBtn, backdrop].forEach(element => {
            element.addEventListener('click', () => {
                UI.hideModal();
            });
        });
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                UI.hideModal();
            }
        });
        
        // Confirm button (for delete confirmation)
        confirmBtn.addEventListener('click', () => {
            if (confirmBtn.dataset.action === 'delete-product') {
                this.deleteProduct(confirmBtn.dataset.productId);
            } else if (confirmBtn.dataset.action === 'delete-category') {
                this.deleteCategory(confirmBtn.dataset.categoryId);
            }
        });
    },
    
    // Setup pagination toggle
    setupPaginationToggle() {
        document.getElementById('pagination-toggle').addEventListener('click', () => {
            const newType = AppState.paginationType === 'numbered' ? 'loadmore' : 'numbered';
            AppState.updatePaginationType(newType);
            UI.updatePaginationTypeDisplay();
            this.loadProducts();
        });
    },
    
    // Load initial data
    async loadInitialData() {
        AppState.loadFromStorage();
        UI.updatePaginationTypeDisplay();
        
        if (AppState.activeTab === 'products') {
            await this.loadProducts();
        } else {
            await this.loadCategories();
        }
    },
    
    // Load products
    async loadProducts() {
        try {
            const container = document.getElementById('products-container');
            UI.showLoading(container);
            
            const html = await API.fetchProducts();
            await UI.renderProductList(html);
            
            this.setupProductEventListeners();
        } catch (error) {
            UI.showToast('Failed to load products', 'error');
        }
    },
    
    // Load categories
    async loadCategories() {
        try {
            const container = document.getElementById('categories-container');
            UI.showLoading(container);
            
            const html = await API.fetchCategories();
            await UI.renderCategoryList(html);
            
            this.setupCategoryEventListeners();
        } catch (error) {
            UI.showToast('Failed to load categories', 'error');
        }
    },
    
    // Setup product event listeners
    setupProductEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.editProduct(btn.dataset.productId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.confirmDeleteProduct(btn.dataset.productId, btn.dataset.productName);
            });
        });
        
        // Inline edit buttons
        document.querySelectorAll('.inline-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const field = btn.dataset.field;
                const fieldElement = btn.closest('.product-card').querySelector(`[data-field="${field}"]`);
                UI.enableInlineEdit(fieldElement, field);
            });
        });
    },
    
    // Setup category event listeners
    setupCategoryEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.editCategory(btn.dataset.categoryId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.confirmDeleteCategory(btn.dataset.categoryId, btn.dataset.categoryName, btn.dataset.productsCount);
            });
        });
    },
    
    // Show product form
    showProductForm(productId = null) {
        const template = document.getElementById('product-form-template');
        const form = template.cloneNode(true);
        form.id = 'product-form-modal';
        form.classList.remove('hidden');
        
        if (productId) {
            form.querySelector('#modal-title').textContent = 'Edit Product';
            this.loadProductData(productId, form);
        } else {
            form.querySelector('#modal-title').textContent = 'Add Product';
        }
        
        UI.showModal('Product Form', form.innerHTML);
        this.setupProductForm();
    },
    
    // Show category form
    showCategoryForm(categoryId = null) {
        const template = document.getElementById('category-form-template');
        const form = template.cloneNode(true);
        form.id = 'category-form-modal';
        form.classList.remove('hidden');
        
        if (categoryId) {
            form.querySelector('#modal-title').textContent = 'Edit Category';
            this.loadCategoryData(categoryId, form);
        } else {
            form.querySelector('#modal-title').textContent = 'Add Category';
        }
        
        UI.showModal('Category Form', form.innerHTML);
        this.setupCategoryForm();
    },
    
    // Setup product form
    setupProductForm() {
        const form = document.getElementById('product-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitProductForm(form);
        });
    },
    
    // Setup category form
    setupCategoryForm() {
        const form = document.getElementById('category-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitCategoryForm(form);
        });
    },
    
    // Submit product form
    async submitProductForm(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            if (data.id) {
                await API.updateProduct(data.id, data);
                UI.showToast('Product updated successfully');
            } else {
                await API.createProduct(data);
                UI.showToast('Product created successfully');
            }
            
            UI.hideModal();
            await this.loadProducts();
        } catch (error) {
            UI.showToast(error.message, 'error');
        }
    },
    
    // Submit category form
    async submitCategoryForm(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            if (data.id) {
                await API.updateCategory(data.id, data);
                UI.showToast('Category updated successfully');
            } else {
                await API.createCategory(data);
                UI.showToast('Category created successfully');
            }
            
            UI.hideModal();
            await this.loadCategories();
            // Refresh product form category options
            await this.loadProducts();
        } catch (error) {
            UI.showToast(error.message, 'error');
        }
    },
    
    // Load product data for editing
    async loadProductData(productId, form) {
        try {
            const response = await API.getProduct(productId);
            const product = response.product;
            
            form.querySelector('#product-id').value = product.id;
            form.querySelector('#product-name').value = product.name;
            form.querySelector('#product-price').value = product.price;
            form.querySelector('#product-category').value = product.category_id;
            form.querySelector('#product-stock').value = product.stock;
            form.querySelector('#product-status').value = product.status;
            form.querySelector('#product-description').value = product.description || '';
        } catch (error) {
            UI.showToast('Failed to load product data', 'error');
        }
    },
    
    // Load category data for editing
    async loadCategoryData(categoryId, form) {
        try {
            const response = await API.getCategory(categoryId);
            const category = response.category;
            
            form.querySelector('#category-id').value = category.id;
            form.querySelector('#category-name').value = category.name;
            form.querySelector('#category-description').value = category.description || '';
        } catch (error) {
            UI.showToast('Failed to load category data', 'error');
        }
    },
    
    // Edit product
    async editProduct(productId) {
        this.showProductForm(productId);
    },
    
    // Edit category
    async editCategory(categoryId) {
        this.showCategoryForm(categoryId);
    },
    
    // Confirm delete product
    confirmDeleteProduct(productId, productName) {
        const template = document.getElementById('delete-confirmation-template');
        const content = template.cloneNode(true);
        content.classList.remove('hidden');
        
        content.querySelector('#delete-item-name').textContent = productName;
        
        UI.showModal('Delete Product', content.innerHTML);
        
        const confirmBtn = document.getElementById('modal-confirm');
        confirmBtn.dataset.action = 'delete-product';
        confirmBtn.dataset.productId = productId;
    },
    
    // Confirm delete category
    confirmDeleteCategory(categoryId, categoryName, productsCount) {
        if (parseInt(productsCount) > 0) {
            UI.showToast('Cannot delete category with existing products', 'error');
            return;
        }
        
        const template = document.getElementById('delete-confirmation-template');
        const content = template.cloneNode(true);
        content.classList.remove('hidden');
        
        content.querySelector('#delete-item-name').textContent = categoryName;
        
        UI.showModal('Delete Category', content.innerHTML);
        
        const confirmBtn = document.getElementById('modal-confirm');
        confirmBtn.dataset.action = 'delete-category';
        confirmBtn.dataset.categoryId = categoryId;
    },
    
    // Delete product
    async deleteProduct(productId) {
        try {
            await API.deleteProduct(productId);
            UI.showToast('Product deleted successfully');
            UI.hideModal();
            await this.loadProducts();
        } catch (error) {
            UI.showToast(error.message, 'error');
        }
    },
    
    // Delete category
    async deleteCategory(categoryId) {
        try {
            await API.deleteCategory(categoryId);
            UI.showToast('Category deleted successfully');
            UI.hideModal();
            await this.loadCategories();
        } catch (error) {
            UI.showToast(error.message, 'error');
        }
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    EventHandlers.init();
});
