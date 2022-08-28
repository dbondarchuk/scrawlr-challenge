# Solution


## Idea 
The idea behind this implementation is usage of `events`, which allows user to work offline with their ToDo notes

Each action generates a respective event: `create`, `edit`, `complete`, `uncomplete`, `delete`. 

When user generates a new event, application will try to `sync` with the remote server and if it has succeeded, flush all events in the queue to the server. Otherwise, events will be stored in a queue. 

When a call to push events fails, app notifies a user about an error, letting them know, that they still can work with an offline copy. In the background it will start retrying to push events in the queue every 10 seconds until it succeeds letting them know, that they are now back online.

Additionally, snapshot of the current notes and events are stored in `window.localStorage`, which allows users to sync their work when they return to the app (i.e. on page reload), so no events are lost. Or to still work with their offline copy if server is still down.

This will allow us to create installable PWA which can theoretically work offline (out of the scope for the current challenge).

## Workflow

1. Sign in / sign up
2. Add a new note by typing in a large input field and hitting `Enter` (or clicking `Add` button)
3. Edit a note text by clicking on its' text -> putting a new value -> hit `Enter` or loose focus from the field
4. Mark completed by clicking on a checkbox
5. Mark pending by clicking on a checkbox again
6. Delete by clicking on trash can icon on the right side
7. Add more notes
8. Filter them by status (all, done, pending) and sort by created or completed date

## Endpoints

API still exposes endpoints to directly do those actions with out using events workflow. Please see [web.php](src/api/routes/web.php) file for this endpoints.

## Event queue optimization

Event queue is designed to reduce number of events that are sent to the server.

This is achieved using tree shaking of previous events, which are still in a queue and not have been synchronized.

For example:

- Action of a type `complete` or `uncomplete` will cancel all previous `complete` and `uncomplete` events and will generate a new one only when no previous events were found.
- Action of a type `edit` will cancel all previous `edit` events and will generate a new one with the latest note's text
- Action of a type `delete` will cancel **all** events for this note and will generate `delete` event **only** when the queue had not an event with type `create`.

This allows us to achieve a pretty small set of the events pushed to the server, when user has worked with an offline copy too long. Essentially, each todo note will have maximum of *3* events for it.

It worth mentioning, if user is online, each action will generate an event which will be immediately pushed to the server for a better synchronization.

Also users can sync their work at any time by clicking **Sync** button.

## Possible events overwrite

With a current design of the event such situation:

```
User A works on a Machine A with offline copy and generates locally saved events queue .

-> 

Opens an online copy on a Machine B and successfully synchronize their actions with a server making those actions as latest for them.

-> 

Comes back to Machine A while being online, which triggers the push of his stale events to the server
```

Is handled by basic check for all new events to have a timestamp larger then `updated_at` field of the note. So events from stale offline copy would be ignored in this case.

## Tests

Following `make` targets were added:

- `make api.test` - runs API tests
- `make ui.test` - runs UI tests
- `make ui.test.watch` - runs UI tests in a watch mode
- `make test` - Combination of `make api.test` and `make ui.test` targets

UI tests could be found alongside their respective components/services and are run using `vitest`

API tests could be found in folder [tests](src/api/tests/) and a run using `phpunit`

## UI

UI is build using Bootstrap to be responsive and works pretty good on the mobile device.

---------

# Scrawlr Hiring | Full Stack Technical Assessment

Hello and welcome to Scrawlr's technical assessment for Full Stack candidates.
Please see the instructions below and contined within the source code for the requirements for submission.

Expected completion time: 2-3 hours

## Requirements for submission

1. The focus of this project is the connection between the frontend and backend
    - this means that we will not be grading the styling of frontend UI or the database design
2. Must support offline mode
    - offline mode allows for viewing of existing cached content if the internet connection goes down
3. Must support graceful API interactions if the API shuts down
    - you can manually shut down the API with the command `make api.stop`
    - HINT: update the visuals as though it succeeded and then try to resend the request until it succeeds
        or too much time has passed

## How to get this running

### Development Requirements

1. make
2. docker v20+ (check that `docker compose version` works)
    - Docker Compose version v2.5.0

### Installation instructions

1. `cp .env.example .env` -- make any edits to `.env` as required
    - You can change ports here if you run into conflicts
2. `cp src/api/.env.example src/api/.env` -- make any edits to `.env` as required
3. `make up` - start all of the containers
4. `make api.install` - runs composer install for the api
5. `make db.migrate` - setup the database initial migration

### Useful Commands

Please see all commands inside `Makefile`.

- `make api` - this will get you a bash terminal inside the API.
    You can use `php artisan` to create laravel files quickly
- `make logs.watch` - this will show you all docker logs and automatically update them
    - You can use `make logs.{api,ui,db}` to filter it to a specific container
