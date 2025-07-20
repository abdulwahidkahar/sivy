"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@inertiajs/react"

// Definisikan tipe data kandidat
export type Candidate = {
    id: number
    original_filename: string
    analysis_result: {
        nama_kandidat: string
        skor_kecocokan: number
    } | null
}

export const columns: ColumnDef<Candidate>[] = [
    {
        accessorKey: "analysis_result.nama_kandidat",
        header: "Nama Kandidat",
        cell: ({ row }) => {
            const name = row.original.analysis_result?.nama_kandidat || "Nama Tidak Ditemukan"
            return <div className="font-medium">{name}</div>
        },
    },
    {
        accessorKey: "analysis_result.skor_kecocokan",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Skor
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const score = row.original.analysis_result?.skor_kecocokan || 0
            // Tambahkan warna berdasarkan skor
            const scoreColor = score >= 90 ? 'text-green-500' : score >= 70 ? 'text-yellow-500' : 'text-red-500';
            return <div className={`text-center font-bold text-lg ${scoreColor}`}>{score}%</div>
        },
    },
    {
        accessorKey: "original_filename",
        header: "Nama File",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const candidate = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={route('resumes.show', candidate.id)}>Lihat Detail CV</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(candidate.analysis_result?.nama_kandidat || '')}
                        >
                            Salin Nama
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
