import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isProtectedRoute =
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/seller') ||
    pathname.startsWith('/dashboard')

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  if (user && !pathname.startsWith('/api')) {
    const { data: store } = await supabase
      .from('stores')
      .select('slug')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (store && (pathname === '/onboarding' || isAuthPage)) {
      return NextResponse.redirect(new URL(`/dashboard/${store.slug}`, request.url))
    }

    if (!store && (pathname.startsWith('/seller') || pathname.startsWith('/dashboard'))) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    if (pathname === '/forbidden') {
      return NextResponse.redirect(new URL('/forbidden', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
