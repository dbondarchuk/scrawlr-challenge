<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Validator;
use App\Models\Todo;

class TodoNotesController extends Controller
{
    /**
     * Gets all users notes
     *      returns: todo notes
     *
     * @param Request $request
     * @return void
     */
    function getAll(Request $request)
    {
        $notes = Todo::where('user_id', Auth::user()->id)->get();

        return response()->json($notes);
    }

    function create(Request $request)
    {
        $input = $request->json()->all();
        $data = Validator::make($input, [
            'text' => ['required', 'string', 'min:1'],
            'created_at' => ['required', 'numeric', 'min:1']
        ]);

        if ($data->fails()) {
            return response()->json($data->errors(), 400);
        }

        $todo = Todo::create([
            'text' => $input['text'],
            'user_id' => Auth::user()->id,
            'created_at' => $input['created_at'],
            'updated_at' => $input['created_at'],
            'completed_at' => NULL
        ]);

        $todo->save();

        return response()->json($todo->id, 201);
    }

    function markDone(Request $request)
    {
        $todo = Todo::find($request->todo_id);
        if (is_null($todo)) {
            return response('Item not found', 404);
        }

        $todo->completed_at = time()*1000;
        $todo->updated_at = time()*1000;

        $todo->save();

        return response('', 204);
    }

    function markPending(Request $request)
    {
        $todo = Todo::find($request->todo_id);
        if (is_null($todo)) {
            return response('Item not found', 404);
        }
        
        $todo->completed_at = NULL;
        $todo->updated_at = time()*1000;

        $todo->save();

        return response('', 204);
    }

    function delete(Request $request)
    {
        $todo = Todo::find($request->todo_id);
        if (is_null($todo)) {
            return response('Item not found', 404);
        }

        $todo->delete();

        return response('', 204);
    }

    function edit(Request $request)
    {
        $input = $request->json()->all();
        $data = Validator::make($input, [
            'text' => ['required', 'string', 'min:1']
        ]);

        if ($data->fails()) {
            return response()->json($data->errors(), 400);
        }

        $todo = Todo::find($request->todo_id);
        if (is_null($todo)) {
            return response('Item not found', 404);
        }

        $todo->text = $input['text'];
        $todo->updated_at = time()*1000;

        $todo->save();

        return response('', 204);
    }

    /**
     * Gets all users notes
     *      returns: todo notes
     *
     * @param Request $request
     * @return void
     */
    function saveEvents(Request $request)
    {
        $allEvents = $request->json()->all();

        $ids = array();
        $errors = array();

        foreach ($allEvents as $id => $events) {
            $todo = NULL;
            $removed = false;
            $timestamp = -1;
            foreach ($events as $event) {
                $data = Validator::make($event, [
                    'timestamp' => ['required', 'numeric', 'min:1']
                ]);
        
                if ($data->fails()) {
                    array_push($errors, [$id => $data->errors()]);
                    break;
                }

                if ($event['type'] == 'create') {
                    $data = Validator::make($event, [
                        'text' => ['required', 'string', 'min:1'],
                    ]);
            
                    if ($data->fails()) {
                        array_push($errors, [$id => $data->errors()]);
                        break;
                    }

                    $todo = Todo::create([
                        'text' => $event['text'],
                        'user_id' => Auth::user()->id,
                        'created_at' => $event['timestamp'],
                        'updated_at' => $event['timestamp'],
                        'completed_at' => NULL
                    ]);

                    $ids[$id] = $todo->id;
                    $timestamp = $event['timestamp'];
                } else if ($event['type'] == 'complete') {
                    if (is_null($todo)) {
                        $todo = Todo::find($id);
                        if (is_null($todo)) {
                            array_push($errors, [$id => 'Not found']);
                            break;
                        }
                    }
                    
                    if (!is_null($todo->updated_at) && $todo->updated_at > $event['timestamp']) {
                        continue;
                    }
                    
                    $todo->completed_at = $event['timestamp'];
                    if ($event['timestamp'] > $timestamp) $timestamp = $event['timestamp'];
                } else if ($event['type'] == 'uncomplete') {
                    if (is_null($todo)) {
                        $todo = Todo::find($id);
                        if (is_null($todo)) {
                            array_push($errors, [$id => 'Not found']);
                            break;
                        }
                    }
                    
                    if (!is_null($todo->updated_at) && $todo->updated_at > $event['timestamp']) {
                        continue;
                    }

                    $todo->completed_at = NULL;
                    if ($event['timestamp'] > $timestamp) $timestamp = $event['timestamp'];
                } else if ($event['type'] == 'edit') {
                    if (is_null($todo)) {
                        $todo = Todo::find($id);
                        if (is_null($todo)) {
                            array_push($errors, [$id => 'Not found']);
                            break;
                        }
                    }
                    
                    if (!is_null($todo->updated_at) && $todo->updated_at > $event['timestamp']) {
                        continue;
                    }

                    $data = Validator::make($event, [
                        'text' => ['required', 'string', 'min:1']
                    ]);
            
                    if ($data->fails()) {
                        array_push($errors, [$id => $data->errors()]);
                        break;
                    }

                    $todo->text = $event['text'];
                    if ($event['timestamp'] > $timestamp) $timestamp = $event['timestamp'];
                } else if ($event['type'] == 'delete') {
                    if (is_null($todo)) {
                        $todo = Todo::find($id);
                        if (is_null($todo)) {
                            array_push($errors, [$id => 'Not found']);
                            break;
                        }
                    }
                    
                    if (!is_null($todo->updated_at) && $todo->updated_at > $event['timestamp']) {
                        continue;
                    }

                    $todo->delete();
                    $removed = true;
                    break;
                } else {
                    return response()->json('Unknown event type', 400);
                }
            }

            if (!is_null($todo) && !$removed && $timestamp >= 0) {
                $todo->updated_at = $timestamp;
                $todo->save();
            }
        }

        return response()->json(["ids" => $ids, "errors" => $errors]);
    }
}
