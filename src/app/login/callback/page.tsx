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
      console.log("OAuth callback triggered");

      const { data, error } = await supabase.auth.getSession();
      console.log("Session data:", data);
      if (error) console.error("Error fetching session:", error);

      if (!data?.session) {
        console.log("No session found → redirect to /login");
        router.replace("/login");
        return;
      }

      const userId = data.session.user.id;
      console.log("Logged in user ID:", userId);

      // 1) Check active orgs
      const { data: activeMembership, error: activeError } = await supabase
        .from("organization_memberships")
        .select("organization_id")
        .eq("user_id", userId)
        .eq("status", "active")
        .limit(1)
        .single();

      console.log("Active membership:", activeMembership);
      if (activeError) console.error("Error fetching active membership:", activeError);

      if (activeMembership?.organization_id) {
        console.log("User has active org → redirect to dashboard");
        router.replace(`/org/${activeMembership.organization_id}/dashboard`);
        return;
      }

      // 2) Check invitations
      const { data: invites, error: inviteError } = await supabase
        .from("organization_memberships")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "invited")
        .limit(1)
        .single();

      console.log("Pending invites:", invites);
      if (inviteError) console.error("Error fetching invites:", inviteError);

      if (invites?.id) {
        console.log("User has invites → redirect to /org/invitations");
        router.replace("/org/invitations");
        return;
      }

      // 3) Default → create org
      console.log("No orgs or invites → redirect to /org/create");
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
