"use client"

import * as React from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type FilterFn,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

// Custom filter untuk nilai numerik
const filterGreaterThan: FilterFn<any> = (row, columnId, value) => {
    const rowValue = row.getValue(columnId) as number | undefined
    if (typeof rowValue !== "number") return false
    return rowValue >= value
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,
        filterFns: {
            filterGreaterThan,
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    })

    const nameColumn = table.getColumn("nama")
    const scoreColumn = table.getColumn("skor")

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4 py-4">
                <Input
                    placeholder="Cari nama kandidat..."
                    value={(nameColumn?.getFilterValue() as string) ?? ""}
                    onChange={(e) => nameColumn?.setFilterValue(e.target.value)}
                    className="max-w-sm"
                />

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="top-scores"
                        checked={!!scoreColumn?.getFilterValue()}
                        onCheckedChange={(value) => {
                            scoreColumn?.setFilterValue(value ? 90 : undefined)
                        }}
                    />
                    <label
                        htmlFor="top-scores"
                        className="text-sm font-medium leading-none"
                    >
                        Tampilkan hanya skor 90+
                    </label>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Tidak ada hasil.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Sebelumnya
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Selanjutnya
                </Button>
            </div>
        </div>
    )
}
