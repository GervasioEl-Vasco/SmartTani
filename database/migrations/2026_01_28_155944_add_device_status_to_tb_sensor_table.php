<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tb_sensor', function (Blueprint $table) {
            $table->boolean('status_pompa')->default(0)->after('kualitas_air');
            $table->boolean('status_kipas')->default(0)->after('status_pompa');
            $table->boolean('status_kipas2')->default(0)->after('status_kipas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_sensor', function (Blueprint $table) {
            $table->dropColumn(['status_pompa', 'status_kipas', 'status_kipas2']);
        });
    }
};
