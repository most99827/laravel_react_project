<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPrivilege
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user || !$user->group) {
            abort(403, 'Unauthorized action.');
        }

        $privileges = $user->group->privilege ?? [];

        // Check permission using dot notation
        $value = data_get($privileges, $permission);

        if ($value != 1) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}
