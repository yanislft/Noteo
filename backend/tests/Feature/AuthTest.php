<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/auth/register', [
            'firstname' => 'Yanis',
            'name'      => 'Dupont',
            'email'     => 'yanis@example.com',
            'password'  => 'password123',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'yanis@example.com']);
        Notification::assertSentTo(User::first(), VerifyEmailNotification::class);
    }

    public function test_register_requires_minimum_password_length(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'firstname' => 'Yanis',
            'name'      => 'Dupont',
            'email'     => 'yanis@example.com',
            'password'  => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'yanis@example.com']);

        $response = $this->postJson('/api/auth/register', [
            'firstname' => 'Autre',
            'name'      => 'Personne',
            'email'     => 'yanis@example.com',
            'password'  => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password123')]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200)->assertJsonStructure(['token', 'user']);
    }

    public function test_login_fails_with_wrong_credentials(): void
    {
        User::factory()->create(['email' => 'yanis@example.com', 'password' => bcrypt('correct')]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'yanis@example.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(422);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'api')->getJson('/api/auth/me');

        $response->assertStatus(200)->assertJsonFragment(['email' => $user->email]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $this->getJson('/api/auth/me')->assertStatus(401);
    }

    public function test_user_can_update_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'api')->putJson('/api/auth/profile', [
            'firstname' => 'Nouveau',
            'name'      => 'Nom',
            'email'     => $user->email,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['firstname' => 'Nouveau']);
    }

    public function test_user_can_change_password(): void
    {
        $user = User::factory()->create(['password' => bcrypt('ancienmdp1')]);

        $response = $this->actingAs($user, 'api')->putJson('/api/auth/profile', [
            'firstname'             => $user->firstname,
            'name'                  => $user->name,
            'email'                 => $user->email,
            'current_password'      => 'ancienmdp1',
            'password'              => 'nouveaumdp1',
            'password_confirmation' => 'nouveaumdp1',
        ]);

        $response->assertStatus(200);
    }

    public function test_password_change_fails_with_wrong_current_password(): void
    {
        $user = User::factory()->create(['password' => bcrypt('correct123')]);

        $response = $this->actingAs($user, 'api')->putJson('/api/auth/profile', [
            'firstname'             => $user->firstname,
            'name'                  => $user->name,
            'email'                 => $user->email,
            'current_password'      => 'mauvais123',
            'password'              => 'nouveaumdp1',
            'password_confirmation' => 'nouveaumdp1',
        ]);

        $response->assertStatus(422);
    }
}
