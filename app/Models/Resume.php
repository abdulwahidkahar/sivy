<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Log;

class Resume extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'original_filename',
        'storage_path',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'analysis_result' => 'array',
    ];

    /**
     * Get the analysis result attribute with proper JSON parsing.
     */
    protected function analysisResult(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value): array => $this->parseNestedJson($value)
        );
    }

    /**
     * Parse nested JSON data safely.
     *
     * @param mixed $value
     * @return array<string, mixed>
     */
    private function parseNestedJson(mixed $value): array
    {
        try {
            $value = is_string($value) ? json_decode($value, true) : $value;
            
            if (!is_array($value)) {
                return [];
            }
            
            $jsonString = data_get($value, 'candidates.0.content.parts.0.text');
            
            if (!is_string($jsonString)) {
                return [];
            }
            
            $decoded = json_decode($jsonString, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::warning('Failed to decode JSON in Resume analysis result', [
                    'resume_id' => $this->id,
                    'json_error' => json_last_error_msg(),
                ]);
                return [];
            }
            
            return is_array($decoded) ? $decoded : [];
        } catch (\Throwable $e) {
            Log::error('Error parsing nested JSON in Resume', [
                'resume_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Get the user that owns the resume.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the analyses for the resume.
     */
    public function analyses(): HasMany
    {
        return $this->hasMany(Analysis::class);
    }

    /**
     * Get the latest analysis for the resume.
     */
    public function latestAnalysis(): ?Analysis
    {
        return $this->analyses()->latest()->first();
    }

    /**
     * Check if the resume has been analyzed.
     */
    public function hasBeenAnalyzed(): bool
    {
        return $this->analyses()->where('status', 'completed')->exists();
    }
}
