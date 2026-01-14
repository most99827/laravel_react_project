<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = \App\Models\User::query()
            ->with('group') // Eager load group
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            })
            ->orderBy($request->sort ?? 'created_at', $request->direction ?? 'desc')
            ->paginate($request->per_page ?? 5)
            ->withQueryString();

        $groups = \App\Models\SysAdminGroup::all();

        return \Inertia\Inertia::render('setup/users/index', [
            'users' => $users,
            'sys_admin_groups' => $groups
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'group_id' => 'nullable|exists:sys_admin_groups,id',
        ]);

        \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'group_id' => $validated['group_id'],
        ]);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, $id)
    {
        $user = \App\Models\User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                \Illuminate\Validation\Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8',
            'group_id' => 'nullable|exists:sys_admin_groups,id',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if (!empty($validated['password'])) {
            $user->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }
        $user->group_id = $validated['group_id'];
        $user->save();

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy($id)
    {
        $user = \App\Models\User::findOrFail($id);
        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }
}
