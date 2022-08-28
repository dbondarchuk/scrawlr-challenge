<?php

namespace Tests;

use App\Models\User;

use Laravel\Lumen\Testing\DatabaseMigrations;
use Laravel\Lumen\Testing\DatabaseTransactions;

class UserTest extends TestCase
{
    use DatabaseMigrations;

    public function test_login_success()
    {
        $users = User::factory()->count(3)->create();
        $user = $users->first();

        $this->post('/user/login', ['username' => $user->username, 'password' => 'password']);

        $this->assertStringContainsString(
            '{"api_token":', $this->response->getContent()
        );
    }

    public function test_login_fails()
    {
        $users = User::factory()->count(3)->create();
        $user = $users->first();

        $this->post('/user/login', ['username' => $user->username, 'password' => 'password1']);

        $this->assertEquals(
            401, $this->response->getStatusCode()
        );
    }

    public function test_login_fails_no_username()
    {
        $users = User::factory()->count(3)->create();
        $user = $users->first();

        $this->post('/user/login', ['password' => 'password1']);

        $this->assertEquals(
            422, $this->response->getStatusCode()
        );
    }

    public function test_login_fails_no_password()
    {
        $users = User::factory()->count(3)->create();
        $user = $users->first();

        $this->post('/user/login', ['username' => $user->username]);

        $this->assertEquals(
            422, $this->response->getStatusCode()
        );
    }

    public function test_signup_success()
    {
        $users = User::factory()->count(3)->create();

        $username = 'user';

        $this->post('/user/signup', ['username' => $username, 'password' => 'password', 'confirm_password' => 'password']);

        $this->assertEquals(
            20, strlen($this->response->getContent())
        );

        $user = User::where('username', $username)->first();
        $this->assertEquals(is_null($user), false);
    }

    public function test_signup_fails_no_username()
    {
        $users = User::factory()->count(3)->create();

        $username = 'user';

        $this->post('/user/signup', ['password' => 'password', 'confirm_password' => 'password']);

        $this->assertEquals(
            422, $this->response->getStatusCode()
        );

        $user = User::where('username', $username)->first();
        $this->assertEquals(is_null($user), true);
    }

    public function test_signup_fails_no_password()
    {
        $users = User::factory()->count(3)->create();

        $username = 'user';

        $this->post('/user/signup', ['username' => $username, 'confirm_password' => 'password']);

        $this->assertEquals(
            422, $this->response->getStatusCode()
        );

        $user = User::where('username', $username)->first();
        $this->assertEquals(is_null($user), true);
    }

    public function test_signup_fails_no_confirm_password()
    {
        $users = User::factory()->count(3)->create();

        $username = 'user';

        $this->post('/user/signup', ['username' => $username, 'password' => 'password']);

        $this->assertEquals(
            422, $this->response->getStatusCode()
        );

        $user = User::where('username', $username)->first();
        $this->assertEquals(is_null($user), true);
    }

    public function test_signup_fails_password_too_short()
    {
        $users = User::factory()->count(3)->create();

        $username = 'user';

        $this->post('/user/signup', ['username' => $username, 'password' => 'passwd', 'confirm_password' => 'passwd']);

        $this->assertEquals(
            400, $this->response->getStatusCode()
        );

        $user = User::where('username', $username)->first();
        $this->assertEquals(is_null($user), true);

        $this->assertEquals(
            'Error: password should have at least 8 symbols', json_decode($this->response->getContent())
        );
    }

    public function test_signup_fails_passwords_dont_much()
    {
        $users = User::factory()->count(3)->create();

        $username = 'user';

        $this->post('/user/signup', ['username' => $username, 'password' => 'password', 'confirm_password' => 'password1']);

        $this->assertEquals(
            400, $this->response->getStatusCode()
        );

        $user = User::where('username', $username)->first();
        $this->assertEquals(is_null($user), true);

        $this->assertEquals(
            'Error: passwords do not match', json_decode($this->response->getContent())
        );
    }

    public function test_signup_fails_username_exists()
    {
        $users = User::factory()->count(3)->create();

        $username = User::first()->username;

        $this->post('/user/signup', ['username' => $username, 'password' => 'password', 'confirm_password' => 'password']);

        $this->assertEquals(
            400, $this->response->getStatusCode()
        );

        $this->assertEquals(
            'Error: username already exists', json_decode($this->response->getContent())
        );
    }
}
