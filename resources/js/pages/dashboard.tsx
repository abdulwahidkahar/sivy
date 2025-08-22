import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps as InertiaPageProps } from '@/types';
import { toast } from 'sonner';
import { type FormEvent, useEffect, useState, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    IconCircleCheckFilled, 
    IconLoader, 
    IconCircleXFilled, 
    IconClock, 
    IconPlus, 
    IconX, 
    IconUpload,
    IconEye,
    IconTrendingUp,
    IconUsers,
    IconFileText,
    IconChevronDown,
    IconChevronUp,
    IconTrophy,
    IconExternalLink,
    IconArrowRight
} from '@tabler/icons-react';

// --- INTERFACE (TETAP SAMA) ---
interface Role {
    id: number;
    name: string;
}

interface Analysis {
    id: number;
    status: string;
    created_at: string;
    technical_score?: number;
    culture_score?: number;
    resume: {
        id: number;
        original_filename: string;
    };
    role?: {
        name: string;
    };
}

interface PageProps extends InertiaPageProps {
    recentAnalyses: Analysis[];
    stats: {
        total: number;
        newThisMonth: number;
        averageScore: number;
        topCandidates: number;
    };
    roles: Role[];
    topCandidates?: Analysis[]; // Tambahkan ? untuk optional
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


// --- CONSTANTS ---
const JOB_TEMPLATES = [
    {
        name: 'Software Engineer',
        skills: 'JavaScript, React, Node.js, Database'
    },
    {
        name: 'Data Scientist',
        skills: 'Python, Machine Learning, Statistics'
    },
    {
        name: 'Product Manager',
        skills: 'Strategy, Analytics, Communication'
    },
    {
        name: 'UI/UX Designer',
        skills: 'Figma, Design Thinking, Prototyping'
    }
];

export default function Dashboard() {
    const { recentAnalyses, stats, roles, topCandidates, filters, flash } = usePage<PageProps>().props;
    
    const [selectedRoleId, setSelectedRoleId] = useState<number | ''>(filters.role_id || '');
    const [isCreateRoleModalOpen, setCreateRoleModalOpen] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    
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

    // Perbaikan: Tambahkan fungsi handleFilesSelected
    const handleFilesSelected = useCallback((files: File[]) => {
        setData('resume_files', files);
        if (files.length > 0) {
            toast.success(`${files.length} file dipilih`);
        }
    }, [setData]);

    // Perbaikan: Hapus useEffect yang menggunakan variabel 'files' yang tidak ada
    // useEffect(() => {
    //     setData('resume_files', files);
    //     if (files.length > 0) {
    //         toast.success(`${files.length} file dipilih`);
    //     }
    // }, [setData]);

    // Perbaikan: Update handleTemplateSelect untuk menggunakan field yang benar
    const handleTemplateSelect = useCallback((template: typeof JOB_TEMPLATES[0]) => {
        // Buka modal dengan template data
        setCreateRoleModalOpen(true);
        // Anda bisa menambahkan logika untuk pre-fill modal dengan template data
        toast.info(`Template ${template.name} dipilih`);
    }, []);

    const handleQuickAnalysis = useCallback(() => {
        if (data.resume_files.length === 0) {
            toast.error('Pilih file CV terlebih dahulu');
            return;
        }
        if (!selectedRoleId) {
            toast.error('Pilih atau buat posisi terlebih dahulu');
            return;
        }
        
        postResume(route('resumes.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setData('resume_files', []);
                toast.success('Analisis dimulai! Anda akan menerima notifikasi saat selesai.');
            },
        });
    }, [data.resume_files, selectedRoleId, postResume, setData]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - SIVY" />
            
            <div className="flex flex-col gap-6 p-6 md:gap-8">

                {/* Stats Overview */}
                <StatsGrid stats={stats} />

                {/* Main Action Area */}
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    {/* Quick Analysis Section */}
                    <div className="space-y-6">
                        <div className="rounded-xl border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                Analisis Cepat
                            </h2>
                            
                            {/* Step 1: Upload */}
                            <div className="space-y-4">
                                <UploadZone 
                                    onFilesSelected={handleFilesSelected}
                                    isProcessing={processing}
                                />
                                
                                {data.resume_files.length > 0 && (
                                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                            File Terpilih ({data.resume_files.length}):
                                        </h4>
                                        <div className="space-y-1">
                                            {data.resume_files.map((file, index) => (
                                                <div key={index} className="text-sm text-blue-700 dark:text-blue-300">
                                                    • {file.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Step 2: Position Selection */}
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                                        Pilih Posisi
                                    </h3>
                                    <button
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        Template
                                        {showAdvanced ? <IconChevronUp className="h-4 w-4" /> : <IconChevronDown className="h-4 w-4" />}
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedRoleId}
                                        onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                                        disabled={roles.length === 0}
                                        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 shadow-sm 
                                                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                                                    dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200 
                                                    transition-all"
                                        >
                                        <option value="">Pilih posisi...</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setCreateRoleModalOpen(true)}
                                        className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                                        title="Buat posisi baru"
                                    >
                                        <IconPlus className="h-5 w-5" />
                                    </button>
                                </div>

                                {showAdvanced && (
                                    <div className="mt-4">
                                        <QuickTemplates onTemplateSelect={handleTemplateSelect} />
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleQuickAnalysis}
                                disabled={processing || data.resume_files.length === 0 || !selectedRoleId}
                                className="w-full mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <IconLoader className="h-5 w-5 animate-spin" />
                                        Memproses Analisis...
                                    </span>
                                ) : (
                                    `Analisis ${data.resume_files.length} CV`
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Top Candidates */}
                    <TopCandidatesCard candidates={topCandidates} />
                </div>

                {/* Recent Activity */}
                <div className="rounded-xl border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Aktivitas Terbaru
                        </h3>
                        <Link 
                            href={route('candidates.index')}
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                            Lihat Semua
                        </Link>
                    </div>
                    
                    {recentAnalyses.length === 0 ? (
                        <div className="text-center py-8">
                            <IconFileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Belum ada analisis yang dilakukan</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentAnalyses.slice(0, 5).map((analysis) => (
                                <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                                            {analysis.resume.original_filename}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {analysis.role?.name || 'Unknown Role'} • {new Date(analysis.created_at).toLocaleDateString('id-ID')}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={analysis.status} />
                                        {analysis.status === 'completed' && (
                                            <Link
                                                href={route('analyses.show', analysis.id)}
                                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                <IconEye className="h-4 w-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Role Modal */}
            <CreateRoleModal 
                isOpen={isCreateRoleModalOpen} 
                onClose={() => setCreateRoleModalOpen(false)} 
            />
        </AppLayout>
    );
}

// Quick Template Selector
function QuickTemplates({ onTemplateSelect }: { onTemplateSelect: (template: typeof JOB_TEMPLATES[0]) => void }) {
    return (
        <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Template Cepat:</h4>
            <div className="grid grid-cols-2 gap-2">
                {JOB_TEMPLATES.map((template, index) => (
                    <button
                        key={index}
                        onClick={() => onTemplateSelect(template)}
                        className="p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 dark:border-neutral-700 transition-colors"
                    >
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{template.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{template.skills}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// Top Candidates Card dengan default value
interface TopCandidate {
    id: number;
    candidate_name: string;
    role_name: string;
    technical_score: number;
    culture_score: number;
    total_score: number;
    status: string;
    analyzed_at: string;
    resume_file?: string;
}

interface PageProps {
    recentAnalyses: Analysis[];
    topCandidates: TopCandidate[];
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
        error?: string;
    };
}

function TopCandidatesCard({ candidates }: { candidates: TopCandidate[] }) {
    if (!candidates || candidates.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconTrophy className="h-5 w-5 text-yellow-500" />
                        Kandidat Terbaik
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <IconTrophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Belum ada kandidat yang dianalisis</p>
                        <p className="text-sm">Upload CV dan mulai analisis untuk melihat kandidat terbaik</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'new': { label: 'Baru', className: 'bg-blue-100 text-blue-800' },
            'reviewed': { label: 'Direview', className: 'bg-yellow-100 text-yellow-800' },
            'shortlisted': { label: 'Shortlist', className: 'bg-green-100 text-green-800' },
            'rejected': { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
                {config.label}
            </span>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <IconTrophy className="h-5 w-5 text-yellow-500" />
                    Kandidat Terbaik
                </CardTitle>
                <CardDescription>
                    Top {candidates.length} kandidat berdasarkan skor analisis
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {candidates.map((candidate, index) => (
                        <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                        index === 1 ? 'bg-gray-100 text-gray-800' :
                                        index === 2 ? 'bg-orange-100 text-orange-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {index + 1}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 truncate">
                                        {candidate.candidate_name}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {candidate.role_name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Dianalisis {candidate.analyzed_at}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500">Technical:</span>
                                        <span className="font-medium">{candidate.technical_score}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500">Culture:</span>
                                        <span className="font-medium">{candidate.culture_score}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold">
                                        <span className="text-gray-500">Total:</span>
                                        <span className="text-blue-600">{candidate.total_score}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {getStatusBadge(candidate.status)}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(`/analyses/${candidate.id}`, '_blank')}
                                    >
                                        <IconExternalLink className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {candidates.length === 3 && ( // Ubah dari 5 menjadi 3
                    <div className="mt-4 text-center">
                        {/* <Button variant="outline" size="sm" onClick={() => window.open('/analyses', '_blank')}>
                            Lihat Semua Kandidat
                            <IconArrowRight className="h-3 w-3 ml-1" />
                        </Button> */}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Enhanced Stats Cards
function StatsGrid({ stats }: { stats: PageProps['stats'] }) {
    const statItems = [
        {
            title: 'Total Analisis',
            value: stats.total,
            icon: IconFileText,
            color: 'text-blue-600 dark:text-blue-400'
        },
        {
            title: 'Bulan Ini',
            value: stats.newThisMonth,
            icon: IconTrendingUp,
            color: 'text-green-600 dark:text-green-400'
        },
        {
            title: 'Rata-rata Skor',
            value: `${stats.averageScore.toFixed(1)}%`,
            icon: IconUsers,
            color: 'text-purple-600 dark:text-purple-400'
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {statItems.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                    <div key={index} className="rounded-xl border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                                <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">{stat.value}</p>
                            </div>
                            <IconComponent className={`h-8 w-8 ${stat.color}`} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Enhanced Upload Zone Component
function UploadZone({ onFilesSelected, isProcessing }: { 
    onFilesSelected: (files: File[]) => void;
    isProcessing: boolean;
}) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
        if (files.length > 0) {
            onFilesSelected(files);
        } else {
            toast.error('Hanya file PDF yang diperbolehkan');
        }
    }, [onFilesSelected]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        onFilesSelected(files);
    }, [onFilesSelected]);

    return (
        <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
                ${isDragOver 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                    : 'border-gray-300 dark:border-neutral-600 hover:border-gray-400 dark:hover:border-neutral-500'
                }
                ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />
            <IconUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {isDragOver ? 'Lepaskan file di sini' : 'Upload CV Kandidat'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
                Drag & drop file PDF atau klik untuk memilih
            </p>
            <p className="text-sm text-gray-400">
                Mendukung multiple files • Format: PDF • Max: 10MB per file
            </p>
        </div>
    );
}
