// Product Management System - Vanilla JavaScript
console.log('Product Management System loaded');

// State Management
const AppState = {
    filters: {
        category: '',
        search: '',
        sortBy: 'name',
        sortOrder: 'asc'
    },
    currentPage: 1,
    paginationType: 'numbered',
    isEditing: false,
    editingProductId: null,

    categoriesPage: 1,
    
    // Load state from localStorage
    loadFromStorage() {
        const saved = localStorage.getItem('productManagementState');
        if (saved) {
            const state = JSON.parse(saved);
            this.filters = { ...this.filters, ...state.filters };
            this.currentPage = state.currentPage || 1;
            this.paginationType = state.paginationType || 'numbered';
            this.categoriesPage = state.categoriesPage || 1;
        }
    },
    
    // Save state to localStorage
    saveToStorage() {
        const state = {
            filters: this.filters,
            currentPage: this.currentPage,
            paginationType: this.paginationType,
            categoriesPage: this.categoriesPage
        };
        localStorage.setItem('productManagementState', JSON.stringify(state));
    },
    
    // Update filter and save
    updateFilter(key, value) {
        this.filters[key] = value;
        this.currentPage = 1; // Reset to first page when filtering
        this.saveToStorage();
        UI.fetchAndRenderProducts();
    }
};

