import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps as InertiaPageProps } from '@/types';
import { toast } from 'sonner';
import { type FormEvent, useEffect, useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { IconCircleCheckFilled, IconLoader, IconCircleXFilled, IconClock, IconPlus, IconX } from '@tabler/icons-react';

// --- INTERFACE (TETAP SAMA) ---
interface Role {
    id: number;
    name: string;
}

interface Analysis {
    id: number;
    status: string;
    created_at: string;
    resume: {
        id: number;
        original_filename: string;
    };
}

interface PageProps extends InertiaPageProps {
    recentAnalyses: Analysis[];
    stats: {
        total: number;
        newThisMonth: number;
        averageScore: number;
    };
    roles: Role[];
    filters: {
        role_id: number | null;
    };
    flash?: {
        success?: string;
        info?: string;
        error?: string;
    };
}

// --- KOMPONEN CreateRoleModal & StatusBadge & StatCard (TETAP SAMA) ---
function CreateRoleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        requirement: '',
        culture: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('roles.store'), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                reset();
                toast.success('Profil baru berhasil dibuat!');
            },
            onError: () => {
                toast.error('Gagal membuat profil. Periksa kembali isian Anda.');
            },
        });
    };

    useEffect(() => {
        if (isOpen) {
            reset();
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-xl border bg-white p-6 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 animate-in fade-in-0 zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Buat Profil Analisis Baru</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700">
                        <IconX size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Profil</label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
                            placeholder="Contoh: Backend Developer (Laravel)"
                        />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="requirement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kualifikasi Teknis</label>
                        <textarea
                            id="requirement"
                            value={data.requirement}
                            onChange={(e) => setData('requirement', e.target.value)}
                            rows={4}
                            className="w-full rounded-md border-gray-300 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
                            placeholder="Jelaskan hard skills yang dibutuhkan..."
                        />
                        {errors.requirement && <p className="text-sm text-red-500 mt-1">{errors.requirement}</p>}
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 disabled:bg-gray-400 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Profil'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const StatusBadge = ({ status }: { status: string }) => {
    let icon;
    let text = status.charAt(0).toUpperCase() + status.slice(1);

    switch (status) {
        case 'completed':
            icon = <IconCircleCheckFilled className="h-4 w-4 text-green-500" />;
            text = 'Done';
            break;
        case 'processing':
            icon = <IconLoader className="h-4 w-4 animate-spin text-blue-500" />;
            text = 'Processing';
            break;
        case 'failed':
            icon = <IconCircleXFilled className="h-4 w-4 text-red-500" />;
            text = 'Failed';
            break;
        case 'pending':
            icon = <IconClock className="h-4 w-4 text-yellow-500" />;
            text = 'Pending';
            break;
        default:
            icon = null;
    }

    return (
        <Badge variant="outline" className="flex w-fit items-center gap-1.5 px-2 py-1 text-sm">
            {icon}
            <span>{text}</span>
        </Badge>
    );
};

function StatCard({ title, value }: { title: string; value: string | number }) {
    return (
        <div className="rounded-xl border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">{value}</p>
        </div>
    );
}


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
];

export default function Dashboard() {
    const { recentAnalyses, stats, roles, filters, flash, errors } = usePage<PageProps>().props;

    const [selectedRoleId, setSelectedRoleId] = useState<number | ''>(filters.role_id || '');
    const [isCreateRoleModalOpen, setCreateRoleModalOpen] = useState(false);
    const { data, setData, post: postResume, processing } = useForm({
        resume_files: [] as File[],
        role_id: filters.role_id || '',
    });

    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        if (selectedRoleId) {
            router.get(route('dashboard'), { role_id: selectedRoleId }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }
    }, [selectedRoleId]);

    useEffect(() => {
        setData('role_id', selectedRoleId);
    }, [selectedRoleId]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.info) toast.info(flash.info);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleUpload = (e: FormEvent) => {
        e.preventDefault();
        if (data.resume_files.length === 0) {
            toast.error('Mohon pilih file CV terlebih dahulu.');
            return;
        }
        if (!data.role_id) {
            toast.error('Mohon buat atau pilih Profil Analisis terlebih dahulu.');
            return;
        }
        postResume(route('resumes.store'), {
            preserveScroll: true,
            onSuccess: () => {
                const input = document.getElementById('resume_file') as HTMLInputElement;
                if (input) input.value = '';
            },
            onError: (formErrors) => {
                const firstError = Object.values(formErrors)[0];
                toast.error(firstError || 'Terjadi kesalahan saat mengupload.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6 md:gap-8">
                <div className="grid gap-6 md:grid-cols-3">
                    <StatCard title="Total Analisis" value={stats.total} />
                    <StatCard title="Analisis Baru (30 Hari)" value={stats.newThisMonth} />
                    <StatCard title="Rata-rata Skor Teknis" value={`${stats.averageScore.toFixed(2)}%`} />
                </div>

                <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
                    <div className="rounded-xl border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Mulai Analisis Cepat</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">1. Pilih Profil Analisis (Filter Aktif)</label>
                                <div className="flex items-center gap-2">
                                    <select
                                        id="role_id"
                                        value={selectedRoleId}
                                        onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                                        className="w-full rounded-md border-gray-300 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
                                        disabled={roles.length === 0}
                                    >
                                        {/* Opsi "Semua Profil" sudah dihapus dari sini */}
                                        {roles.length > 0 ? (
                                            roles.map((role) => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))
                                        ) : (
                                            <option>Buat profil terlebih dahulu</option>
                                        )}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setCreateRoleModalOpen(true)}
                                        className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                                    >
                                        <IconPlus size={20} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="resume_file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">2. Upload CV</label>
                                <input
                                    type="file"
                                    id="resume_file"
                                    accept=".pdf"
                                    multiple
                                    onChange={(e) => setData('resume_files', Array.from(e.target.files ?? []))}
                                    className="block w-full text-sm text-gray-800 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-white dark:file:bg-blue-900/40 dark:file:text-blue-300 dark:hover:file:bg-blue-900/60"
                                />
                                {errors.resume_files && <p className="text-sm text-red-500 mt-1">{errors.resume_files}</p>}
                                {errors.role_id && <p className="text-sm text-red-500 mt-1">{errors.role_id}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={processing || data.resume_files.length === 0 || !selectedRoleId}
                                className="w-full rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300"
                            >
                                {processing ? 'Memproses...' : 'Upload & Mulai Analisis'}
                            </button>
                        </form>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Aktivitas Terbaru</h2>
                        <div className="overflow-x-auto rounded-lg">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b dark:border-neutral-700">
                                    <th className="py-2 text-left font-medium">Nama File</th>
                                    <th className="py-2 text-left font-medium">Tanggal</th>
                                    <th className="py-2 text-left font-medium">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {recentAnalyses.map((analysis) => (
                                    <tr key={analysis.id} className="border-b dark:border-neutral-800">
                                        <td className="py-3 pr-4">
                                            <Link
                                                href={route('analyses.show', analysis.id)}
                                                className="text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                {analysis.resume.original_filename}
                                            </Link>
                                        </td>
                                        <td className="py-3 pr-4 whitespace-nowrap">
                                            {new Date(analysis.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'long', year: 'numeric',
                                            })}
                                        </td>
                                        <td className="py-3">
                                            <StatusBadge status={analysis.status} />
                                        </td>
                                    </tr>
                                ))}
                                {recentAnalyses.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-4 text-center text-gray-500 dark:text-gray-400">
                                            Belum ada aktivitas untuk profil ini.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <CreateRoleModal
                isOpen={isCreateRoleModalOpen}
                onClose={() => setCreateRoleModalOpen(false)}
            />
        </AppLayout>
    );
}
