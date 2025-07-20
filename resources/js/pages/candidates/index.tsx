import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type Candidate, columns } from "./columns";
import { DataTable } from "./data-table";

export default function CandidatesIndexPage({ candidates }: { candidates: Candidate[] }) {
    const breadcrumbs = [
        { title: 'Daftar Kandidat', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Kandidat" />
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="container mx-auto py-10">
                    <h1 className="text-2xl font-bold mb-4">Daftar Kandidat</h1>
                    <p className="text-gray-500 mb-6">
                        Berikut adalah semua kandidat yang telah dianalisis. Gunakan filter untuk menemukan yang terbaik.
                    </p>

                    {/* Tampilkan kembali DataTable dengan data asli */}
                    <DataTable columns={columns} data={candidates} />
                </div>
            </div>
        </AppLayout>
    );
}
