"use client";

import { useParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
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

export type Member = Tables<'organization_memberships'> & {
  users: {
    name: string | null;
    email: string | null;
  } | null;
  roles: {
    name: string | null;
  } | null;
};

type Props = {
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  queryKeyGetter(): unknown[];
};

const columnHelper = createColumnHelper<Member>();

export default function MembersTable(props: Props) {
  const params = useParams();

  const columns = [
    columnHelper.accessor(row => row.users?.name ?? 'Desconocido', {
      id: 'name',
      header: 'Nombre',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor(row => row.users?.email ?? '-', {
      id: 'email',
      header: 'Correo',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor(row => row.roles?.name ?? '-', {
      id: 'role',
      header: 'Rol',
      cell: info => <Badge>{info.getValue()}</Badge>,
    }),
    columnHelper.accessor('status', {
      header: 'Estatus',
      cell: info => <Badge>{info.getValue()}</Badge>,
    }),
    columnHelper.accessor('created_at', {
      header: 'Fecha de ingreso',
      cell: info => {
        const createdAt = info.getValue();
        if (!createdAt) return '-';
        return new Date(createdAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    }),
    columnHelper.display({
      header: 'Acciones',
      cell: ({ row }) => {
        const member = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => props.onEdit(member)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => props.onDelete(member)}
              >
                Eliminar
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
      if (!organizationId) throw new Error('ID de organización no proporcionado.');

      let query = supabase
        .from('organization_memberships')
        .select('*, users(name, email), roles(name)')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .throwOnError();

      if (parameters?.searchInput) {
        query = query.ilike('name', `%${parameters.searchInput}%`);
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
                <TableCell colSpan={columns.length}>
                  <Skeleton className="h-4 w-[250px]" />
                </TableCell>
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-sm text-destructive"
              >
                Error al cargar los miembros.
              </TableCell>
            </TableRow>
          ) : data && data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-muted-foreground"
              >
                No se encontraron miembros.
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
