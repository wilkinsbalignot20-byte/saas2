 // proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
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
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Ligtas na kunin ang kasalukuyang active user profile session node
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // 2. 🔐 ROUTING GUARDS: Harangan ang mga hindi naka-login sa mga pribadong lugar
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isProtectedRoute = pathname.startsWith('/onboarding') || pathname.startsWith('/seller') || pathname.startsWith('/dashboard')

  if (!user && isProtectedRoute) {
    // Kung walang active user session at pilit pinapasok ang onboarding/dashboard, ibalik sa login page
    return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
  }

  // 3. 🛡️ STORE REGISTRATION CHECKER: Bantayan kung tapos na ba mag-onboard ang merchant
  if (user && !pathname.startsWith('/api')) {
    // Suriin sa database kung may nakarehistro nang tindahan ang user id na ito
    const { data: store } = await supabase
      .from('stores')
      .select('slug')
      .eq('owner_id', user.id)
      .maybeSingle()

    // Case A: May account na at may tindahan na, pero sinusubukang bumalik sa /onboarding o login
    if (store && (pathname === '/onboarding' || isAuthPage)) {
      return NextResponse.redirect(new URL(`/dashboard/${store.slug}`, request.url))
    }

    // Case B: Naka-login na ngunit WALA PANG TINDAHAN, at sinusubukang pumunta sa dashboard o portal
    if (!store && (pathname.startsWith('/seller') || pathname.startsWith('/dashboard'))) {
      // Pilitin silang dumaan muna sa onboarding form profile cluster map layout natin
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)\$).*)',
  ],
}
