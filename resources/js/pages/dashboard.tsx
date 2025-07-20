import { Head, usePage, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import { type FormEvent, useState, useEffect } from 'react';

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

function SiriGlowLoader({ duration = 5000 }: { duration?: number }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timeout);
    }, [duration]);

    if (!visible) return null;

    return (
        <>
            <style>{styles}</style>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="relative w-[300px] h-[300px]">
                    <svg viewBox="0 0 1200 1200" className="absolute inset-0 w-full h-full animate-spin-slow">
                        <path
                            fill="url(#siriGradient)"
                            d="M 100 600 q 0 -500, 500 -500 t 500 500 t -500 500 T 100 600 z"
                            style={{
                                animation: 'blob-anim 6s infinite ease-in-out alternate',
                                filter: 'blur(60px)',
                                transformOrigin: 'center',
                            }}
                        />
                        <defs>
                            <linearGradient id="siriGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#74d9e1" />
                                <stop offset="50%" stopColor="#984ddf" />
                                <stop offset="100%" stopColor="#4344ad" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-6 rounded-full bg-black/80 backdrop-blur-xl border border-white/10" />
                </div>
            </div>
        </>
    );
}

const styles = `
@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes siri-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}
.animate-spin-slow {
  animation: spin-slow 6s linear infinite;
}
`;

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

    const { post: postAnalyze, processing: processingAnalyze } = useForm({});
    const [showSiri, setShowSiri] = useState(false);

    if (flash?.success) toast.success(flash.success);
    if (flash?.info) toast.info(flash.info);

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

    const handleAnalyze = () => {
        setShowSiri(true);
        setTimeout(() => setShowSiri(false), 5000);

        postAnalyze(route('resumes.analyzeBatch'), {
            preserveScroll: true,
            onError: () => {
                toast.error('Gagal memulai proses analisis.');
            }
        });
    };

    return (
        <>
            <style>{styles}</style>
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
                                    accept=".pdf,.doc,.docx"
                                    multiple
                                    onChange={(e) => setData('resume_files', Array.from(e.target.files ?? []))}
                                    className="block w-full text-sm text-gray-800 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-white dark:file:bg-blue-900/40 dark:file:text-blue-300 dark:hover:file:bg-blue-900/60"
                                />
                                {errors.resume_files && (
                                    <p className="text-sm text-red-500">{errors.resume_files}</p>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={processingResume || data.resume_files.length === 0}
                                        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {processingResume ? 'Mengupload...' : 'Upload'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAnalyze}
                                        disabled={processingAnalyze}
                                        className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {processingAnalyze ? 'Memproses...' : 'Analisis Sekarang'}
                                    </button>
                                </div>
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
                                            <td className="py-3 capitalize">{resume.status}</td>
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
            {showSiri && <SiriGlowLoader />}
        </>
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
