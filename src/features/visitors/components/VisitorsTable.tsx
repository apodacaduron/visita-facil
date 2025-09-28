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
        const city = row.cities.name ?? "-";
        const state = row.cities.state_name ?? "-";
        const country = row.cities.country_name ?? "-";
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
    columnHelper.accessor(
      (row) => {
        const exitRating = row.exit_rating ?? "-";
        const exitFeedbackFull = row.exit_feedback ?? "-";
        const exitFeedback =
          exitFeedbackFull.length > 30
            ? exitFeedbackFull.slice(0, 30) + "…"
            : exitFeedbackFull;

        return { exitRating, exitFeedback, exitFeedbackFull };
      },
      {
        id: "exit",
        header: "Salida / Feedback",
        cell: (info) => {
          const { exitRating, exitFeedback, exitFeedbackFull } =
            info.getValue();
          return (
            <div className="whitespace-pre-line">
              <div>Rating: {exitRating}</div>
              <div title={exitFeedbackFull}>Feedback: {exitFeedback}</div>
            </div>
          );
        },
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
