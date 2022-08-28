<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Todo;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class TodoFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Todo::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'text' => $this->faker->text,
            'user_id' => 1,
            'created_at' => $this->faker->unixTime,
            'updated_at' => $this->faker->unixTime
        ];
    }
}
