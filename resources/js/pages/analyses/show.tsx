import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem, type PageProps as InertiaPageProps } from '@/types';
import { IconCircleCheck, IconCircleX, IconChevronLeft } from '@tabler/icons-react';

interface Skill {
    id: number;
    name: string;
}

interface Analysis {
    id: number;
    technical_score: number | null;
    culture_score: number | null;
    summary: string | null;
    justification: {
        positive_points?: string[];
        negative_points?: string[];
    } | null;
    resume: {
        original_filename: string;
    };
    role: {
        name: string;
    };
    skills: Skill[];
}

interface PageProps extends InertiaPageProps {
    analysis: Analysis;
}

function ScoreCard({ title, score }: { title: string; score: number | null }) {
    const scoreColor = score && score >= 75 ? 'text-green-500' : score && score >= 50 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="bg-white dark:bg-neutral-900 shadow-md rounded-lg p-6 flex flex-col items-center justify-center text-center border dark:border-neutral-700">
            <h2 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">{title}</h2>
            <p className={`text-6xl font-bold ${scoreColor}`}>
                {score ?? 0}<span className="text-3xl">%</span>
            </p>
        </div>
    );
}

export default function AnalysisShowPage({ analysis }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Kandidat', href: route('analyses.index') },
        { title: 'Detail Analisis', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Analisis: ${analysis.resume.original_filename}`} />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <Link
                            href={route('analyses.index')}
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            <IconChevronLeft size={16} />
                            Kembali ke Daftar Kandidat
                        </Link>
                    </div>

                    {/* Header Halaman */}
                    <div className="bg-white dark:bg-neutral-900 shadow-md rounded-lg p-6 mb-6 border dark:border-neutral-700">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            {analysis.resume.original_filename}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Hasil analisis untuk profil: <span className="font-medium">{analysis.role.name}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Kolom Kiri - Detail Analisis */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Ringkasan */}
                            <div className="bg-white dark:bg-neutral-900 shadow-md rounded-lg p-6 border dark:border-neutral-700">
                                <h2 className="font-semibold text-lg border-b pb-2 mb-4 dark:border-neutral-700">Ringkasan AI</h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {analysis.summary || 'Tidak ada ringkasan.'}
                                </p>
                            </div>

                            {/* Justifikasi Skor */}
                            <div className="bg-white dark:bg-neutral-900 shadow-md rounded-lg p-6 border dark:border-neutral-700">
                                <h2 className="font-semibold text-lg border-b pb-2 mb-4 dark:border-neutral-700">Justifikasi Skor</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-medium text-green-600 dark:text-green-400 mb-2">Poin Plus</h3>
                                        <ul className="space-y-2">
                                            {analysis.justification?.positive_points?.length ? (
                                                analysis.justification.positive_points.map((point, i) => (
                                                    <li key={i} className="flex items-start">
                                                        <IconCircleCheck className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                                                        <span className="text-sm text-gray-600 dark:text-gray-300">{point}</span>
                                                    </li>
                                                ))
                                            ) : <li className="text-sm text-gray-500">Tidak ada data.</li>}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">Poin Minus</h3>
                                        <ul className="space-y-2">
                                            {analysis.justification?.negative_points?.length ? (
                                                analysis.justification.negative_points.map((point, i) => (
                                                    <li key={i} className="flex items-start">
                                                        <IconCircleX className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                                                        <span className="text-sm text-gray-600 dark:text-gray-300">{point}</span>
                                                    </li>
                                                ))
                                            ) : <li className="text-sm text-gray-500">Tidak ada data.</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Keahlian */}
                            <div className="bg-white dark:bg-neutral-900 shadow-md rounded-lg p-6 border dark:border-neutral-700">
                                <h2 className="font-semibold text-lg border-b pb-2 mb-4 dark:border-neutral-700">Keahlian (Skills)</h2>
                                {analysis.skills?.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.skills.map((skill) => (
                                            <span key={skill.id} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900/40 dark:text-blue-300">
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500">Tidak ada data skill.</p>}
                            </div>
                        </div>

                        {/* Kolom Kanan - Skor */}
                        <div className="space-y-6 sticky top-24 h-fit">
                            <ScoreCard title="Skor Teknis" score={analysis.technical_score} />
                            <ScoreCard title="Skor Budaya" score={analysis.culture_score} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
