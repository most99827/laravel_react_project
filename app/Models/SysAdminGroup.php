<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SysAdminGroup extends Model
{
    use HasFactory;

    protected $fillable = ['group_name', 'privilege', 'created_by'];

    protected $casts = [
        'privilege' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'group_id');
    }
}
