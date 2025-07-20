import { Head, usePage, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import { type FormEvent, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { IconCircleCheckFilled, IconLoader, IconCircleXFilled, IconClock } from '@tabler/icons-react';

const StatusBadge = ({ status }: { status: string }) => {
    let icon;
    let textClass = '';
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
            <span className={textClass}>{text}</span>
        </Badge>
    );
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
];

interface Resume {
    id: number;
    original_filename: string;
    created_at: string;
    status: string;
}

interface PageProps {
    resumes: Resume[];
    stats: {
        total: number;
        newThisMonth: number;
        averageScore: number;
    };
    flash?: {
        success?: string;
        info?: string;
    };
}

export default function Dashboard() {
    const { resumes, stats, flash } = usePage<PageProps>().props;

    const {
        data,
        setData,
        post: postResume,
        processing: processingResume,
        errors,
        reset,
    } = useForm<{
        resume_files: File[];
    }>({
        resume_files: [],
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.info) toast.info(flash.info);
    }, [flash]);

    const handleUpload = (e: FormEvent) => {
        e.preventDefault();
        if (data.resume_files.length === 0) {
            toast.error('Mohon pilih file terlebih dahulu.');
            return;
        }

        postResume(route('resumes.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('resume_files');
                const input = document.getElementById('resume_file') as HTMLInputElement;
                if (input) input.value = '';
            },
            onError: (err) => {
                const errorMessages = Object.values(err).join(' ');
                toast.error(errorMessages || 'Terjadi kesalahan saat mengupload.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6 md:gap-8">
                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-3">
                    <StatCard title="Total CV Dianalisis" value={stats.total} />
                    <StatCard title="Kandidat Baru (30 Hari)" value={stats.newThisMonth} />
                    <StatCard title="Rata-rata Skor Kecocokan" value={`${stats.averageScore.toFixed(2)}%`} />
                </div>

                {/* Upload + Aktivitas */}
                <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
                    {/* Upload Form */}
                    <div className="rounded-xl border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Upload CV Baru</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <input
                                type="file"
                                id="resume_file"
                                accept=".pdf"
                                multiple
                                onChange={(e) => setData('resume_files', Array.from(e.target.files ?? []))}
                                className="block w-full text-sm text-gray-800 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-white dark:file:bg-blue-900/40 dark:file:text-blue-300 dark:hover:file:bg-blue-900/60"
                            />
                            {errors.resume_files && <p className="text-sm text-red-500">{errors.resume_files}</p>}
                            <button
                                type="submit"
                                disabled={processingResume || data.resume_files.length === 0}
                                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {processingResume ? 'Mengupload...' : 'Upload & Analisis'}
                            </button>
                        </form>
                    </div>

                    {/* Aktivitas Terbaru */}
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
                                {resumes.map((resume) => (
                                    <tr key={resume.id} className="border-b dark:border-neutral-800">
                                        <td className="py-3 pr-4">
                                            <Link
                                                href={route('resumes.show', resume.id)}
                                                className="text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                {resume.original_filename}
                                            </Link>
                                        </td>
                                        <td className="py-3 pr-4 whitespace-nowrap">
                                            {new Date(resume.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="py-3">
                                            {/* --- PENGGUNAAN KOMPONEN STATUS --- */}
                                            <StatusBadge status={resume.status} />
                                        </td>
                                    </tr>
                                ))}
                                {resumes.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-4 text-center text-gray-500 dark:text-gray-400">
                                            Belum ada aktivitas.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
    return (
        <div className="rounded-xl border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">{value}</p>
        </div>
    );
}
