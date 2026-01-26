<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Vite;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // KODE PENTING:
        // Mengatur public path sama dengan base path (root folder saat ini)
        $this->app->bind('path.public', function() {
            return base_path();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Opsional: Paksa HTTPS
        if($this->app->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        Vite::useBuildDirectory('build');
    }
}