<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\SQLiteConnection;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Inject YEAR() function for local SQLite compatibility
        if (DB::connection() instanceof SQLiteConnection) {
            DB::connection()->getPdo()->sqliteCreateFunction('YEAR', function ($string) {
                return substr($string, 0, 4);
            }, 1);
        }

        RateLimiter::for('auth', function (Request $request) {
            return [
                Limit::perMinute(10)->by($request->ip()),
            ];
        });
    }
}
