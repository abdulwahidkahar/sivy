<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class RoleController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of roles.
     */
    public function index(): Response
    {
        /** @var User $user */
        $user = Auth::user();
        
        $roles = $user->roles()
            ->withCount(['analyses', 'completedAnalyses'])
            ->latest()
            ->paginate(10);

        return Inertia::render('roles/index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,NULL,id,user_id,' . Auth::id(),
            'requirement' => 'required|string|max:5000',
            'culture' => 'nullable|string|max:5000',
        ], [
            'name.unique' => 'Anda sudah memiliki role dengan nama ini.',
            'requirement.required' => 'Deskripsi requirement wajib diisi.',
            'requirement.max' => 'Deskripsi requirement tidak boleh lebih dari 5000 karakter.',
            'culture.max' => 'Deskripsi culture tidak boleh lebih dari 5000 karakter.',
        ]);

        try {
            /** @var User $user */
            $user = Auth::user();
            $role = $user->roles()->create($validated);

            Log::info('Role created', [
                'user_id' => $user->id,
                'role_id' => $role->id,
                'role_name' => $role->name,
            ]);

            return redirect()->route('roles.index')
                ->with('success', 'Profil baru berhasil dibuat.');

        } catch (Throwable $e) {
            Log::error('Role creation failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan saat membuat profil.');
        }
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): Response
    {
        $this->authorize('view', $role);

        $role->loadCount(['analyses', 'completedAnalyses']);
        $role->load(['analyses' => function ($query): void {
            $query->with('resume')->latest()->limit(10);
        }]);

        return Inertia::render('Roles/Show', [
            'role' => $role,
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $this->authorize('update', $role);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:roles,name,' . $role->id . ',id,user_id,' . $role->user_id,
            'requirement' => 'sometimes|required|string|max:5000',
            'culture' => 'nullable|string|max:5000',
        ], [
            'name.unique' => 'Anda sudah memiliki role dengan nama ini.',
            'requirement.required' => 'Deskripsi requirement wajib diisi.',
            'requirement.max' => 'Deskripsi requirement tidak boleh lebih dari 5000 karakter.',
            'culture.max' => 'Deskripsi culture tidak boleh lebih dari 5000 karakter.',
        ]);

        try {
            $role->update($validated);

            Log::info('Role updated', [
                'user_id' => Auth::id(),
                'role_id' => $role->id,
                'role_name' => $role->name,
            ]);

            return redirect()->back()->with('success', 'Profil berhasil diperbarui.');

        } catch (Throwable $e) {
            Log::error('Role update failed', [
                'user_id' => Auth::id(),
                'role_id' => $role->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan saat memperbarui profil.');
        }
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('delete', $role);

        try {
            // Check if role has associated analyses
            $analysisCount = $role->analyses()->count();
            
            if ($analysisCount > 0) {
                return redirect()->back()
                    ->with('error', "Tidak dapat menghapus profil karena masih memiliki {$analysisCount} analisis terkait.");
            }

            $roleName = $role->name;
            $role->delete();

            Log::info('Role deleted', [
                'user_id' => Auth::id(),
                'role_id' => $role->id,
                'role_name' => $roleName,
            ]);

            return redirect()->route('roles.index')
                ->with('success', 'Profil berhasil dihapus.');

        } catch (Throwable $e) {
            Log::error('Role deletion failed', [
                'user_id' => Auth::id(),
                'role_id' => $role->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menghapus profil.');
        }
    }
}
