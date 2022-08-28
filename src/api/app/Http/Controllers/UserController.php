<?php

namespace App\Http\Controllers;

use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Returns the full USER object for a logged in user.
     * THIS IS FOR TESTING PURPOSES
     *
     * @param Request $request
     * @return void
     */
    function testAuth(Request $request)
    {
        return response()->json(Auth::user());
    }

    /**
     * invalidate the token api key in the db/redis.
     *   Return if successful, fail for non-valid api tokens
     *   inputs: [api_token|handled by middleware]
     *   return: [success]
     *
     * @param Request $request
     * @return void
     */
    function logout(Request $request)
    {
        $user = Auth::user();
        $user->api_token = null;
        $user->save();

        return 'success';
    }

    /**
     * Return the username for a given api token
     *      inputs: [api_token]
     *      return: [username]
     *
     * @param Request $request
     * @return void
     */
    function me(Request $request)
    {
        return Auth::user()->username;
    }

    /**
     * create a new user and login the user
     *       inputs: [username, password, confirm_password]
     *       returns: api_token
     *
     * @param Request $request
     * @return void
     */
    function signup(Request $request)
    {
        $newUser = $this->validate($request, [
            'username' => ['required'],
            'password' => ['required'],
            'confirm_password' => ['required'],
        ]);

        if($newUser['password'] && strlen($newUser['password']) < 8) {
            return response()->json('Error: password should have at least 8 symbols', 400);
        }

        if($newUser['password'] && $newUser['password'] != $newUser['confirm_password']) {
            return response()->json('Error: passwords do not match', 400);
        }

        $user = User::where('username', $newUser['username'])->first();

        if($user) {
            return response()->json('Error: username already exists', 400);
        }

        Log::info(Hash::make($newUser['password']));

        $api_token = Str::random(20);
        User::create([
            'username'=>$newUser['username'],
            'password_hash'=>Hash::make($newUser['password']),
            'api_token'=>$api_token,
        ]);

        return $api_token;
    }

    /**
     * return an API token that is stored in the db/redis
     *      inputs: [username, password]
     *      returns: api_token
     *
     * @param Request $request
     * @return void
     */
    function login(Request $request)
    {
        $credentials = $this->validate($request, [
            'username' => ['required'],
            'password' => ['required'],
        ]);

        $user = User::where('username', $credentials['username'])
            ->first();

        if (is_null($user)) {
            return response('', 401);
        }

        if (Hash::check($credentials['password'], $user->password_hash)) {
            $api_token = Str::random(20);

            $user->api_token = $api_token;
            $user->save();

            return response()->json(['api_token' => $api_token]);
        }

        return response()->json('Error: no username and password exists', 401);
    }
}
