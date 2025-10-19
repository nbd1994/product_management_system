<?php

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->category = Category::factory()->create();
});

it('displays the categories list', function () {
    $response = $this->get('/categories/list');
    
    $response->assertStatus(200);
    $response->assertViewIs('products.partials.category-list');
    $response->assertViewHas('categories');
});

it('creates a new category', function () {
    $categoryData = [
        'name' => 'Test Category',
        'description' => 'Test category description'
    ];
    
    $response = $this->postJson('/categories', $categoryData);
    
    $response->assertStatus(201);
    $response->assertJson([
        'success' => true,
        'message' => 'Category created successfully.'
    ]);
    
    $this->assertDatabaseHas('categories', [
        'name' => 'Test Category',
        'description' => 'Test category description'
    ]);
});

it('validates category creation with required fields', function () {
    $response = $this->postJson('/categories', []);
    
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name']);
});

it('validates category name is not too long', function () {
    $categoryData = [
        'name' => str_repeat('a', 256), // Exceeds 255 character limit
        'description' => 'Test description'
    ];
    
    $response = $this->postJson('/categories', $categoryData);
    
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name']);
});

it('allows category description to be null', function () {
    $categoryData = [
        'name' => 'Test Category'
    ];
    
    $response = $this->postJson('/categories', $categoryData);
    
    $response->assertStatus(201);
    $response->assertJson([
        'success' => true,
        'message' => 'Category created successfully.'
    ]);
    
    $this->assertDatabaseHas('categories', [
        'name' => 'Test Category',
        'description' => null
    ]);
});

it('updates an existing category', function () {
    $updateData = [
        'name' => 'Updated Category',
        'description' => 'Updated description'
    ];
    
    $response = $this->putJson("/categories/{$this->category->id}", $updateData);
    
    $response->assertStatus(200);
    $response->assertJson([
        'success' => true,
        'message' => 'Category updated successfully.'
    ]);
    
    $this->assertDatabaseHas('categories', [
        'id' => $this->category->id,
        'name' => 'Updated Category',
        'description' => 'Updated description'
    ]);
});

it('validates category update with required fields', function () {
    $response = $this->putJson("/categories/{$this->category->id}", []);
    
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name']);
});

it('deletes a category without products', function () {
    $response = $this->deleteJson("/categories/{$this->category->id}");
    
    $response->assertStatus(200);
    $response->assertJson([
        'success' => true,
        'message' => 'Category deleted successfully.'
    ]);
    
    $this->assertDatabaseMissing('categories', [
        'id' => $this->category->id
    ]);
});

it('prevents deletion of category with products', function () {
    // Create a product in this category
    Product::factory()->create(['category_id' => $this->category->id]);
    
    $response = $this->deleteJson("/categories/{$this->category->id}");
    
    $response->assertStatus(422);
    $response->assertJson([
        'success' => false,
        'message' => 'Cannot delete category with existing products.'
    ]);
    
    $this->assertDatabaseHas('categories', [
        'id' => $this->category->id
    ]);
});

it('returns category data for editing', function () {
    $response = $this->getJson("/categories/{$this->category->id}/edit");
    
    $response->assertStatus(200);
    $response->assertJson([
        'category' => [
            'id' => $this->category->id,
            'name' => $this->category->name,
            'description' => $this->category->description
        ]
    ]);
});

it('includes product count in categories list', function () {
    // Create products in the category
    Product::factory()->count(3)->create(['category_id' => $this->category->id]);
    
    $response = $this->get('/categories/list');
    
    $response->assertStatus(200);
    $response->assertViewHas('categories');
    
    $categories = $response->viewData('categories');
    $category = $categories->first();
    expect($category->products_count)->toBe(3);
});

it('orders categories by name', function () {
    // Delete the existing category to avoid conflicts
    $this->category->delete();
    
    $category1 = Category::factory()->create(['name' => 'Alpha Category']);
    $category2 = Category::factory()->create(['name' => 'Beta Category']);
    $category3 = Category::factory()->create(['name' => 'Zeta Category']);
    
    $response = $this->get('/categories/list');
    
    $response->assertStatus(200);
    $response->assertViewHas('categories');
    
    $categories = $response->viewData('categories');
    $names = $categories->pluck('name')->toArray();
    
    expect($names)->toBe(['Alpha Category', 'Beta Category', 'Zeta Category']);
});

it('handles empty categories list', function () {
    // Delete the default category
    $this->category->delete();
    
    $response = $this->get('/categories/list');
    
    $response->assertStatus(200);
    $response->assertViewHas('categories');
    
    $categories = $response->viewData('categories');
    expect($categories)->toHaveCount(0);
});