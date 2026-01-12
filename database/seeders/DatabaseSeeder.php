<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Buat 1 Admin Default
        User::create([
            'name' => 'Admin SmartTani',
            'email' => 'admin@smarttani.com', // Email untuk login
            'password' => Hash::make('smarttani12345'), // Password login
        ]);
    }
}