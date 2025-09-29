"use client";

import { ArrowLeft, Check, Inbox, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { useMutation, useQuery } from '@tanstack/react-query';

import { Tables } from '../../../../database.types';

export default function InvitationsPage() {
  const router = useRouter();
  const organizationsQuery = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const userId = session?.user?.id;

      if (!userId)
        throw new Error("User id not found, could not fetch organizations");

      return supabase
        .from("organizations")
        .select("*")
        .eq("created_by", userId)
    },
  });

  const invitationsQuery = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const userId = session?.user?.id;

      if (!userId)
        throw new Error("User id not found, could not fetch invitations");

      return supabase
        .from("organization_memberships")
        .select("*, organizations(name, description)")
        .eq("user_id", userId)
        .eq("status", "invited");
    },
  });

  const invitationMutation = useMutation({
    mutationFn: async ({
      member,
      answer,
    }: {
      member: Tables<"organization_memberships">;
      answer: boolean;
    }) => {
      return supabase
        .from("organization_memberships")
        .update({
          status: answer ? "active" : "declined",
        })
        .eq("id", member.id);
    },
    onSuccess: async (_, variables) => {
      if (variables.answer) {
        const orgId = variables.member.organization_id;
        router.push(`/org/${orgId}/dashboard`);
      }

      await invitationsQuery.refetch()
    },
  });

  // Loading state
  if (invitationsQuery.isLoading) {
    return (
      <div className="p-6 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const invitations = invitationsQuery.data?.data ?? [];

  // Empty state
  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <Inbox className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">No pending invitations</p>
        <p className="text-muted-foreground text-sm">
          You’ll see invitations here when someone adds you to their
          organization.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-2">Pending Invitations</h1>
      <p className="text-muted-foreground mb-6">
        Choose whether to accept or decline invitations to organizations.
      </p>

      <div className="grid gap-4 grid-cols-1 max-w-lg w-full">
        {invitations.map((member) => (
          <Card
            key={member.id}
            className="flex flex-col justify-between w-full gap-3"
          >
            <CardHeader className="flex flex-row items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {member.organizations?.name?.[0]?.toUpperCase() ?? "O"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{member.organizations?.name}</CardTitle>
                {member.organizations?.description && (
                  <CardDescription>
                    {member.organizations.description}
                  </CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex gap-2 mt-4">
              <Button
                className="flex-1"
                onClick={() =>
                  invitationMutation.mutate({ member, answer: true })
                }
              >
                <Check className="w-4 h-4 mr-2" /> Accept
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() =>
                  invitationMutation.mutate({ member, answer: false })
                }
              >
                <X className="w-4 h-4 mr-2" /> Reject
              </Button>
            </CardContent>
          </Card>
        ))}
        {organizationsQuery.data?.data?.length ? <Link href="/login">
          <Button className="flex-1" variant='outline'>
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al inicio
          </Button>
        </Link> : null}
      </div>
    </div>
  );
}
