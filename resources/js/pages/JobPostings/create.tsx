import { Head, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CreateJobPostingPage() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('job-postings.store'));
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Buat Profil Analisis Baru', href: '#' },
            ]}
        >
            <Head title="Buat Profil Analisis" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-neutral-900 shadow-sm rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-1">Profil Analisis Baru</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            Simpan kualifikasi untuk posisi yang sering Anda analisis agar tidak perlu mengetik ulang.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="title">Nama Profil</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contoh: Frontend Developer (Vue.js)"
                                    className="mt-1"
                                />
                                {errors.title && <p className="mt-2 text-sm text-red-500">{errors.title}</p>}
                            </div>
                            <div>
                                <Label htmlFor="description">Deskripsi Kebutuhan & Kualifikasi</Label>
                                <Textarea
                                    id="description"
                                    rows={8}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Tempel kualifikasi atau deskripsi pekerjaan di sini..."
                                    className="mt-1"
                                />
                                {errors.description && <p className="mt-2 text-sm text-red-500">{errors.description}</p>}
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan Profil'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
