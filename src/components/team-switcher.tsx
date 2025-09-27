"use client";

import { Building, ChevronsUpDown, Plus } from 'lucide-react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuShortcut, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar
} from '@/components/ui/sidebar';
import CreateOrganizationDialog from '@/features/organizations/components/CreateOrganizationDialog';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

import { Tables } from '../../database.types';

const STORAGE_KEY = "activeTeamId";

export function TeamSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const { isMobile } = useSidebar();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [activeTeam, setActiveTeam] = React.useState<Tables<'organizations'> | null>(null);

  const organizationsQuery = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user.id) throw new Error("User id not provided");
      return supabase
        .from("organizations")
        .select()
        .eq("created_by", data.session?.user.id)
        .throwOnError();
    },
  });

  // Restore active team from URL param or localStorage
  React.useEffect(() => {
    if (organizationsQuery.data?.data?.length) {
      const orgs = organizationsQuery.data.data;

      // Try to resolve from current URL first
      let team = orgs.find((org) => org.id === params.organizationId) ?? null;

      // If no team in URL, try localStorage
      if (!team) {
        const storedId = localStorage.getItem(STORAGE_KEY);
        if (storedId) {
          team = orgs.find((org) => org.id === storedId) ?? null;
        }
      }

      setActiveTeam(team);
    } else {
      setActiveTeam(null);
    }
  }, [organizationsQuery.data, params.organizationId]);

  function selectTeam(team: Tables<'organizations'>) {
    // Swap out the org ID in the path
    const segments = pathname.split("/");
    segments[2] = team.id; // "/org/{id}/..."
    const newPath = segments.join("/");

    // Preserve query string if present
    const query = searchParams.toString();
    const href = query ? `${newPath}?${query}` : newPath;

    setActiveTeam(team);
    localStorage.setItem(STORAGE_KEY, team.id); // persist selection
    router.push(href);
  }

  const loading = organizationsQuery.isLoading;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {loading ? (
                    <div className="h-6 w-32 bg-gray-300 rounded animate-pulse" />
                  ) : (
                    <div className="flex gap-2">
                      <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <Building className="size-4" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {activeTeam?.name}
                        </span>
                        <span className="truncate text-xs">
                          Admin dashboard
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Teams
              </DropdownMenuLabel>

              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-full bg-gray-300 rounded my-1 animate-pulse"
                    />
                  ))
                : organizationsQuery.data?.data?.map((team, index) => (
                    <DropdownMenuItem
                      key={team.id}
                      onClick={() => selectTeam(team)}
                      className="gap-2 p-2"
                    >
                      {team.name}
                      <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setCreateDialogOpen(!createDialogOpen)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Add team
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateOrganizationDialog
        dialogProps={{
          open: createDialogOpen,
          onOpenChange: (open) => {
            if (!open) setCreateDialogOpen(false);
          },
        }}
      />
    </>
  );
}
