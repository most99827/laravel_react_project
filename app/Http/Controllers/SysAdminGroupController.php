<?php

namespace App\Http\Controllers;

use App\Models\SysAdminGroup;
use App\Models\SysSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SysAdminGroupController extends Controller
{
    public function index(Request $request)
    {
        $groups = SysAdminGroup::query()
            ->when($request->search, function ($query, $search) {
                $query->where('group_name', 'like', '%' . $search . '%');
            })
            ->orderBy($request->sort ?? 'created_at', $request->direction ?? 'desc')
            ->paginate($request->per_page ?? 10)
            ->withQueryString();

        $settings = SysSetting::first();
        $availablePrivileges = $settings && $settings->admin_group_privilege ? $settings->admin_group_privilege : [];

        return Inertia::render('setup/groups/index', [
            'groups' => $groups,
            'availablePrivileges' => $availablePrivileges,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'group_name' => 'required|string|max:255',
            'privilege' => 'nullable|array',
        ]);

        SysAdminGroup::create([
            'group_name' => $request->group_name,
            'privilege' => $request->privilege,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Security Group created successfully.');
    }

    public function update(Request $request, SysAdminGroup $group)
    {
        $request->validate([
            'group_name' => 'required|string|max:255',
            'privilege' => 'nullable|array',
        ]);

        $group->update([
            'group_name' => $request->group_name,
            'privilege' => $request->privilege,
        ]);

        return redirect()->back()->with('success', 'Security Group updated successfully.');
    }
    public function destroy(SysAdminGroup $group)
    {
        $group->delete();

        return redirect()->back()->with('success', 'Security Group deleted successfully.');
    }

    public function search(Request $request)
    {
        $query = $request->get('query');

        $groups = SysAdminGroup::query()
            ->when($query, function ($q, $search) {
                $q->where('group_name', 'like', '%' . $search . '%');
            })
            ->limit(10)
            ->get(['id', 'group_name']);

        return response()->json($groups->map(function ($group) {
            return [
                'value' => (string) $group->id,
                'label' => $group->group_name,
            ];
        }));
    }
}
