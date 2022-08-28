<?php

/** @var \Laravel\Lumen\Routing\Router $router */


/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->get('/', function () use ($router) {
    return $router->app->version();
});

$attributes = [
    // do not change the prefix our the endpoints
    'prefix' => 'user',
    // Can change the namespace
    // 'namespace' => 'User',
];
$router->group(
    $attributes,
    function () use ($router, $attributes) {
        $router->post('/signup', ['uses' => 'UserController@signup']);
        $router->post('/login', ['uses' => 'UserController@login']);
    }
);

$attributes = [
    // do not change the prefix our the endpoints
    'prefix' => 'user',
    'middleware' => ['auth'],
    // Can change the namespace
    // 'namespace' => 'UserController',
];
$router->group(
    $attributes,
    function () use ($router, $attributes) {

        $router->get('/testauth', ['uses' => 'UserController@testAuth']);
        $router->post('/me', ['uses' => 'UserController@me']);
        $router->post('/logout', ['uses' => 'UserController@logout']);
    }
);

$attributes = [
    // do not change the prefix our the endpoints
    'prefix' => 'todonotes',
    // Can change the namespace
    // 'namespace' => 'TodoNotes',
    'middleware' => ['auth'],
];
$router->group(
    $attributes,
    function () use ($router, $attributes) {

        $router->get('/', ['uses' => 'TodoNotesController@getAll']);
        $router->post('/events', ['uses' => 'TodoNotesController@saveEvents']);
        
        $router->put('/', ['uses' => 'TodoNotesController@create']);
        $router->post('/{todo_id}', ['uses' => 'TodoNotesController@edit']);
        $router->delete('/{todo_id}', ['uses' => 'TodoNotesController@delete']);
        $router->post('/mark/done/{todo_id}', ['uses' => 'TodoNotesController@markDone']);
        $router->post('/mark/pending/{todo_id}', ['uses' => 'TodoNotesController@markPending']);

        // $router->post('/create', function () use ($router) {
        //     // return an API token that is stored in the db/redis
        //     // inputs: [api_token, todo_note_string]
        //     // returns: api_token
        //     return $router->app->version();
        // });

        // $router->post('/mark/done/{todo_id}', function () use ($router) {
        //     // Marks a todo note as done and store the time it was finished
        //     // inputs: [api_token]
        //     // return: [success]
        //     return $router->app->version();
        // });

        // $router->post('/mark/pending/{todo_id}', function () use ($router) {
        //     // Marks a todo note as pending
        //     // inputs: [api_token]
        //     // return: [success]
        //     return $router->app->version();
        // });
    }
);
