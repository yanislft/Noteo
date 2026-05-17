<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class YearFactory extends Factory
{
    public function definition(): array
    {
        $start = fake()->numberBetween(2020, 2025);
        return [
            'user_id' => User::factory(),
            'name'    => "{$start}-" . ($start + 1),
        ];
    }
}
