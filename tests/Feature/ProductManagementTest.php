<?php

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->category = Category::factory()->create();
    $this->product = Product::factory()->create(['category_id' => $this->category->id]);
});

it('displays the products index page', function () {
    $response = $this->get('/products');
    
    $response->assertStatus(200);
    $response->assertViewIs('products.index');
    $response->assertViewHas('categories');
});

it('fetches products list with default parameters', function () {
    $response = $this->get('/products/list');
    
    $response->assertStatus(200);
    $response->assertViewIs('products.partials.list');
    $response->assertViewHas('products');
});

it('filters products by category', function () {
    $category2 = Category::factory()->create();
    $product2 = Product::factory()->create(['category_id' => $category2->id]);
    
    $response = $this->get('/products/list?category=' . $this->category->id);
    
    $response->assertStatus(200);
    $response->assertViewHas('products');
    
    $products = $response->viewData('products');
    expect($products->items())->toHaveCount(1);
    expect($products->items()[0]->category_id)->toBe($this->category->id);
});

it('searches products by name', function () {
    $product2 = Product::factory()->create([
        'name' => 'Different Product',
        'category_id' => $this->category->id
    ]);
    
    $response = $this->get('/products/list?search=' . $this->product->name);
    
    $response->assertStatus(200);
    $response->assertViewHas('products');
    
    $products = $response->viewData('products');
    expect($products->items())->toHaveCount(1);
    expect($products->items()[0]->name)->toBe($this->product->name);
});

it('searches products by description', function () {
    $product2 = Product::factory()->create([
        'description' => 'Different description',
        'category_id' => $this->category->id
    ]);
    
    $response = $this->get('/products/list?search=' . $this->product->description);
    
    $response->assertStatus(200);
    $response->assertViewHas('products');
    
    $products = $response->viewData('products');
    expect($products->items())->toHaveCount(1);
    expect($products->items()[0]->description)->toBe($this->product->description);
});

it('sorts products by name ascending', function () {
    // Delete the existing product to avoid conflicts
    $this->product->delete();
    
    $product1 = Product::factory()->create([
        'name' => 'Alpha Product',
        'category_id' => $this->category->id
    ]);
    $product2 = Product::factory()->create([
        'name' => 'Beta Product',
        'category_id' => $this->category->id
    ]);
    $product3 = Product::factory()->create([
        'name' => 'Zeta Product',
        'category_id' => $this->category->id
    ]);
    
    $response = $this->get('/products/list?sort_by=name&sort_order=asc');
    
    $response->assertStatus(200);
    $response->assertViewHas('products');
    
    $products = $response->viewData('products');
    $items = $products->items();
    expect($items[0]->name)->toBe('Alpha Product');
    expect($items[1]->name)->toBe('Beta Product');
    expect($items[2]->name)->toBe('Zeta Product');
});

it('sorts products by price descending', function () {
    // Delete the existing product to avoid conflicts
    $this->product->delete();
    
    $product1 = Product::factory()->create([
        'price' => 100.00,
        'category_id' => $this->category->id
    ]);
    $product2 = Product::factory()->create([
        'price' => 50.00,
        'category_id' => $this->category->id
    ]);
    $product3 = Product::factory()->create([
        'price' => 200.00,
        'category_id' => $this->category->id
    ]);
    
    $response = $this->get('/products/list?sort_by=price&sort_order=desc');
    
    $response->assertStatus(200);
    $response->assertViewHas('products');
    
    $products = $response->viewData('products');
    $items = $products->items();
    expect((float)$items[0]->price)->toBe(200.00);
    expect((float)$items[1]->price)->toBe(100.00);
    expect((float)$items[2]->price)->toBe(50.00);
});

it('creates a new product', function () {
    $productData = [
        'name' => 'Test Product',
        'price' => 99.99,
        'description' => 'Test description',
        'category_id' => $this->category->id,
        'stock' => 10,
        'status' => 'Active'
    ];
    
    $response = $this->postJson('/products', $productData);
    
    $response->assertStatus(201);
    $response->assertJson([
        'success' => true,
        'message' => 'Product created successfully.'
    ]);
    
    $this->assertDatabaseHas('products', [
        'name' => 'Test Product',
        'price' => 99.99,
        'category_id' => $this->category->id
    ]);
});

it('validates product creation with required fields', function () {
    $response = $this->postJson('/products', []);
    
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name', 'price', 'category_id', 'stock', 'status']);
});

