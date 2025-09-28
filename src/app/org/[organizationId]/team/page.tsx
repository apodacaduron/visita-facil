"use client";

import { FileOutput, PlusIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useState } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {
    DeleteMemberDialog, InviteMemberDialog, MembersTable
} from '@/features/organizations/components'; // asegúrate que existan
import { Member } from '@/features/organizations/components/MembersTable';

export default function TeamPage() {
  const params = useParams();
  const [searchInput, setSearchInput] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Member | null>(null);

  const queryKeyGetter = useCallback(() => {
    const organizationId = params.organizationId?.toString();
    return searchInput
      ? ["members", { searchInput, organizationId }]
      : ["members", { organizationId }];
  }, [searchInput, params.organizationId]);

  function openEditDialog(member: Member) {
    setCurrentItem(member);
    setInviteDialogOpen(true);
  }

  function openDeleteDialog(member: Member) {
    setCurrentItem(member);
    setDeleteDialogOpen(true);
  }

  function handleInviteDialogChange(open: boolean) {
    setInviteDialogOpen(open);
    if (!open) setCurrentItem(null);
  }

  function handleDeleteDialogChange(open: boolean) {
    setDeleteDialogOpen(open);
    if (!open) setCurrentItem(null);
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        {/* Encabezado */}
        <SiteHeader breadcrumbs={[{ label: "Equipo" }]} />
        <div className="flex flex-1 flex-col p-6 gap-4">
          {/* Título de la página */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-xl">Miembros del equipo</div>
              <div className="text-muted-foreground text-sm">
                Administra y visualiza a todos los miembros de la organización
              </div>
            </div>
            <Button disabled>
              <FileOutput className="size-4" />
              Exportar seleccionados
            </Button>
          </div>

          {/* Buscar + Invitar */}
          <div className="flex justify-between items-center gap-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar miembros..."
              className="max-w-64"
              type="search"
            />

            <InviteMemberDialog
              queryKeyGetter={queryKeyGetter}
              dialogProps={{
                open: inviteDialogOpen,
                onOpenChange: handleInviteDialogChange,
              }}
              onSuccess={() => {
                setInviteDialogOpen(false);
                setCurrentItem(null);
              }}
            />
            <Button onClick={() => setInviteDialogOpen(true)}>
              <PlusIcon className="size-4" />
              Invitar miembro
            </Button>
          </div>

          {/* Dialogo Eliminar */}
          <DeleteMemberDialog
            itemId={currentItem?.id}
            itemName={currentItem?.users?.email ?? currentItem?.id}
            queryKeyGetter={queryKeyGetter}
            dialogProps={{
              open: deleteDialogOpen,
              onOpenChange: handleDeleteDialogChange,
            }}
            onSuccess={() => {
              setDeleteDialogOpen(false);
              setCurrentItem(null);
            }}
          />

          {/* Tabla de miembros */}
          <MembersTable
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            queryKeyGetter={queryKeyGetter}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
