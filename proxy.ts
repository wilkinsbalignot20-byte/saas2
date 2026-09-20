 // proxy.ts (Nasa root ng kins/ folder mo, katabi ng package.json)
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function proxy(request: any) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 1. EARLY EXIT FOR STATIC & AUTH ROUTES (CRITICAL FIX FOR HANDSHAKE)
  // 🟢 SIGURADONG BYPASS: Ibalik agad ang NextResponse.next() nang walang binabagong headers o cookies
  // Ito ay upang makarating ang `code_verifier` cookie nang direkta sa iyong callback route.
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

  // 3. SECURE COOKIE SYNC ENGINE (PARA LAMANG SA MGA PROTECTED/NORMAL PAGES)
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
  await supabase.auth.getUser();

  // 4. BULLETPROOF SUBDOMAIN EXTRACTION ENGINE
  const hostname = request.headers.get('host') || '';
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000';
  
  let currentSlug = '';
  const cleanHost = hostname.split(':')[0]; 
  const cleanMain = mainDomain.split(':')[0]; 

  if (cleanHost.endsWith(`.${cleanMain}`)) {
    currentSlug = cleanHost.replace(`.${cleanMain}`, '');
  }

  // 5. CUSTOMER FRONTSTORE TRAFFIC REWRITE
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
  ],
};
