"use client";

import { File, LayoutDashboard, Settings, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthProvider';
import { IconInnerShadowTop } from '@tabler/icons-react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams();
  const authCtx = useAuth();

  const data = {
  navMain: [
    {
      title: "Dashboard",
      url: `/org/${params.organizationId}/dashboard`,
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Visitantes",
      url: `/org/${params.organizationId}/visitors`,
      icon: Users,
    },
    {
      title: "Exportar Datos",
      url: `/org/${params.organizationId}/reports`,
      icon: File,
    },
    {
      title: "Configuración",
      url: `/org/${params.organizationId}/settings`,
      icon: Settings,
    },
  ],
};

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Visita Fácil
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ email: authCtx.session?.user?.email }} />
      </SidebarFooter>
    </Sidebar>
  );
}
