import { ChevronsUpDown, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

export function TeamSwitcher() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [activeTeam, setActiveTeam] = React.useState<any>(null);

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

  // Update active team when data loads
  React.useEffect(() => {
    if (organizationsQuery.data?.data?.length) {
      setActiveTeam(organizationsQuery.data.data[0]);
    } else {
      setActiveTeam(null);
    }
  }, [organizationsQuery.data]);

  function selectTeam(team: any) {
    setActiveTeam(team);
    router.push(`/org/${team.id}/dashboard`);
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
                    <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
                  ) : (
                    <span className="truncate font-medium">
                      {activeTeam?.name}
                    </span>
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
