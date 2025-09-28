"use client";

import { useParams } from 'next/navigation';
import { useCallback } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import DataTable from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function Page() {
  const params = useParams();
  const queryKeyGetter = useCallback(() => {
    const organizationId = params.organizationId?.toString();

    return ["visitors", { organizationId }];
  }, []);

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
        <SiteHeader breadcrumbs={[]} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-xl">
                          Visitantes Recientes
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Revisa y administra los registros de visitantes
                        </div>
                      </div>
                    </div>

                    {/* Visitors table */}
                    <DataTable queryKeyGetter={queryKeyGetter} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
