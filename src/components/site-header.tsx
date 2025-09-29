"use client";

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { supabase } from '@/lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ThemeToggle } from './ThemeToggle';

type Props = {
  breadcrumbs: { href?: string; label: string }[];
  actions?: React.ReactNode;
};

export function SiteHeader(props: Props) {
  const params = useParams();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch pending invitations
  const { data: invitationsData } = useQuery({
    queryKey: ["pending-invitations"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return [];
      const { data } = await supabase
        .from("organization_memberships")
        .select("id, organizations(id, name, description)")
        .eq("user_id", userId)
        .eq("status", "invited");
      return data ?? [];
    },
  });

  const updateMembership = useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      const { data, error } = await supabase
        .from("organization_memberships")
        .update({ status: accept ? "active" : "declined" })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
      if (variables.accept) {
        router.replace(`/org/${data.organization_id}/dashboard`);
      }
    },
  });

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear sticky top-0 bg-background z-10 rounded-t-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <Link
            href={`/org/${params.organizationId?.toString()}/dashboard`}
            className="flex items-center gap-1 font-medium text-muted-foreground hover:underline hover:text-foreground"
          >
            Home
          </Link>
          {props.breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              /
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:underline text-muted-foreground hover:text-foreground font-medium"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {props.actions}

          {/* Invitations Dropdown */}
          {invitationsData?.length ? (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-muted-foreground/10">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                    {invitationsData.length}
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-96 p-3 space-y-2">
                <DropdownMenuItem disabled className="font-semibold text-lg">
                  Pending Invitations
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {invitationsData.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex flex-col gap-1 p-3 hover:bg-muted-foreground/10 rounded-md"
                  >
                    <span className="text-sm">
                      You have a pending invitation from the organization{" "}
                      <span className="font-medium">
                        {invite.organizations?.name}
                      </span>
                      .
                    </span>
                    {invite.organizations?.description && (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {invite.organizations.description}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Accepting will add you as a member and give you access to
                      their workspace. If you don’t want to join, you can reject
                      the invitation.
                    </span>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          updateMembership.mutate({
                            id: invite.id,
                            accept: true,
                          })
                        }
                        disabled={updateMembership.isPending}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          updateMembership.mutate({
                            id: invite.id,
                            accept: false,
                          })
                        }
                        disabled={updateMembership.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
