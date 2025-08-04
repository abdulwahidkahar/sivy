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
    ];

    protected $casts = [
        'analysis_result' => 'array',
    ];

    protected function analysisResult(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $this->parseNestedJson($value)
        );
    }

    private function parseNestedJson($value): array
    {
        $value = is_string($value) ? json_decode($value, true) : $value;
        $jsonString = data_get($value, 'candidates.0.content.parts.0.text');

        return is_string($jsonString) ? json_decode($jsonString, true) ?? [] : [];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function analyses()
    {
        return $this->hasMany(Analysis::class);
    }
}
