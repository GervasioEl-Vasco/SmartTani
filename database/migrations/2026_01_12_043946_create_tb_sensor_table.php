<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tb_sensor', function (Blueprint $table) {
            $table->id();
            $table->float('suhu_ruangan')->default(0);
            $table->float('kelembaban_ruangan')->default(0);
            $table->float('suhu_tanah')->default(0);
            $table->float('kelembaban_tanah')->default(0);
            $table->float('ph_air')->default(0);
            $table->float('kualitas_air')->default(0);
            $table->boolean('status_kipas')->default(0);
            $table->boolean('status_pompa')->default(0);
            $table->boolean('status_atap')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_sensor');
    }
};
