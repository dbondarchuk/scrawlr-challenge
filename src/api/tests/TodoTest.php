<?php

namespace Tests;

use App\Models\Todo;
use App\Models\User;
use Exception;
use Laravel\Lumen\Testing\DatabaseMigrations;
use Laravel\Lumen\Testing\DatabaseTransactions;

class TodoTest extends TestCase
{
    use DatabaseMigrations;

    public function test_getAll_success()
    {
        $howMuch = 3;
        $user = User::factory()->create();

        $todos = Todo::factory()
            ->count($howMuch)
            ->for($user)
            ->create();

        $this->actingAs($user)->get('/todonotes');

        $result = json_decode($this->response->getContent(), true);

        $this->assertEquals($howMuch, count($result));
        for ($i = 0; $i < $howMuch; $i++) {
            $this->assertEquals($todos[$i]->text, $result[$i]['text']);
            $this->assertEquals($todos[$i]->id, $result[$i]['id']);
        }
    }

    public function test_create_success()
    {
        $user = User::factory()->create();

        $faker = \Faker\Factory::create();

        $text = $faker->text;
        $timestamp = $faker->unixTime;

        $json = '{"text": "' . $text . '", "created_at": ' . $timestamp . ' }';

        $this->actingAs($user)->json('PUT', '/todonotes', json_decode($json, true));
        $this->assertEquals(201, $this->response->getStatusCode());

        $todo = Todo::first();

        $this->assertEquals($text, $todo->text);
        $this->assertEquals($timestamp, $todo->created_at);
        $this->assertEquals($user->id, $todo->user_id);
    }

    public function test_create_bad_request()
    {
        $user = User::factory()->create();

        $faker = \Faker\Factory::create();

        $text = $faker->text;
        $timestamp = $faker->unixTime;

        $json = '{"created_at": ' . $timestamp . ' }';

        $this->actingAs($user)->json('PUT', '/todonotes', json_decode($json, true));
        $this->assertEquals(400, $this->response->getStatusCode());

        $todo = Todo::first();
        $this->assertNull($todo);
    }

    public function test_mark_done_success()
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->create();

        $id = $todo->id;

        $this->actingAs($user)->json('POST', '/todonotes/mark/done/' . $id);
        $this->assertEquals(204, $this->response->getStatusCode());

        $todo = Todo::first();

