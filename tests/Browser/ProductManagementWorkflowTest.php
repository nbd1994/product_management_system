<?php

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->category = Category::factory()->create(['name' => 'Electronics']);
    $this->product = Product::factory()->create([
        'name' => 'Test Product',
        'price' => 99.99,
        'category_id' => $this->category->id,
        'stock' => 10,
        'status' => 'Active'
    ]);
});

it('can view the products page', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->assertSee('Product Management System')
                ->assertSee('Products')
                ->assertSee('Categories');
    });
});

it('can switch between products and categories tabs', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->assertSee('Products')
                ->click('#categories-tab')
                ->assertSee('Add Category')
                ->click('#products-tab')
                ->assertSee('Add Product');
    });
});

it('can create a new product', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->click('#add-product-btn')
                ->waitFor('#product-form')
                ->type('#product-name', 'New Product')
                ->type('#product-price', '149.99')
                ->select('#product-category', $this->category->id)
                ->type('#product-stock', '25')
                ->select('#product-status', 'Active')
                ->type('#product-description', 'A new test product')
                ->click('#modal-confirm')
                ->waitForText('Product created successfully')
                ->assertSee('New Product');
    });
});

it('can edit an existing product', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->waitFor('.product-card')
                ->click('.edit-product-btn')
                ->waitFor('#product-form')
                ->clear('#product-name')
                ->type('#product-name', 'Updated Product')
                ->clear('#product-price')
                ->type('#product-price', '199.99')
                ->click('#modal-confirm')
                ->waitForText('Product updated successfully')
                ->assertSee('Updated Product');
    });
});

it('can delete a product with confirmation', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->waitFor('.product-card')
                ->click('.delete-product-btn')
                ->waitForText('Delete Confirmation')
                ->assertSee('Test Product')
                ->click('#modal-confirm')
                ->waitForText('Product deleted successfully')
                ->assertDontSee('Test Product');
    });
});

it('can filter products by category', function () {
    $category2 = Category::factory()->create(['name' => 'Books']);
    $product2 = Product::factory()->create([
        'name' => 'Book Product',
        'category_id' => $category2->id
    ]);
    
    $this->browse(function ($browser) use ($category2) {
        $browser->visit('/products')
                ->waitFor('.product-card')
                ->select('#category-filter', $category2->id)
                ->waitForText('Book Product')
                ->assertSee('Book Product')
                ->assertDontSee('Test Product');
    });
});

it('can search products by name', function () {
    $product2 = Product::factory()->create([
        'name' => 'Different Product',
        'category_id' => $this->category->id
    ]);
    
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->waitFor('.product-card')
                ->type('#search', 'Different')
                ->waitForText('Different Product')
                ->assertSee('Different Product')
                ->assertDontSee('Test Product');
    });
});

it('can sort products by price', function () {
    $product2 = Product::factory()->create([
        'name' => 'Cheap Product',
        'price' => 50.00,
        'category_id' => $this->category->id
    ]);
    $product3 = Product::factory()->create([
        'name' => 'Expensive Product',
        'price' => 200.00,
        'category_id' => $this->category->id
    ]);
    
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->waitFor('.product-card')
                ->select('#sort-select', 'price')
                ->click('#sort-order')
                ->waitForText('Expensive Product')
                ->assertSee('Expensive Product');
    });
});

it('can toggle pagination type', function () {
    // Create enough products to trigger pagination
    Product::factory()->count(15)->create(['category_id' => $this->category->id]);
    
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->waitFor('.product-card')
                ->click('#pagination-toggle')
                ->assertSee('Numbered')
                ->click('#pagination-toggle')
                ->assertSee('Load More');
    });
});

it('can create a new category', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->click('#categories-tab')
                ->waitFor('#add-category-btn')
                ->click('#add-category-btn')
                ->waitFor('#category-form')
                ->type('#category-name', 'New Category')
                ->type('#category-description', 'A new test category')
                ->click('#modal-confirm')
                ->waitForText('Category created successfully')
                ->assertSee('New Category');
    });
});

