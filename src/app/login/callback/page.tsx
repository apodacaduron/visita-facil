// app/login/callback/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handle = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Determine org id
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

  return <div className="p-4 text-center">Logging in…</div>;
}
