<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class SysSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\SysSetting::truncate();

        \App\Models\SysSetting::create([
            'admin_group_privilege' => [
                'dashboard' => [
                    'open' => '1',
                ],
                'setup' => [
                    'users' => '1',
                    'security_groups' => '1',
                ],
                'van' => [
                    'view' => '1',
                    'show' => '1',
                    'add' => '1',
                    'search' => '1',
                    'deactivate' => '1',
                ],
                'sales_person' => [
                    'view' => '1',
                    'search' => '1',
                    'show' => '1',
                    'edit' => '1',
                ],
                'load_request' => [
                    'view' => '1',
                    'search' => '1',
                    'show' => '1',
                ],
            ],
        ]);
    }
}
