import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface AnalysisResult {
    nama_kandidat: string;
    skor_kecocokan: number;
    ringkasan: string;
    skills: string[];
}

interface Resume {
    id: number;
    original_filename: string;
    created_at: string;
    status: string;
    analysis_result: AnalysisResult | null;
}

export default function Show({ resume }: { resume: Resume }) {
    const analysis = resume.analysis_result;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Detail CV', href: '#' },
            ]}
        >
            <Head title={`Detail CV - ${resume.original_filename}`} />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-neutral-900 shadow-sm rounded-lg p-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            {analysis?.nama_kandidat || 'Nama Tidak Ditemukan'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {resume.original_filename}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-neutral-900 shadow-sm rounded-lg p-6">
                                <h2 className="font-semibold text-lg border-b pb-2 mb-4 dark:border-neutral-700">
                                    Ringkasan Analisis
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {analysis?.ringkasan || 'Tidak ada ringkasan.'}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-neutral-900 shadow-sm rounded-lg p-6">
                                <h2 className="font-semibold text-lg border-b pb-2 mb-4 dark:border-neutral-700">
                                    Keahlian (Skills)
                                </h2>
                                {analysis?.skills?.length ? (
                                    <ul className="flex flex-wrap gap-2">
                                        {analysis.skills.map((skill, index) => (
                                            <li
                                                key={index}
                                                className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900/40 dark:text-blue-300"
                                            >
                                                {skill}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">Tidak ada data skill.</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 shadow-sm rounded-lg p-6 flex flex-col items-center justify-center text-center">
                            <h2 className="font-semibold text-lg mb-2">
                                Skor Kecocokan
                            </h2>
                            <p className="text-6xl font-bold text-green-500">
                                {analysis?.skor_kecocokan ?? 0}
                                <span className="text-3xl">%</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                vs. Posisi Software Engineer
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
