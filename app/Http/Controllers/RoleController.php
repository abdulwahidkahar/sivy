<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Auth::user()->roles()->latest()->paginate(10);

        return Inertia::render('roles/index', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'requirement' => 'required|string',
            'culture' => 'nullable|string',
        ]);

        Auth::user()->roles()->create($validated);

        return redirect()->route('roles.index')->with('success', 'Profil baru berhasil dibuat.');
    }

    public function show(Role $role)
    {
        $this->authorize('view', $role);

        return Inertia::render('Roles/Show', [
            'role' => $role,
        ]);
    }

    /**
     * Memperbarui data role dan mengarahkan kembali.
     */
    public function update(Request $request, Role $role)
    {
        $this->authorize('update', $role);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'requirement' => 'sometimes|required|string',
            'culture' => 'nullable|string',
        ]);

        $role->update($validated);

        return redirect()->back()->with('success', 'Profil berhasil diperbarui.');
    }


    public function destroy(Role $role)
    {
        $this->authorize('delete', $role);
        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Profil berhasil dihapus.');
    }
}
