<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'firstname' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'firstname' => $request->firstname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json(['token' => $token, 'user' => $user], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!$token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Identifiants incorrects'], 401);
        }

        return response()->json(['token' => $token, 'user' => auth()->user()]);
    }

    public function logout()
    {
        auth()->logout();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    public function me()
    {
        return response()->json(auth()->user());
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        $rules = [
            'name'      => 'required|string',
            'firstname' => 'required|string',
            'email'     => 'required|email|unique:users,email,' . $user->id,
        ];

        if ($request->filled('current_password')) {
            $rules['current_password']    = 'required';
            $rules['password']            = 'required|min:6|confirmed';
        }

        $request->validate($rules);

        if ($request->filled('current_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['errors' => ['current_password' => ['Mot de passe actuel incorrect']]], 422);
            }
            $user->password = Hash::make($request->password);
        }

        $user->name      = $request->name;
        $user->firstname = $request->firstname;
        $user->email     = $request->email;
        $user->save();

        return response()->json($user);
    }
}
