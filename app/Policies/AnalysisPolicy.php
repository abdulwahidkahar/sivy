<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Analysis;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AnalysisPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the analysis.
     */
    public function view(User $user, Analysis $analysis): bool
    {
        // User can view analysis if they own the resume that was analyzed
        return $analysis->resume->user_id === $user->id;
    }

    /**
     * Determine whether the user can view any analyses.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create analyses.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the analysis.
     */
    public function update(User $user, Analysis $analysis): bool
    {
        // User can update analysis if they own the resume that was analyzed
        return $analysis->resume->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the analysis.
     */
    public function delete(User $user, Analysis $analysis): bool
    {
        // User can delete analysis if they own the resume that was analyzed
        return $analysis->resume->user_id === $user->id;
    }
}