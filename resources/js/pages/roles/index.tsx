import { Head, Link, usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps as InertiaPageProps } from '@/types';
import { toast } from 'sonner';
import { IconEdit, IconTrash, IconPlus, IconChevronLeft } from '@tabler/icons-react';
import { useState } from 'react';

// --- INTERFACE SESUAI DATA DARI BACKEND ---
interface Role {
    id: number;
    name: string;
    requirement: string;
    culture: string | null;
}

interface PaginatedRoles {
    data: Role[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface PageProps extends InertiaPageProps {
    roles: PaginatedRoles;
    flash?: {
        success?: string;
    };
}

export default function RolesIndexPage() {
    const { roles, flash } = usePage<PageProps>().props;
    const { delete: destroy, processing } = useForm();

    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

    const handleDelete = (role: Role) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus profil "${role.name}"?`)) {
            destroy(route('roles.destroy', role.id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Profil berhasil dihapus.'),
                onError: () => toast.error('Gagal menghapus profil.'),
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Profil Analisis', href: route('roles.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Analisis" />

            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Kelola Profil Analisis
                        </h1>
                        <Link
                            href={route('dashboard')}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-700"
                        >
                            <IconChevronLeft size={16} />
                            Kembali ke Dashboard
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 shadow-md rounded-lg overflow-hidden border dark:border-neutral-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-neutral-800 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nama Profil</th>
                                    <th scope="col" className="px-6 py-3">Kualifikasi</th>
                                    <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                                </thead>
                                <tbody>
                                {roles.data.map((role) => (
                                    <tr key={role.id} className="bg-white border-b dark:bg-neutral-900 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {role.name}
                                        </td>
                                        <td className="px-6 py-4 max-w-md truncate">
                                            {role.requirement}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-1.5 text-gray-500 hover:text-red-600" onClick={() => handleDelete(role)}>
                                                    <IconTrash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {roles.data.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                                            Anda belum membuat profil analisis.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Links */}
                        <div className="p-4">
                            <nav className="flex justify-between items-center">
                                <div></div> {/* Placeholder for item count if needed */}
                                <ul className="flex items-center -space-x-px h-8 text-sm">
                                    {roles.links.map((link, index) => (
                                        <li key={index}>
                                            <Link
                                                href={link.url || '#'}
                                                className={`flex items-center justify-center px-3 h-8 leading-tight ${
                                                    link.active ? 'text-blue-600 bg-blue-50 border-blue-300' : 'text-gray-500 bg-white border-gray-300'
                                                } hover:bg-gray-100 hover:text-gray-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-400 dark:hover:bg-neutral-700 dark:hover:text-white`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
