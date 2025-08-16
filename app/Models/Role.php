<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Role extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'roles';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'requirement',
        'culture',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        parent::boot();
        
        static::creating(function (self $role): void {
            if (empty($role->slug)) {
                $role->slug = Str::slug($role->name);
            }
        });
        
        static::updating(function (self $role): void {
            if ($role->isDirty('name')) {
                $role->slug = Str::slug($role->name);
            }
        });
    }

    /**
     * Get the user that owns the role.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the analyses for the role.
     */
    public function analyses(): HasMany
    {
        return $this->hasMany(Analysis::class);
    }

    /**
     * Get the completed analyses for the role.
     */
    public function completedAnalyses(): HasMany
    {
        return $this->analyses()->where('status', Analysis::STATUS_COMPLETED);
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get the total number of analyses for this role.
     */
    public function getTotalAnalysesCount(): int
    {
        return $this->analyses()->count();
    }

    /**
     * Get the average technical score for this role.
     */
    public function getAverageTechnicalScore(): ?float
    {
        $average = $this->completedAnalyses()->avg('technical_score');
        return $average ? round($average, 1) : null;
    }

    /**
     * Get the average culture score for this role.
     */
    public function getAverageCultureScore(): ?float
    {
        $average = $this->completedAnalyses()->avg('culture_score');
        return $average ? round($average, 1) : null;
    }
}