        $this->assertNotNull($todo->completed_at);
    }

    public function test_mark_done_not_found()
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->create();

        $id = $todo->id;

        $this->actingAs($user)->json('POST', '/todonotes/mark/done/13643');
        $this->assertEquals(404, $this->response->getStatusCode());

        $todo = Todo::first();

        $this->assertNull($todo->completed_at);
    }

    public function test_mark_pending_success()
    {
        $timestamp = \Faker\Factory::create()->unixTime;
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->state(['completed_at' => $timestamp])->create();

        $id = $todo->id;

        $this->actingAs($user)->json('POST', '/todonotes/mark/pending/' . $id);
        $this->assertEquals(204, $this->response->getStatusCode());

        $todo = Todo::first();

        $this->assertNull($todo->completed_at);
    }

    public function test_mark_pending_not_found()
    {
        $timestamp = \Faker\Factory::create()->unixTime;
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->state(['completed_at' => $timestamp])->create();

        $id = $todo->id;

        $this->actingAs($user)->json('POST', '/todonotes/mark/pending/13643');
        $this->assertEquals(404, $this->response->getStatusCode());

        $todo = Todo::first();

        $this->assertEquals($timestamp, $todo->completed_at);
    }

    public function test_delete_success()
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->create();

        $id = $todo->id;

        $this->actingAs($user)->json('DELETE', '/todonotes/' . $id);
        $this->assertEquals(204, $this->response->getStatusCode());

        $todo = Todo::first();

        $this->assertEquals(true, is_null($todo));
    }

    public function test_delete_not_found()
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->create();

        $id = $todo->id;

        $this->actingAs($user)->json('DELETE', '/todonotes/13643');
        $this->assertEquals(404, $this->response->getStatusCode());

        $todo = Todo::first();

        $this->assertEquals($id, $todo->id);
    }

    public function test_edit_success()
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->create();

        $id = $todo->id;
        $faker = \Faker\Factory::create();

        $text = $faker->text;
        $json = '{"text": "' . $text . '" }';

        $this->actingAs($user)->json('POST', '/todonotes/' . $id, json_decode($json, true));
        $this->assertEquals(204, $this->response->getStatusCode());

        $todo = Todo::first();

        $this->assertEquals($text, $todo->text);
    }

    public function test_edit_not_found()
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->create();

        $old = $todo->text;

        $faker = \Faker\Factory::create();

        $text = $faker->text;
        $json = '{"text": "' . $text . '" }';

        $this->actingAs($user)->json('POST', '/todonotes/56897', json_decode($json, true));
        $this->assertEquals(404, $this->response->getStatusCode());

        $todo = Todo::first();

        $this->assertEquals($old, $todo->text);
    }

    public function test_edit_bad_request()
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->create();
        $old = $todo->text;

        $id = $todo->id;

        $json = '{ }';

        $this->actingAs($user)->json('POST', '/todonotes/' . $id, json_decode($json, true));
        $this->assertEquals(400, $this->response->getStatusCode());

        $todo = Todo::first();

        $this->assertEquals($old, $todo->text);
    }

    public function test_events_success()
    {
        $faker = \Faker\Factory::create();
        $base_timestamp = $faker->unixTime;

        $user = User::factory()->create();
        $todos = Todo::factory()
            ->count(2)
            ->for($user)
            ->state(['updated_at' => $base_timestamp])
            ->create();

        $this->assertNotNull(Todo::where('id', 2)->first());

        $newText = $faker->text;
        $editText = $faker->text;
        $newTimestamp = $base_timestamp + 1000;
        $completeTimestamp = $base_timestamp + 2000;
        $editTimestamp = $base_timestamp + 3000;
        $deleteTimestamp = $base_timestamp + 4000;

        $json = '{"-1": [{"type": "create", "text": "' . $newText . '", "timestamp": ' . $newTimestamp . '}], "1": [{"type": "edit", "text": "' . $editText . '", "timestamp": ' . $editTimestamp . '}, {"type": "complete", "timestamp": ' . $completeTimestamp . '}], "2": [{"type": "delete", "timestamp": ' . $deleteTimestamp . '}]}';

        $decoded_json = json_decode($json, true);

        $this->actingAs($user)->json('POST', '/todonotes/events', $decoded_json);
        $this->assertEquals(200, $this->response->getStatusCode());

        $editTodo = Todo::where('id', 1)->first();
        $this->assertEquals($editText, $editTodo->text);
        $this->assertEquals($completeTimestamp, $editTodo->completed_at);

        $this->assertNull(Todo::where('id', 2)->first());

        $newTodo = Todo::where('id', 3)->first();
        $this->assertEquals($newText, $newTodo->text);
        $this->assertEquals($newTimestamp, $newTodo->created_at);

        $this->assertEquals(3, json_decode($this->response->getContent(), true)['ids']['-1']);
    }

    public function test_events_event_with_old_timestamp_is_ignored()
    {
        $faker = \Faker\Factory::create();
        $base_timestamp = $faker->unixTime;

        $user = User::factory()->create();
        $todo = Todo::factory()
            ->for($user)
            ->state(['updated_at' => $base_timestamp])
            ->create();

        $oldText = $todo->text;
        $editText = $faker->text;
        $editTimestamp = $base_timestamp - 3000;

        $json = '{"1": [{"type": "edit", "text": "' . $editText . '", "timestamp": ' . $editTimestamp . '}]}';

        $decoded_json = json_decode($json, true);

        $this->actingAs($user)->json('POST', '/todonotes/events', $decoded_json);
        $this->assertEquals(200, $this->response->getStatusCode());

        $editTodo = Todo::where('id', 1)->first();
        $this->assertEquals($oldText, $editTodo->text);
        $this->assertEquals($base_timestamp, $editTodo->updated_at);
    }
}
