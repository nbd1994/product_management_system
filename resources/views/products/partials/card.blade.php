<div class="product-card bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200" data-product-id="{{ $product->id }}">
    <div class="p-6">
        <!-- Product Header -->
        <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 product-name" data-field="name">{{ $product->name }}</h3>
                <p class="text-sm text-gray-500">{{ $product->category->name }}</p>
            </div>
            <div class="flex items-center space-x-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $product->status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                    {{ $product->status }}
                </span>
            </div>
        </div>

        <!-- Product Details -->
        <div class="space-y-3">
            <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Price:</span>
                <span class="text-lg font-bold text-gray-900 product-price" data-field="price">${{ number_format($product->price, 2) }}</span>
            </div>
            
            <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Stock:</span>
                <span class="text-sm text-gray-900 product-stock" data-field="stock">{{ $product->stock }}</span>
            </div>

            @if($product->description)
                <div class="mt-3">
                    <p class="text-sm text-gray-600 line-clamp-2">{{ Str::limit($product->description, 100) }}</p>
                </div>
            @endif
        </div>

        <!-- Actions -->
        <div class="mt-6 flex justify-between items-center">
            <div class="flex space-x-2">
                <button class="inline-edit-btn px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 focus:outline-none" data-field="name">
                    Edit Name
                </button>
                <button class="inline-edit-btn px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 focus:outline-none" data-field="price">
                    Edit Price
                </button>
                <button class="inline-edit-btn px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 focus:outline-none" data-field="stock">
                    Edit Stock
                </button>
            </div>
            
            <div class="flex space-x-2">
                <button class="edit-product-btn px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 focus:outline-none" data-product-id="{{ $product->id }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                </button>
                <button class="delete-product-btn px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 focus:outline-none" data-product-id="{{ $product->id }}" data-product-name="{{ $product->name }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</div>