it('can edit an existing category', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->click('#categories-tab')
                ->waitFor('.category-card')
                ->click('.edit-category-btn')
                ->waitFor('#category-form')
                ->clear('#category-name')
                ->type('#category-name', 'Updated Category')
                ->click('#modal-confirm')
                ->waitForText('Category updated successfully')
                ->assertSee('Updated Category');
    });
});

it('can delete a category without products', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->click('#categories-tab')
                ->waitFor('.category-card')
                ->click('.delete-category-btn')
                ->waitForText('Delete Confirmation')
                ->assertSee('Electronics')
                ->click('#modal-confirm')
                ->waitForText('Category deleted successfully')
                ->assertDontSee('Electronics');
    });
});

it('prevents deletion of category with products', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->click('#categories-tab')
                ->waitFor('.category-card')
                ->click('.delete-category-btn')
                ->waitForText('Delete Confirmation')
                ->assertSee('Electronics')
                ->click('#modal-confirm')
                ->waitForText('Cannot delete category with existing products')
                ->assertSee('Electronics');
    });
});

it('can use inline editing for product name', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->waitFor('.product-card')
                ->click('[data-field="name"] .inline-edit-btn')
                ->waitFor('.inline-edit-field')
                ->type('.inline-edit-field', 'Inline Updated Name')
                ->click('.inline-edit-save')
                ->waitForText('Inline Updated Name')
                ->assertSee('Inline Updated Name');
    });
});

it('can use inline editing for product price', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->waitFor('.product-card')
                ->click('[data-field="price"] .inline-edit-btn')
                ->waitFor('.inline-edit-field')
                ->type('.inline-edit-field', '199.99')
                ->click('.inline-edit-save')
                ->waitForText('$199.99')
                ->assertSee('$199.99');
    });
});

it('can use inline editing for product stock', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->waitFor('.product-card')
                ->click('[data-field="stock"] .inline-edit-btn')
                ->waitFor('.inline-edit-field')
                ->type('.inline-edit-field', '50')
                ->click('.inline-edit-save')
                ->waitForText('50')
                ->assertSee('50');
    });
});

it('can cancel inline editing', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->waitFor('.product-card')
                ->click('[data-field="name"] .inline-edit-btn')
                ->waitFor('.inline-edit-field')
                ->type('.inline-edit-field', 'This should not be saved')
                ->click('.inline-edit-cancel')
                ->assertSee('Test Product')
                ->assertDontSee('This should not be saved');
    });
});

it('shows validation errors for invalid product data', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->click('#add-product-btn')
                ->waitFor('#product-form')
                ->type('#product-name', '') // Empty name
                ->type('#product-price', '-10') // Negative price
                ->click('#modal-confirm')
                ->waitForText('Product name is required')
                ->assertSee('Product name is required');
    });
});

it('handles keyboard navigation in modals', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->click('#add-product-btn')
                ->waitFor('#product-form')
                ->keys('#product-name', 'Tab')
                ->assertFocused('#product-price')
                ->keys('#product-price', 'Tab')
                ->assertFocused('#product-category');
    });
});

it('can close modal with escape key', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->click('#add-product-btn')
                ->waitFor('#product-form')
                ->keys('body', '{escape}')
                ->assertDontSee('#product-form');
    });
});

it('shows toast notifications for successful operations', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->click('#add-product-btn')
                ->waitFor('#product-form')
                ->type('#product-name', 'Toast Test Product')
                ->type('#product-price', '99.99')
                ->select('#product-category', $this->category->id)
                ->type('#product-stock', '10')
                ->select('#product-status', 'Active')
                ->click('#modal-confirm')
                ->waitForText('Product created successfully')
                ->assertSee('Product created successfully');
    });
});

it('shows toast notifications for errors', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->click('#add-product-btn')
                ->waitFor('#product-form')
                ->click('#modal-confirm') // Submit without filling required fields
                ->waitForText('Product name is required')
                ->assertSee('Product name is required');
    });
});

it('maintains state across page refreshes', function () {
    $this->browse(function ($browser) {
        $browser->visit('/products')
                ->select('#category-filter', $this->category->id)
                ->type('#search', 'Test')
                ->select('#sort-select', 'price')
                ->refresh()
                ->assertSelected('#category-filter', $this->category->id)
                ->assertInputValue('#search', 'Test')
                ->assertSelected('#sort-select', 'price');
    });
});
