<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Resume extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'original_filename',
        'storage_path',
        'status',
        'analysis_result'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'analysis_result' => 'array',
    ];

    protected function analysisResult(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                // $value di sini adalah data mentah dari database
                // yang sudah di-decode sekali oleh $casts
                $value = is_string($value) ? json_decode($value, true) : $value;

                // 1. Ambil string JSON yang ada di dalam 'kotak' dan 'amplop'
                $jsonString = data_get($value, 'candidates.0.content.parts.0.text');

                // Jika tidak ada, kembalikan array kosong
                if (!$jsonString || !is_string($jsonString)) {
                    return [];
                }

                // 2. Decode string JSON tersebut menjadi array yang bersih
                return json_decode($jsonString, true) ?? [];
            }
        );
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