// API Module
const API = {
    // Get CSRF token from meta tag
    getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    },
    
    // Fetch products with current filters
    async fetchProducts(params = {}) {
        const queryParams = new URLSearchParams({
            category: AppState.filters.category || '',
            search: AppState.filters.search || '',
            sort_by: AppState.filters.sortBy || 'name',
            sort_order: AppState.filters.sortOrder || 'asc',
            page: AppState.currentPage,
            ...params
        });
        
        try {
            const response = await fetch(`/products/list?${queryParams}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.text();
        } catch (error) {
            console.error('Error fetching products:', error);
            UI.showToast('Error loading products', 'error');
            return '';
        }
    },
    
    // Create product
    async createProduct(data) {
        try {
            const response = await fetch('/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.getCSRFToken()
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to create product');
            return result;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },
    
    // Update product
    async updateProduct(id, data) {
        try {
            // Add _method field for Laravel to recognize PUT request
            data._method = 'PUT';
            
            const response = await fetch(`/products/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.getCSRFToken()
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update product');
            return result;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },
    
    // Delete product
    async deleteProduct(id) {
        try {
            const response = await fetch(`/products/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.getCSRFToken()
                },
                body: JSON.stringify({ _method: 'DELETE' })
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to delete product');
            return result;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },
    
    // Fetch categories
    async fetchCategories(params = {}) {
        try {
            const page = params.page ?? AppState.categoriesPage ?? 1;
            const query = new URLSearchParams({ page });
            const response = await fetch(`/categories/list?${query}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            if (!response.ok) throw new Error('Failed to fetch categories');
            return await response.text();
        } catch (error) {
            console.error('Error fetching categories:', error);
            UI.showToast('Error loading categories', 'error');
            return '';
        }
    },
    
    // Create category
    async createCategory(data) {
        try {
            const response = await fetch('/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': this.getCSRFToken()
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to create category');
            return result;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },
    
    // Update category
    async updateCategory(id, data) {
        try {
            // Add _method field for Laravel to recognize PUT request
            data._method = 'PUT';
            
            const response = await fetch(`/categories/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': this.getCSRFToken()
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update category');
            return result;
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    },
    
    // Delete category
    async deleteCategory(id) {
        try {
            const response = await fetch(`/categories/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.getCSRFToken()
                },
                body: JSON.stringify({ _method: 'DELETE' })
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to delete category');
            return result;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }
};

// UI Module
const UI = {
    // Show modal
    showModal(type, data = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        const modalFooter = document.getElementById('modal-footer');
        
        if (type === 'product') {
            modalTitle.textContent = data ? 'Edit Product' : 'Add New Product';
            modalContent.innerHTML = document.getElementById('product-form-template').innerHTML;
            this.setupProductForm(data);
        } else if (type === 'category') {
            modalTitle.textContent = data ? 'Edit Category' : 'Add New Category';
            modalContent.innerHTML = document.getElementById('category-form-template').innerHTML;
            this.setupCategoryForm(data);
        } else if (type === 'delete') {
            modalTitle.textContent = 'Delete Confirmation';
            modalContent.innerHTML = document.getElementById('delete-confirmation-template').innerHTML;
            document.getElementById('delete-item-name').textContent = data.name;
            this.setupDeleteConfirmation(data);
        }
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        const firstInput = modalContent.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
    },
    
    // Hide modal
    hideModal() {
        const modal = document.getElementById('modal');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        AppState.isEditing = false;
        AppState.editingProductId = null;
    },
    
    // Setup product form
    setupProductForm(product = null) {
        const form = document.getElementById('product-form');
        if (product) {
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-description').value = product.description || '';
            document.getElementById('product-category').value = product.category_id;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-status').value = product.status;
        } else {
            form.reset();
        }
        
        // Remove existing event listeners
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Add form submission handler
        newForm.addEventListener('submit', this.handleProductFormSubmit.bind(this));
        
        // Setup modal footer buttons
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');
        
        // Remove existing event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            newForm.requestSubmit();
        });
        newCancelBtn.addEventListener('click', this.hideModal);
    },
    
    // Setup category form
    setupCategoryForm(category = null) {
        const form = document.getElementById('category-form');
        if (category) {
            document.getElementById('category-id').value = category.id;
            document.getElementById('category-name').value = category.name;
            document.getElementById('category-description').value = category.description || '';
        } else {
            form.reset();
        }
        
        // Remove existing event listeners
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Add form submission handler
        newForm.addEventListener('submit', this.handleCategoryFormSubmit.bind(this));
        
        // Setup modal footer buttons
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');
        
        // Remove existing event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            newForm.requestSubmit();
        });
        newCancelBtn.addEventListener('click', this.hideModal);
    },
    
    // Setup delete confirmation
    setupDeleteConfirmation(item) {
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');
        
        // Remove existing event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        newConfirmBtn.addEventListener('click', () => this.handleDeleteConfirm(item));
        newCancelBtn.addEventListener('click', this.hideModal);
    },
    
    // Handle product form submission
    async handleProductFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Convert price to number
        data.price = parseFloat(data.price);
        data.stock = parseInt(data.stock);
        
        try {
            if (data.id) {
                // Update existing product
                await API.updateProduct(data.id, data);
                UI.showToast('Product updated successfully!', 'success');
            } else {
                // Create new product
                await API.createProduct(data);
                UI.showToast('Product created successfully!', 'success');
            }
            
            this.hideModal();
            this.fetchAndRenderProducts();
        } catch (error) {
            UI.showToast(error.message, 'error');
        }
    },
    
    // Handle category form submission
    async handleCategoryFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            let result;
            if (data.id) {
                // Update existing category
                result = await API.updateCategory(data.id, data);
                UI.showToast('Category updated successfully!', 'success');
            } else {
                // Create new category
                result = await API.createCategory(data);
                UI.showToast('Category created successfully!', 'success');
            }

            // Upsert into filters and product form selects immediately
            const cat = result.category || { id: data.id, name: data.name, description: data.description || '' };
            this.updateCategoryFilter(cat);

            this.hideModal();
            this.fetchAndRenderCategories();
        } catch (error) {
            UI.showToast(error.message, 'error');
        }
    },
    
    // Handle delete confirmation
    async handleDeleteConfirm(item) {
        try {
            if (item.type === 'product') {
                await API.deleteProduct(item.id);
                UI.showToast('Product deleted successfully!', 'success');
                this.fetchAndRenderProducts();
            } else if (item.type === 'category') {
                await API.deleteCategory(item.id);
                UI.showToast('Category deleted successfully!', 'success');
                this.fetchAndRenderCategories();
                this.updateCategoryFilter(); // Refresh category filter options
            }
            
            this.hideModal();
        } catch (error) {
            UI.showToast(error.message, 'error');
        }
    },
    
    // Show toast notification
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast-notification p-4 rounded-md shadow-lg text-white ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    },
    
    // Fetch and render products
    async fetchAndRenderProducts() {
        const container = document.getElementById('products-container');
        if (container) {
            container.innerHTML = '<div class="text-center py-8">Loading...</div>';
            
            const html = await API.fetchProducts();
            container.innerHTML = html;
            
            // Re-attach event listeners
            this.attachProductEventListeners();
        }
    },
    
    // Fetch and render categories
    async fetchAndRenderCategories() {
        const container = document.getElementById('categories-container');
        container.innerHTML = '<div class="text-center py-8">Loading...</div>';

        // Reset to first page for categories
        AppState.categoriesPage = 1;
        AppState.saveToStorage();

        const html = await API.fetchCategories({ page: 1 });
        container.innerHTML = html;

        // Re-attach event listeners
        this.attachCategoryEventListeners();
    },

    //Load next page of categories and append
    async loadMoreCategories(nextPage) {
        const container = document.getElementById('categories-container');
        const grid = container.querySelector('#categories-grid');
        if (!grid) return;

        const html = await API.fetchCategories({ page: nextPage });
        if (!html) return;

        const temp = document.createElement('div');
        temp.innerHTML = html;

        const newGrid = temp.querySelector('#categories-grid');
        if (newGrid) {
            Array.from(newGrid.children).forEach(node => grid.appendChild(node));
        }

        // Replace "Load More" container
        const oldMore = container.querySelector('#categories-load-more-container');
        const newMore = temp.querySelector('#categories-load-more-container');
        if (oldMore) oldMore.remove();
        if (newMore) container.appendChild(newMore);

        AppState.categoriesPage = nextPage;
        AppState.saveToStorage();

        // Re-attach handlers for newly added cards and possibly new button
        this.attachCategoryEventListeners();
    },
    
    // Update category filter options
    async updateCategoryFilter(category = null) {
        const select = document.getElementById('category-filter');
        if (!select) return;

        const preserveValue = select.value;

        // If a single category is provided, upsert without extra requests
        if (category) {
            this.upsertCategoryFilterOption(category);
            // Keep previous selection
            select.value = preserveValue;
            return;
        }

        // Fallback: rebuild options from the categories partial HTML
        try {
            const html = await API.fetchCategories();
            if (!html) return;

            const temp = document.createElement('div');
            temp.innerHTML = html;

            const cards = temp.querySelectorAll('.category-card');
            const entries = Array.from(cards).map(card => ({
                id: card.dataset.categoryId,
                name: card.querySelector('.category-name')?.textContent?.trim() ?? `Category ${card.dataset.categoryId}`
            }));

            // Preserve first "All" option if present, otherwise recreate it
            const firstAll = select.querySelector('option[value=""]');
            select.innerHTML = '';
            if (firstAll) {
                select.appendChild(firstAll);
            } else {
                const optAll = document.createElement('option');
                optAll.value = '';
                optAll.textContent = 'All Categories';
                select.appendChild(optAll);
            }

            entries.forEach(({ id, name }) => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = name;
                select.appendChild(opt);
            });

            select.value = preserveValue;
        } catch (err) {
            console.error('Failed to refresh category filter:', err);
        }
    },
    // Insert or update the category option in all relevant selects (filter + product form)
    upsertCategoryFilterOption(category) {
        const ensureOption = (sel) => {
            if (!sel) return;
            let opt = sel.querySelector(`option[value="${category.id}"]`);
            if (!opt) {
                opt = document.createElement('option');
                opt.value = category.id;
                opt.textContent = category.name;
                sel.appendChild(opt);
            } else {
                opt.textContent = category.name;
            }
        };

        // Products tab filter
        ensureOption(document.getElementById('category-filter'));

        // Current product form (if open)
        ensureOption(document.querySelector('#product-form select[name="category_id"]'));

        // Product form template (so newly opened product modals are up to date)
        const templateRoot = document.getElementById('product-form-template');
        if (templateRoot) {
            const templateSelect = templateRoot.querySelector('select[name="category_id"]');
            ensureOption(templateSelect);
        }
    },
    
    // Attach product event listeners
    attachProductEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.edit-product-btn').dataset.productId;
                this.showEditProductModal(productId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.delete-product-btn').dataset.productId;
                const productName = e.target.closest('.delete-product-btn').dataset.productName;
                this.showDeleteConfirmation('product', { id: productId, name: productName });
            });
        });
        
        // Inline edit buttons
        document.querySelectorAll('.inline-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const field = e.target.dataset.field;
                const productCard = e.target.closest('.product-card');
                const productId = productCard.dataset.productId;
                this.enableInlineEdit(productId, field, e.target);
            });
        });
    },
    
    // Attach category event listeners
    attachCategoryEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trigger = e.currentTarget;
                const categoryId =
                    trigger.dataset.categoryId ||
                    trigger.dataset.id ||
                    trigger.closest('.category-card')?.dataset.categoryId;

                if (!categoryId) {
                    console.error('Missing category id on edit button/card');
                    UI.showToast('Invalid category', 'error');
                    return;
                }

                this.showEditCategoryModal(categoryId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.category-card');
                const categoryId = btn.dataset.id || card?.dataset.categoryId;
                const categoryName =
                    card?.querySelector('.category-name')?.textContent ||
                    card?.querySelector('[data-field="name"]')?.textContent ||
                    'this category';
                this.showDeleteConfirmation('category', { id: categoryId, name: categoryName });
            });
        });

        const loadMoreBtn = document.getElementById('categories-load-more');
        if (loadMoreBtn) {
            // Remove any previous listener by cloning
            const clone = loadMoreBtn.cloneNode(true);
            loadMoreBtn.parentNode.replaceChild(clone, loadMoreBtn);
            clone.addEventListener('click', (e) => {
                e.preventDefault();
                const nextPage = parseInt(clone.dataset.nextPage, 10) || (AppState.categoriesPage + 1);
                this.loadMoreCategories(nextPage);
            });
        }

    },
    
    // Show edit product modal
    async showEditProductModal(productId) {
        try {
            const response = await fetch(`/products/${productId}/edit`);
            const result = await response.json();
            this.showModal('product', result.product);
        } catch (error) {
            UI.showToast('Error loading product data', 'error');
        }
    },
    
    // Show edit category modal
    async showEditCategoryModal(categoryId) {
        try {
            const response = await fetch(`/categories/${categoryId}/edit`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
            });
            if (!response.ok) throw new Error('Failed to load category');
            const result = await response.json();
            this.showModal('category', result.category);
        } catch (error) {
            UI.showToast('Error loading category data', 'error');
        }
    },
    
    // Show delete confirmation
    showDeleteConfirmation(type, item) {
        this.showModal('delete', { ...item, type });
    },
    
    // Enable inline editing
    enableInlineEdit(productId, field, button) {
        const productCard = button.closest('.product-card');
        const fieldElement = productCard.querySelector(`[data-field="${field}"]`);
        const currentValue = fieldElement.textContent;
        
        // Create input field
        const input = document.createElement('input');
        input.type = field === 'price' ? 'number' : field === 'stock' ? 'number' : 'text';
        input.value = field === 'price' ? currentValue.replace('$', '') : currentValue;
        input.className = 'inline-edit-field';
        input.step = field === 'price' ? '0.01' : '1';
        input.min = field === 'price' || field === 'stock' ? '0' : undefined;
        
        // Replace field content with input
        fieldElement.style.display = 'none';
        fieldElement.parentNode.insertBefore(input, fieldElement);
        input.focus();
        input.select();
        
        // Create save/cancel buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'inline-edit-buttons';
        buttonContainer.innerHTML = `
            <button class="inline-edit-save">Save</button>
            <button class="inline-edit-cancel">Cancel</button>
        `;
        input.parentNode.insertBefore(buttonContainer, input.nextSibling);
        
        // Save function
        const saveEdit = async () => {
            try {
                const raw = input.value.trim();
                if (field === 'price') {
                    const v = parseFloat(raw);
                    if (Number.isNaN(v)) return UI.showToast('Enter a valid price', 'error');
                } else if (field === 'stock') {
                    const v = parseInt(raw, 10);
                    if (Number.isNaN(v)) return UI.showToast('Enter a valid stock', 'error');
                } else if (!raw) {
                    return UI.showToast(`Enter a valid ${field}`, 'error');
                }

                // 1) Load full product
                const res = await fetch(`/products/${productId}/edit`, {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
                });
                if (!res.ok) throw new Error('Failed to load product');
                const payload = await res.json();
                const product = payload.product || payload; // support either shape

                // 2) Mutate only the changed field
                const updated = { ...product };
                if (field === 'price') {
                    updated.price = parseFloat(raw);
                } else if (field === 'stock') {
                    updated.stock = parseInt(raw, 10);
                } else {
                    updated[field] = raw;
                }

                // 3) Send full payload via existing PUT (_method) endpoint
                await API.updateProduct(productId, updated);
                UI.showToast(`${field} updated successfully!`, 'success');

                // Update display
                if (field === 'price') {
                    fieldElement.textContent = `$${updated.price.toFixed(2)}`;
                } else {
                    fieldElement.textContent = updated[field];
                }

                // Clean up
                fieldElement.style.display = '';
                input.remove();
                buttonContainer.remove();
            } catch (error) {
                UI.showToast(`Error updating ${field}`, 'error');
            }
        };
        
        // Cancel function
        const cancelEdit = () => {
            fieldElement.style.display = '';
            input.remove();
            buttonContainer.remove();
        };
        
        // Event listeners
        buttonContainer.querySelector('.inline-edit-save').addEventListener('click', saveEdit);
        buttonContainer.querySelector('.inline-edit-cancel').addEventListener('click', cancelEdit);
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
        
        input.addEventListener('blur', (e) => {
            // Only save on blur if not clicking save/cancel buttons
            if (!buttonContainer.contains(e.relatedTarget)) {
                saveEdit();
            }
        });
    }
};

