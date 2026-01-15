<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SysAdminGroup;

class UpdateAdminPrivilegesSeeder extends Seeder
{
    public function run()
    {
        $adminGroup = SysAdminGroup::where('group_name', 'Admin')->first();

        if ($adminGroup) {
            $adminGroup->privilege = [
                'dashboard' => ['open' => 1],
                'setup' => [
                    'users' => 1,
                    'security_groups' => 1
                ]
            ];
            $adminGroup->save();
            $this->command->info('Admin group privileges updated.');
        } else {
            // Create if not exists
            SysAdminGroup::create([
                'group_name' => 'Admin',
                'privilege' => [
                    'dashboard' => ['open' => 1],
                    'setup' => [
                        'users' => 1,
                        'security_groups' => 1
                    ]
                ],
                'created_by' => 1 // Assuming user 1 exists
            ]);
            $this->command->info('Admin group created with full privileges.');
        }
    }
}
