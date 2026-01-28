use Illuminate\Support\Facades\Route;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

Route::get('/coba', function () {
    // 1. Cari user admin
    $user = User::where('email', 'admin@smarttani.com')->first();

    if (!$user) {
        return "Error: User admin@smarttani.com tidak ditemukan di database!";
    }

    // 2. Ubah password jadi Bcrypt Hash yang benar
    $user->password = Hash::make('password123'); // Ganti password123 jika mau password lain
    $user->save();

    return "SUKSES! Password untuk " . $user->email . " sudah diperbaiki formatnya (Bcrypt). Silakan Login.";
});