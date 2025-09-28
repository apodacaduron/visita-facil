// app/login/callback/page.tsx
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

      if (data.session) {
        const { data: orgData } = await supabase
          .from("organizations")
          .select("id")
          .eq("created_by", data.session.user.id)
          .limit(1)
          .single();

        const dashboardPath = orgData?.id
          ? `/org/${orgData.id}/dashboard`
          : "/org/create";

        router.replace(dashboardPath);
      } else {
        router.replace("/login");
      }
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
