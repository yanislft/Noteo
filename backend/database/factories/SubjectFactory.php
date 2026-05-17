<?php

namespace Database\Factories;

use App\Models\Semester;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'semester_id' => Semester::factory(),
            'name'        => fake()->word(),
            'coefficient' => fake()->numberBetween(1, 5),
        ];
    }
}
