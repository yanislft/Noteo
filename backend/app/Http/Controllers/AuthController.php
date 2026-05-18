<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'firstname' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'firstname' => $request->firstname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            // Email sending failed, but account is created
        }

        return response()->json(['message' => 'Vérifiez votre email pour activer votre compte.', 'user' => $user], 201);
    }

    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->getEmailForVerification()), (string) $hash)) {
            return response()->json(['message' => 'Lien de vérification invalide.'], 403);
        }

        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));

        if ($user->hasVerifiedEmail()) {
            return redirect($frontendUrl . '/login?verified=already');
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return redirect($frontendUrl . '/login?verified=1');
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        Password::sendResetLink($request->only('email'));

        // Always return 200 to avoid email enumeration
        return response()->json(['message' => 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'                 => 'required',
            'email'                 => 'required|email',
            'password'              => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->password = Hash::make($password);
                $user->setRememberToken(Str::random(60));
                $user->save();
                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
        }

        $errorMessage = match ($status) {
            Password::INVALID_TOKEN => 'Lien invalide ou expiré. Veuillez refaire une demande.',
            Password::INVALID_USER  => 'Aucun compte trouvé pour cet email.',
            Password::RESET_THROTTLED => 'Trop de tentatives. Veuillez patienter.',
            default                 => 'Une erreur est survenue.',
        };

        return response()->json(['message' => $errorMessage], 422);
    }

    public function resendVerification(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->hasVerifiedEmail()) {
            // Always return 200 to avoid email enumeration
            return response()->json(['message' => 'Si un compte non vérifié existe pour cet email, un lien a été envoyé.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Si un compte non vérifié existe pour cet email, un lien a été envoyé.']);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!$token = auth()->attempt($credentials)) {
            return response()->json(['message' => 'Identifiants incorrects'], 422);
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
            'name'      => 'required|string|max:255',
            'firstname' => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email,' . $user->id,
        ];

        if ($request->filled('current_password')) {
            $rules['current_password']    = 'required';
            $rules['password']            = 'required|min:8|confirmed';
        }

        $request->validate($rules);

        if ($request->filled('current_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['errors' => ['current_password' => ['Mot de passe actuel incorrect']]], 422);
            }
            $user->password = Hash::make($request->password);
        }

        $emailChanged = $request->email !== $user->email;

        $user->name      = $request->name;
        $user->firstname = $request->firstname;
        $user->email     = $request->email;

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json($user);
    }
}
