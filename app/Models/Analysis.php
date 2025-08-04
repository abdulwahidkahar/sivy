<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Analysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'resume_id',
        'role_id',
        'status',
        'recruitment_status',
        'technical_score',
        'culture_score',
        'summary',
        'justification',
        'raw_result',
    ];

    /**
     * Mengubah tipe data atribut secara otomatis.
     * Kolom JSON akan otomatis di-decode/encode menjadi array PHP.
     */
    protected $casts = [
        'justification' => 'array',
        'raw_result' => 'array',
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

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class);
    }
}