// Event Handlers
const EventHandlers = {
    // Initialize all event handlers
    init() {
        this.setupFilterHandlers();
        this.setupSearchHandler();
        this.setupSortHandlers();
        this.setupTabHandlers();
        this.setupModalHandlers();
        this.setupButtonHandlers();
        this.setupPaginationHandlers();
    },
    
    // Setup filter handlers
    setupFilterHandlers() {
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                AppState.updateFilter('category', e.target.value);
            });
        }
    },
    
    // Setup search handler with debouncing
    setupSearchHandler() {
        const searchInput = document.getElementById('search');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    AppState.updateFilter('search', e.target.value);
                }, 300);
            });
        }
    },
    
    // Setup sort handlers
    setupSortHandlers() {
        const sortBy = document.getElementById('sort-select');
        const sortOrder = document.getElementById('sort-order');
        
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                AppState.updateFilter('sortBy', e.target.value);
            });
        }
        
        if (sortOrder) {
            sortOrder.addEventListener('click', (e) => {
                e.preventDefault();
                const currentOrder = AppState.filters.sortOrder;
                const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
                AppState.updateFilter('sortOrder', newOrder);

                // Optional: reflect UI state
                sortOrder.dataset.order = newOrder;
                
                // Update button appearance
                const svg = sortOrder.querySelector('svg path');
                if (newOrder === 'asc') {
                    svg.setAttribute('d', 'M5 15l7-7 7 7');
                } else {
                    svg.setAttribute('d', 'M19 9l-7 7-7-7');
                }
            });
        }
    },
    
    // Setup tab handlers
    setupTabHandlers() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                
                // Update active tab
                tabButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                // Show corresponding content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabName}-content`) {
                        content.classList.add('active');
                        
                        // Load data for the active tab
                        if (tabName === 'products') {
                            UI.fetchAndRenderProducts();
                        } else if (tabName === 'categories') {
                            UI.fetchAndRenderCategories();
                        }
                    }
                });
            });
        });
    },
    
    // Setup modal handlers
    setupModalHandlers() {
        const modal = document.getElementById('modal');
        const closeBtn = document.getElementById('modal-close');
        const cancelBtn = document.getElementById('modal-cancel');
        
        // Close modal handlers
        if (closeBtn) {
            closeBtn.addEventListener('click', UI.hideModal);
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', UI.hideModal);
        }
        
        // Close modal on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    UI.hideModal();
                }
            });
        }
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                UI.hideModal();
            }
        });
    },
    
    // Setup button handlers
    setupButtonHandlers() {
        // Create product button
        const createProductBtn = document.getElementById('add-product-btn');
        if (createProductBtn) {
            createProductBtn.addEventListener('click', () => {
                UI.showModal('product');
            });
        }
        
        // Create category button
        const createCategoryBtn = document.getElementById('add-category-btn');
        if (createCategoryBtn) {
            createCategoryBtn.addEventListener('click', () => {
                UI.showModal('category');
            });
        }
    },

    // Intercept pagination clicks to load via AJAX
    setupPaginationHandlers() {
        const container = document.getElementById('products-container');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href*="/products/list"], a[href*="page="]');
            if (!anchor) return;

            // Only handle same-origin links
            const url = new URL(anchor.href, window.location.origin);
            if (url.origin !== window.location.origin) return;

            const pageParam = url.searchParams.get('page');
            if (!pageParam) return;

            e.preventDefault();
            const page = parseInt(pageParam, 10) || 1;
            AppState.currentPage = page;
            AppState.saveToStorage();
            UI.fetchAndRenderProducts();

            // Optional: scroll back to top of list
            const top = container.getBoundingClientRect().top + window.scrollY - 16;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Product Management System...');
    
    // Load saved state
    AppState.loadFromStorage();
    
    // Update UI with saved state
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search');
    const sortBy = document.getElementById('sort-select');
    const sortOrder = document.getElementById('sort-order');
    
    if (categoryFilter) categoryFilter.value = AppState.filters.category;
    if (searchInput) searchInput.value = AppState.filters.search;
    if (sortBy) sortBy.value = AppState.filters.sortBy;
    if (sortOrder) sortOrder.value = AppState.filters.sortOrder;
    
    // Initialize event handlers
    EventHandlers.init();
    
    // Load initial data
    UI.fetchAndRenderProducts();
    
    console.log('Product Management System initialized successfully!');
});