import { NextResponse } from 'next/server';

import { createServerClient } from '@supabase/ssr';

import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: () => { /* no-op for now */ },
      },
    }
  );

  const { data } = await supabase.auth.getSession();
  const session = data.session;

  const url = req.nextUrl.clone();

  // -------------------------
  // Unauthenticated
  // -------------------------
  if (!session) {
    if (!req.nextUrl.pathname.startsWith('/login')) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return res;
  }

  const userId = session.user.id;

  // -------------------------
  // Check memberships
  // -------------------------

  // 1) Active orgs
  const { data: activeMembership } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (activeMembership?.organization_id) {
    if (req.nextUrl.pathname.startsWith('/login')) {
      url.pathname = `/org/${activeMembership.organization_id}/dashboard`;
      return NextResponse.redirect(url);
    }
    return res;
  }

  // 2) Invitations
  const { data: invitedMembership } = await supabase
    .from('organization_memberships')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'invited')
    .limit(1)
    .single();

  if (invitedMembership?.id) {
    if (!req.nextUrl.pathname.startsWith('/org/invitations')) {
      url.pathname = '/org/invitations';
      return NextResponse.redirect(url);
    }
    return res;
  }

  // 3) Default → create org
  if (!req.nextUrl.pathname.startsWith('/org/create')) {
    url.pathname = '/org/create';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/org/:path*', '/login'], // protect org + login
};
