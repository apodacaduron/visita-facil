"use client";

import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { IconDotsVertical } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
    createColumnHelper, flexRender, getCoreRowModel, useReactTable
} from '@tanstack/react-table';

import { Tables } from '../../../../database.types';

export type Visitor = Tables<"visitors">;

type Props = {
  onEdit: (visitor: Visitor) => void;
  onDelete: (visitor: Visitor) => void;
  queryKeyGetter(): unknown[];
};

const columnHelper = createColumnHelper<Visitor>();

export default function VisitorsTable(props: Props) {
  const params = useParams();

  const columns = [
    columnHelper.accessor("name", {
      header: "Nombre",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Correo",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("people_count", {
      header: "Personas",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("city", {
      header: "Ciudad",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("visit_date", {
      header: "Fecha de visita",
      cell: (info) =>
        new Date(info.getValue()).toLocaleDateString("es-MX", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }),
    }),
    columnHelper.accessor("created_at", {
      header: "Creado el",
      cell: (info) => {
        const createdAt = info.getValue();
        if (!createdAt) return '-';

        return new Date(createdAt).toLocaleDateString("es-MX", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        });
      },
    }),
    columnHelper.display({
      header: "Actions",
      cell: ({ row }) => {
        const visitor = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => props.onEdit(visitor)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => props.onDelete(visitor)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  const { data, isLoading, isError } = useQuery({
    queryKey: props.queryKeyGetter(),
    queryFn: async ({ queryKey }) => {
      const [, parameters] = queryKey as [string, { searchInput: string }];
      const organizationId = params.organizationId?.toString();
      if (!organizationId)
        throw new Error(
          "Organization id not provided, could not fetch visitors"
        );

      const query = supabase
        .from("visitors")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("organization_id", organizationId)
        .throwOnError();

      if (parameters?.searchInput) {
        query.ilike("search", `%${parameters.searchInput}%`);
      }

      const { data } = await query;
      return data ?? [];
    },
    throwOnError: true,
  });

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted sticky top-0 z-10">
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
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={3}>
                  <Skeleton className="h-4 w-[250px]" />
                </TableCell>
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-sm text-destructive"
              >
                Failed to load visitors.
              </TableCell>
            </TableRow>
          ) : data && data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground"
              >
                No visitors found.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
