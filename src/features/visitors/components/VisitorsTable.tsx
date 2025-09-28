"use client";

import { Star } from 'lucide-react';
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

const columnHelper = createColumnHelper<
  Visitor & {
    cities: {
      name: string;
      state_name: string | null;
      country_name: string | null;
    } | null;
  }
>();

export default function VisitorsTable(props: Props) {
  const params = useParams();

  const columns = [
    columnHelper.accessor(
      (row) => {
        const name = row.name ?? "-";
        const email = row.email ?? "-";
        const people = row.people_count ?? "-";
        return `Nombre: ${name}\nCorreo: ${email}\nPersonas: ${people}`;
      },
      {
        id: "identity",
        header: "Visitante",
        cell: (info) => (
          <div className="whitespace-pre-line">{info.getValue()}</div>
        ),
      }
    ),
    columnHelper.accessor(
      (row) => {
        const city = row.cities?.name ?? "-";
        const state = row.cities?.state_name ?? "-";
        const country = row.cities?.country_name ?? "-";
        return `Ciudad: ${city}\nEstado: ${state}\nPaís: ${country}\n`;
      },
      {
        id: "location",
        header: "Ubicación",
        cell: (info) => (
          <div className="whitespace-pre-line">{info.getValue()}</div>
        ),
      }
    ),
    // Columna de Fechas
    columnHelper.accessor(
      (row) => {
        const visitDate = row.visit_date
          ? new Date(row.visit_date).toLocaleString("es-MX", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "-";
        const exitedAt = row.exited_at
          ? new Date(row.exited_at).toLocaleString("es-MX", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "-";

        return { visitDate, exitedAt };
      },
      {
        id: "timeline",
        header: "Fechas",
        cell: (info) => {
          const { visitDate, exitedAt } = info.getValue();
          return (
            <div className="whitespace-pre-line">
              <div>Visita: {visitDate}</div>
              <div>Salida: {exitedAt}</div>
            </div>
          );
        },
      }
    ),

    // Nueva columna de Feedback
    columnHelper.accessor((row) => row.exit_feedback && row.exit_feedback?.length > 30
            ? row.exit_feedback?.slice(0, 30) + "…"
            : row.exit_feedback ?? "-", {
      id: "feedback",
      header: "Feedback",
      cell: (info) => info.getValue(),
    }),

    // New column for exit rating
    columnHelper.accessor((row) => row.exit_rating ?? 0, {
      id: "rating",
      header: "Rating",
      cell: (info) => {
        const rating = info.getValue();

        if (!rating) return '-'

        return (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={16}
                className={i <= rating ? "text-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>
        );
      },
    }),

    // Duration column
    columnHelper.accessor(
      (row) => {
        if (!row.visit_date || !row.exited_at) return "-";
        const visit = new Date(row.visit_date);
        const exit = new Date(row.exited_at);
        const diffMs = exit.getTime() - visit.getTime();
        if (diffMs < 0) return "-";

        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;

        return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
      },
      {
        id: "duration",
        header: "Duración",
        cell: (info) => <div>{info.getValue()}</div>,
      }
    ),
    columnHelper.display({
      header: "Acciones",
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
        .select("*, cities(name, state_name, country_name)")
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
