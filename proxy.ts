 // proxy.ts (Nasa root ng kins/ folder mo, katabi ng package.json)
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function proxy(request: any) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 1. EARLY EXIT FOR STATIC & AUTH ROUTES (CRITICAL FIX FOR HANDSHAKE)
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.startsWith('/api/auth') || 
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. INITIALIZE BASE RESPONSE FOR OTHER PAGES
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // 3. SECURE COOKIE SYNC ENGINE
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            cookiesToSet.forEach(({ name, value, options }) => 
              response.cookies.set(name, value, options)
            );
          } catch (error) {
            // Sinasalo ang anomang storage edge cases
          }
        },
      },
    }
  );

  // Ligtas na i-refresh ang session para sa normal pages
  const { data: { user } } = await supabase.auth.getUser();

  // 🛡️ 4. SELLER DASHBOARD SECURITY GATEKEEPER
  if (pathname.startsWith('/seller/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/seller/login', request.url));
    }

    const segments = pathname.split('/').filter(Boolean);
    const targetSlug = segments[2]; 

    if (targetSlug) {
      const { data: storeCheck } = await supabase
        .from('stores')
        .select('slug')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!storeCheck) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      // 🟢 TIYAK NA PROTECTION PATCH: Linisin ang string input bago i-compare sa database variable data
      const urlCleanedSlug = targetSlug.toLowerCase().trim().split(':')[0]; // Sinasala kung may sumasabit na colon parameter
      const dbCleanedSlug = storeCheck.slug.toLowerCase().trim().split(':')[0];

      if (dbCleanedSlug !== urlCleanedSlug) {
        return NextResponse.redirect(new URL(`/seller/dashboard/${storeCheck.slug}`, request.url));
      }
    }
  }

  // 🛡️ 5. ONBOARDING DOUBLE-ENTRY PROTECTION
  if (pathname === '/onboarding') {
    if (!user) {
      return NextResponse.redirect(new URL('/seller/login', request.url));
    }

    const { data: existingStore } = await supabase
      .from('stores')
      .select('slug')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (existingStore) {
      return NextResponse.redirect(new URL(`/seller/dashboard/${existingStore.slug}`, request.url));
    }
  }

  // 6. BULLETPROOF SUBDOMAIN EXTRACTION ENGINE
  const hostname = request.headers.get('host') || '';
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000';
  
  let currentSlug = '';
  const cleanHost = hostname.split(':')[0]; 
  const cleanMain = mainDomain.split(':')[0]; 

  if (cleanHost.endsWith(`.${cleanMain}`)) {
    currentSlug = cleanHost.replace(`.${cleanMain}`, '');
  }

  // 7. CUSTOMER FRONTSTORE TRAFFIC REWRITE
  if (currentSlug && !['www', 'admin', 'seller'].includes(currentSlug)) {
    url.pathname = `/store/${currentSlug}${pathname}`;
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-Tenant-Slug', currentSlug);

    const rewriteResponse = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      }
    });

    response.cookies.getAll().forEach((cookie: any) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value);
    });

    return rewriteResponse;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)\$).*)',
    '/onboarding',
    '/seller/dashboard/:path*'
  ],
};
