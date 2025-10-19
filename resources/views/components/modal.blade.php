<!-- Modal -->
<div id="modal" class="fixed inset-0 z-50 hidden overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div id="modal-backdrop" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <!-- Modal panel -->
        <div id="modal-panel" class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <!-- Modal Header -->
                <div class="flex items-center justify-between mb-4">
                    <h3 id="modal-title" class="text-lg font-medium text-gray-900">Modal Title</h3>
                    <button id="modal-close" class="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Modal Content -->
                <div id="modal-content">
                    <!-- Content will be loaded here -->
                </div>
            </div>

            <!-- Modal Footer -->
            <div id="modal-footer" class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button id="modal-confirm" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Confirm
                </button>
                <button id="modal-cancel" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Product Form Modal Content -->
<div id="product-form-template" class="hidden">
    <form id="product-form" class="space-y-4">
        @csrf
        <input type="hidden" id="product-id" name="id">
        
        <div>
            <label for="product-name" class="block text-sm font-medium text-gray-700">Product Name</label>
            <input type="text" id="product-name" name="name" required
                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <div id="product-name-error" class="mt-1 text-sm text-red-600 hidden"></div>
        </div>

        <div>
            <label for="product-price" class="block text-sm font-medium text-gray-700">Price</label>
            <input type="number" id="product-price" name="price" step="0.01" min="0" required
                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <div id="product-price-error" class="mt-1 text-sm text-red-600 hidden"></div>
        </div>

        <div>
            <label for="product-category" class="block text-sm font-medium text-gray-700">Category</label>
            <select id="product-category" name="category_id" required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="">Select a category</option>
                @foreach($categories as $category)
                    <option value="{{ $category->id }}">{{ $category->name }}</option>
                @endforeach
            </select>
            <div id="product-category-error" class="mt-1 text-sm text-red-600 hidden"></div>
        </div>

        <div>
            <label for="product-stock" class="block text-sm font-medium text-gray-700">Stock</label>
            <input type="number" id="product-stock" name="stock" min="0" required
                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <div id="product-stock-error" class="mt-1 text-sm text-red-600 hidden"></div>
        </div>

        <div>
            <label for="product-status" class="block text-sm font-medium text-gray-700">Status</label>
            <select id="product-status" name="status" required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
            </select>
            <div id="product-status-error" class="mt-1 text-sm text-red-600 hidden"></div>
        </div>

        <div>
            <label for="product-description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="product-description" name="description" rows="3"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            <div id="product-description-error" class="mt-1 text-sm text-red-600 hidden"></div>
        </div>
    </form>
</div>

<!-- Category Form Modal Content -->
<div id="category-form-template" class="hidden">
    <form id="category-form" class="space-y-4">
        @csrf
        <input type="hidden" id="category-id" name="id">
        
        <div>
            <label for="category-name" class="block text-sm font-medium text-gray-700">Category Name</label>
            <input type="text" id="category-name" name="name" required
                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm">
            <div id="category-name-error" class="mt-1 text-sm text-red-600 hidden"></div>
        </div>

        <div>
            <label for="category-description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="category-description" name="description" rows="3"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"></textarea>
            <div id="category-description-error" class="mt-1 text-sm text-red-600 hidden"></div>
        </div>
    </form>
</div>

<!-- Delete Confirmation Modal Content -->
<div id="delete-confirmation-template" class="hidden">
    <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Delete Confirmation</h3>
        <p class="mt-1 text-sm text-gray-500">
            Are you sure you want to delete <span id="delete-item-name" class="font-medium"></span>? 
            This action cannot be undone.
        </p>
    </div>
</div>
