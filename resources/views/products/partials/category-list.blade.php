@if($categories->count() > 0)
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @foreach($categories as $category)
            <div class="category-card bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200" data-category-id="{{ $category->id }}">
                <div class="p-6">
                    <!-- Category Header -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-900 category-name">{{ $category->name }}</h3>
                            <p class="text-sm text-gray-500">{{ $category->products_count }} products</p>
                        </div>
                    </div>

                    <!-- Category Description -->
                    @if($category->description)
                        <div class="mb-4">
                            <p class="text-sm text-gray-600 line-clamp-2">{{ Str::limit($category->description, 100) }}</p>
                        </div>
                    @endif

                    <!-- Actions -->
                    <div class="flex justify-end space-x-2">
                        <button class="edit-category-btn px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 focus:outline-none" data-category-id="{{ $category->id }}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="delete-category-btn px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 focus:outline-none" data-category-id="{{ $category->id }}" data-category-name="{{ $category->name }}" data-products-count="{{ $category->products_count }}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
@else
    <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
    </div>
@endif
