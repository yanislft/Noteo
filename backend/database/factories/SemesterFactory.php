<?php

namespace Database\Factories;

use App\Models\Year;
use Illuminate\Database\Eloquent\Factories\Factory;

class SemesterFactory extends Factory
{
    public function definition(): array
    {
        return [
            'year_id' => Year::factory(),
            'name'    => 'Semestre ' . fake()->numberBetween(1, 2),
        ];
    }
}
