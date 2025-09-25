"use client";

import { File, LayoutDashboard, Settings, Users } from 'lucide-react';
import { useParams } from 'next/navigation';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthProvider';

import { TeamSwitcher } from './team-switcher';

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
        <TeamSwitcher />
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
