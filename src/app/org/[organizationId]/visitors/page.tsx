"use client";

import { FileOutput, PlusIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useState } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DeleteVisitorDialog, VisitorDialog, VisitorsTable } from '@/features/visitors'; // adjust path as needed
import { Visitor } from '@/features/visitors/components/VisitorsTable';

export default function Page() {
  const params = useParams();
  const [searchInput, setSearchInput] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Visitor | null>(null);

  const queryKeyGetter = useCallback(() => {
    const organizationId = params.organizationId?.toString();

    return searchInput ? ["visitors", { searchInput, organizationId }] : ["visitors", { organizationId }];
  }, [searchInput]);

  function openEditDialog(visitor: Visitor) {
    setCurrentItem(visitor);
    setFormDialogOpen(true);
  }

  function openDeleteDialog(visitor: Visitor) {
    setCurrentItem(visitor);
    setDeleteDialogOpen(true);
  }

  function handleFormDialogChange(open: boolean) {
    setFormDialogOpen(open);

    if (!open) setCurrentItem(null);
  }

  function handleDeleteDialogChange(open: boolean) {
    setDeleteDialogOpen(open);

    if (!open) setCurrentItem(null);
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          breadcrumbs={[
            {
              label: "Visitors",
            },
          ]}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div><div className='font-medium text-xl'>Visitors</div><div className='text-muted-foreground text-sm'>Manage and view all visitor registrations</div></div>
                <Button disabled>
                  <FileOutput className="size-4" />
                  Export selected
                </Button>
              </div>
              <div className="flex justify-between">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search..."
                  className="max-w-64"
                  type="search"
                />

                {/* Create and edit dialog */}
                <VisitorDialog
                  onSuccess={() => {
                    setFormDialogOpen(false);
                    setCurrentItem(null);
                  }}
                  item={currentItem}
                  queryKeyGetter={queryKeyGetter}
                  dialogProps={{
                    open: formDialogOpen,
                    onOpenChange: handleFormDialogChange,
                  }}
                />
                <Button onClick={() => setFormDialogOpen(true)}>
                  <PlusIcon className="size-4" />
                  Create
                </Button>
              </div>

              <DeleteVisitorDialog
                onSuccess={() => {
                  setDeleteDialogOpen(false);
                  setCurrentItem(null);
                }}
                queryKeyGetter={queryKeyGetter}
                itemId={currentItem?.id}
                itemName={currentItem?.name}
                dialogProps={{
                  open: deleteDialogOpen,
                  onOpenChange: handleDeleteDialogChange,
                }}
              />

              {/* Visitors table */}
              <VisitorsTable
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                queryKeyGetter={queryKeyGetter}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
