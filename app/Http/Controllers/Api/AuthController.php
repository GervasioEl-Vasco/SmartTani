<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // 1. LIHAT SEMUA USER (index) -> Ini yang tadi error 500
    public function index()
    {
        // Ambil semua user
        $users = User::all();
        return response()->json($users);
    }

    // 2. REGISTER
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'user'
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User berhasil dibuat',
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    // 3. LOGIN
    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Email atau Password salah'], 401);
        }

        $user = User::where('email', $request['email'])->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login sukses',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    // 4. LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Berhasil logout']);
    }

    // 5. HAPUS USER (destroy)
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        // --- BAGIAN INI YANG SERING SALAH KETIK ---
        
        // Ambil ID user yang sedang login sekarang
        $currentUserId = Auth::id(); // Pakai Auth::id() lebih aman
        
        // Cek jangan sampai menghapus diri sendiri
        // Perhatikan: $user->id (TANPA KURUNG)
        if ($currentUserId == $user->id) { 
            return response()->json(['message' => 'Anda tidak bisa menghapus akun sendiri!'], 403);
        }
        // ------------------------------------------

        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus']);
    }
}