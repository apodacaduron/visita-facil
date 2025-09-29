"use client";

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handle = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/login");
        return;
      }

      const userId = data.session.user.id;

      // 1) Active orgs
      const { data: activeMembership } = await supabase
        .from("organization_memberships")
        .select("organization_id")
        .eq("user_id", userId)
        .eq("status", "active")
        .limit(1)
        .single();

      if (activeMembership?.organization_id) {
        router.replace(`/org/${activeMembership.organization_id}/dashboard`);
        return;
      }

      // 2) Invites
      const { data: invites } = await supabase
        .from("organization_memberships")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "invited")
        .limit(1)
        .single();

      if (invites?.id) {
        router.replace("/org/invitations");
        return;
      }

      // 3) Default → create org
      router.replace("/org/create");
    };

    handle();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-fadeIn">
        <CardHeader className="text-center">
          <CardTitle>Logging in…</CardTitle>
          <CardDescription>Please wait while we redirect you.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}
