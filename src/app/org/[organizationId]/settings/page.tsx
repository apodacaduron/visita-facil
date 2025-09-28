"use client";

import { Settings, Trash2 } from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function Page() {
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
              label: "Configuración",
            },
          ]}
        />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6">
            {/* Título de la página */}
            <div>
              <h1 className="text-xl font-semibold">Configuración</h1>
              <p className="text-sm text-muted-foreground">
                Configura tu sistema de registro de visitantes
              </p>
            </div>

            {/* Configuración general */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Configuración General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Nombre de la Organización</p>
                    <p className="text-sm text-muted-foreground">
                      Museo de Historia Natural
                    </p>
                  </div>
                </div>
                <div className="flex justify-end border-t pt-4">
                  <Button>Guardar Configuración</Button>
                </div>
              </CardContent>
            </Card>

            {/* Zona de peligro */}
            <Card>
              <CardHeader>
                <CardTitle>Zona de Peligro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Eliminar Organización
                    </p>
                    <p className="text-sm text-red-500">
                      Elimina permanentemente tu organización y todos los datos asociados
                    </p>
                  </div>
                  <Button variant="destructive" className="mt-2 sm:mt-0">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Organización
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
