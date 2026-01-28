<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// HAPUS tanda '../' karena file maintenance ada di folder yang sama (sejajar)
if (file_exists($maintenance = __DIR__.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

// HAPUS tanda '../'. Langsung panggil vendor.
require __DIR__.'/vendor/autoload.php';

// HAPUS tanda '../'. Langsung panggil bootstrap.
$app = require_once __DIR__.'/bootstrap/app.php';

$app->handleRequest(Request::capture());