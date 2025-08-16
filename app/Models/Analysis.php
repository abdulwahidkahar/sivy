<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Log;

class Analysis extends Model
{
    use HasFactory;

    /**
     * Analysis status constants.
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    /**
     * Recruitment status constants.
     */
    public const RECRUITMENT_STATUS_NEW = 'new';
    public const RECRUITMENT_STATUS_REVIEWED = 'reviewed';
    public const RECRUITMENT_STATUS_SHORTLISTED = 'shortlisted';
    public const RECRUITMENT_STATUS_REJECTED = 'rejected';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
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
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'justification' => 'array',
        'raw_result' => 'array',
        'technical_score' => 'integer',
        'culture_score' => 'integer',
    ];

    /**
     * Get the analysis result attribute.
     */
    protected function analysisResult(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value, array $attributes): array => $attributes['raw_result'] ?? []
        );
    }

    /**
     * Get the role that this analysis belongs to.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the resume that this analysis belongs to.
     */
    public function resume(): BelongsTo
    {
        return $this->belongsTo(Resume::class);
    }

    /**
     * Get the skills associated with this analysis.
     */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class);
    }

    /**
     * Check if the analysis is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if the analysis is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if the analysis is processing.
     */
    public function isProcessing(): bool
    {
        return $this->status === self::STATUS_PROCESSING;
    }

    /**
     * Check if the analysis has failed.
     */
    public function hasFailed(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }

    /**
     * Get the overall score (average of technical and culture scores).
     */
    public function getOverallScore(): ?float
    {
        if ($this->technical_score === null || $this->culture_score === null) {
            return null;
        }

        return round(($this->technical_score + $this->culture_score) / 2, 1);
    }

    /**
     * Get the candidate name from raw result.
     */
    public function getCandidateName(): string
    {
        return $this->raw_result['nama_kandidat'] ?? 'Unknown Candidate';
    }

    /**
     * Mark the analysis as completed.
     */
    public function markAsCompleted(): bool
    {
        return $this->update(['status' => self::STATUS_COMPLETED]);
    }

    /**
     * Mark the analysis as failed.
     */
    public function markAsFailed(): bool
    {
        return $this->update(['status' => self::STATUS_FAILED]);
    }

    /**
     * Mark the analysis as processing.
     */
    public function markAsProcessing(): bool
    {
        return $this->update(['status' => self::STATUS_PROCESSING]);
    }
}
