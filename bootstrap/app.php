<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: dirname(__DIR__) . '/routes/web.php',
        api: dirname(__DIR__) . '/routes/api.php',
        commands: dirname(__DIR__) . '/routes/console.php',
        health: '/up',
        then: function () {
            Route::get('/{any}', function () {
                return view('dashboard');
            })->where('any', '.*');
        }
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
