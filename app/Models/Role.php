<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Role extends Model
{
    protected $table = 'roles';

    protected $fillable = ['user_id', 'name', 'slug', 'requirement', 'culture'];
    protected static function booted()
    {
        parent::boot();
        static::creating(function ($role) {
            $role->slug = Str::slug($role->name);
        });
    }

    public function user():BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
