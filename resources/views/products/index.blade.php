<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Product Management System</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700" rel="stylesheet" />
    
    <!-- Styles -->
    @vite(['resources/css/app.css', 'resources/css/products.css'])
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <h1 class="text-2xl font-bold text-gray-900">Product Management System</h1>
                    <div class="flex items-center space-x-4">
                        {{-- <button id="pagination-toggle" class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <span id="pagination-text">Numbered</span>
                        </button> --}}
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Tabs -->
            <div class="mb-8">
                <nav class="flex space-x-8" role="tablist">
                    <button id="products-tab" class="tab-button active" data-tab="products" role="tab" aria-selected="true">
                        Products
                    </button>
                    <button id="categories-tab" class="tab-button" data-tab="categories" role="tab" aria-selected="false">
                        Categories
                    </button>
                </nav>
            </div>

            <!-- Products Tab Content -->
            <div id="products-content" class="tab-content active">
                <!-- Filters and Controls -->
                <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <!-- Search -->
                        <div class="md:col-span-2">
                            <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                            <input type="text" id="search" name="search" placeholder="Search by name or description..." 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <!-- Category Filter -->
                        <div>
                            <label for="category-filter" class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select id="category-filter" name="category" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">All Categories</option>
                                @foreach($categories as $category)
                                    <option value="{{ $category->id }}">{{ $category->name }}</option>
                                @endforeach
                            </select>
                        </div>

                        <!-- Sort -->
                        <div>
                            <label for="sort-select" class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                            <div class="flex space-x-2">
                                <select id="sort-select" name="sort_by" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="name">Name</option>
                                    <option value="price">Price</option>
                                    <option value="stock">Stock</option>
                                    <option value="status">Status</option>
                                </select>
                                <button id="sort-order" class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-order="asc">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add Product Button -->
                <div class="mb-6">
                    <button id="add-product-btn" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Add Product
                    </button>
                </div>

                <!-- Products Grid Container -->
                <div id="products-container">
                    <!-- Products will be loaded here via AJAX -->
                    <div class="flex justify-center items-center h-64">
                        <div class="text-gray-500">Loading products...</div>
                    </div>
                </div>

                <!-- Pagination Container -->
                <div id="pagination-container" class="mt-8">
                    <!-- Pagination will be loaded here -->
                </div>
            </div>

            <!-- Categories Tab Content -->
            <div id="categories-content" class="tab-content">
                <!-- Add Category Button -->
                <div class="mb-6">
                    <button id="add-category-btn" class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Add Category
                    </button>
                </div>

                <!-- Categories Grid Container -->
                <div id="categories-container">
                    <!-- Categories will be loaded here via AJAX -->
                    <div class="flex justify-center items-center h-64">
                        <div class="text-gray-500">Loading categories...</div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Modals -->
    @include('components.modal')
    
    <!-- Toast Container -->
    <div id="toast-container" class="fixed top-4 right-4 z-50 space-y-2"></div>

    <!-- Scripts -->
    @vite(['resources/js/app.js', 'resources/js/products.js'])
</body>
</html>
