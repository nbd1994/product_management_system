<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'price' => fake()->randomFloat(2, 10, 1000),
            'description' => fake()->optional(0.8)->paragraph(),
            'category_id' => \App\Models\Category::factory(),
            'stock' => fake()->numberBetween(0, 100),
            'status' => fake()->randomElement(['Active', 'Inactive']),
        ];
    }
}
