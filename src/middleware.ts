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
        setAll: () => {
          /* no-op for now */
        },
      },
    }
  );

  const { data } = await supabase.auth.getSession();
  const session = data.session;

  const url = req.nextUrl.clone();

  // -------------------------
  // Unauthenticated user
  // -------------------------
  if (!session) {
    // Redirect to login if accessing protected routes
    if (!req.nextUrl.pathname.startsWith('/login')) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return res; // let login page load
  }

  // -------------------------
  // Authenticated user
  // -------------------------
  const userId = session.user?.id;

  // Check if user has an organization
  const { data: orgData } = await supabase
    .from('organizations')
    .select('id')
    .eq('created_by', userId)
    .limit(1).single();

  const hasOrganization = Boolean(orgData?.id);

  // Redirect users without org to org creation page
  if (!hasOrganization && !req.nextUrl.pathname.startsWith('/org/create')) {
    url.pathname = '/org/create';
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login page
  if (req.nextUrl.pathname.startsWith('/login')) {
    const dashboardPath = hasOrganization ? `/org/${orgData?.id}/dashboard` : '/org/create';
    url.pathname = dashboardPath;
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/org/:path*', '/login'], // protect these routes + login for redirect
};
