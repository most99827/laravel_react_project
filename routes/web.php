<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard')->middleware('privilege:dashboard.open');

    Route::resource('setup/users', \App\Http\Controllers\UserController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware('privilege:setup.users');

    Route::resource('setup/groups', \App\Http\Controllers\SysAdminGroupController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware('privilege:setup.security_groups');
});

require __DIR__ . '/settings.php';
