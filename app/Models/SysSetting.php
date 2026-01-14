<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SysSetting extends Model
{
    use HasFactory;

    protected $fillable = ['admin_group_privilege'];

    protected $casts = [
        'admin_group_privilege' => 'array',
    ];
}