it('validates product price is numeric and positive', function () {
    $productData = [
        'name' => 'Test Product',
        'price' => -10.00,
        'category_id' => $this->category->id,
        'stock' => 10,
        'status' => 'Active'
    ];
    
    $response = $this->postJson('/products', $productData);
    
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['price']);
});

it('validates product stock is integer and positive', function () {
    $productData = [
        'name' => 'Test Product',
        'price' => 99.99,
        'category_id' => $this->category->id,
        'stock' => -5,
        'status' => 'Active'
    ];
    
    $response = $this->postJson('/products', $productData);
    
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['stock']);
});

it('validates product status is valid enum value', function () {
    $productData = [
        'name' => 'Test Product',
        'price' => 99.99,
        'category_id' => $this->category->id,
        'stock' => 10,
        'status' => 'Invalid'
    ];
    
    $response = $this->postJson('/products', $productData);
    
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['status']);
});

it('validates category exists', function () {
    $productData = [
        'name' => 'Test Product',
        'price' => 99.99,
        'category_id' => 999,
        'stock' => 10,
        'status' => 'Active'
    ];
    
    $response = $this->postJson('/products', $productData);
    
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['category_id']);
});

it('updates an existing product', function () {
    $updateData = [
        'name' => 'Updated Product',
        'price' => 149.99,
        'description' => 'Updated description',
        'category_id' => $this->category->id,
        'stock' => 20,
        'status' => 'Inactive'
    ];
    
    $response = $this->putJson("/products/{$this->product->id}", $updateData);
    
    $response->assertStatus(200);
    $response->assertJson([
        'success' => true,
        'message' => 'Product updated successfully.'
    ]);
    
    $this->assertDatabaseHas('products', [
        'id' => $this->product->id,
        'name' => 'Updated Product',
        'price' => 149.99
    ]);
});

it('validates product update with required fields', function () {
    $response = $this->putJson("/products/{$this->product->id}", []);
    
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name', 'price', 'category_id', 'stock', 'status']);
});

it('deletes a product', function () {
    $response = $this->deleteJson("/products/{$this->product->id}");
    
    $response->assertStatus(200);
    $response->assertJson([
        'success' => true,
        'message' => 'Product deleted successfully.'
    ]);
    
    $this->assertDatabaseMissing('products', [
        'id' => $this->product->id
    ]);
});

it('returns product data for editing', function () {
    $response = $this->getJson("/products/{$this->product->id}/edit");
    
    $response->assertStatus(200);
    $response->assertJson([
        'product' => [
            'id' => $this->product->id,
            'name' => $this->product->name,
            'price' => $this->product->price,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name
            ]
        ]
    ]);
});

it('handles pagination correctly', function () {
    // Create more products than the per-page limit (12)
    Product::factory()->count(15)->create(['category_id' => $this->category->id]);
    
    $response = $this->get('/products/list');

    $response->assertStatus(200);
    $response->assertViewHas('products');
    
    $products = $response->viewData('products');
    expect($products->count())->toBe(12); // First page should have 12 items
    expect($products->hasPages())->toBeTrue();
});

it('combines filter, search, and sort parameters', function () {
    // Delete the existing product to avoid conflicts
    $this->product->delete();
    
    $category2 = Category::factory()->create();
    $product2 = Product::factory()->create([
        'name' => 'Alpha Product',
        'price' => 100.00,
        'category_id' => $category2->id
    ]);
    $product3 = Product::factory()->create([
        'name' => 'Beta Product',
        'price' => 50.00,
        'category_id' => $this->category->id
    ]);
    $product4 = Product::factory()->create([
        'name' => 'Gamma Product',
        'price' => 75.00,
        'category_id' => $this->category->id
    ]);
    
    $response = $this->get("/products/list?category={$this->category->id}&search=Product&sort_by=name&sort_order=asc");
    
    $response->assertStatus(200);
    $response->assertViewHas('products');
    
    $products = $response->viewData('products');
    $items = $products->items();
    
    // Should only return products from the specified category
    expect($items)->toHaveCount(2);
    expect($items[0]->category_id)->toBe($this->category->id);
    expect($items[1]->category_id)->toBe($this->category->id);
    
    // Should be sorted by name
    expect($items[0]->name)->toBe('Beta Product');
    expect($items[1]->name)->toBe('Gamma Product');
});