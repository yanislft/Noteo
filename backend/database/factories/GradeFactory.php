<?php

namespace Database\Factories;

use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

class GradeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'subject_id'  => Subject::factory(),
            'name'        => 'DS' . fake()->numberBetween(1, 5),
            'value'       => fake()->randomFloat(2, 0, 20),
            'coefficient' => fake()->numberBetween(1, 3),
        ];
    }
}
