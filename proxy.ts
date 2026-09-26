 import { createServerClient, type CookieOptions } from '@supabase/ssr' // I-import ang CookieOptions para sa strict typing
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // 1. Gumawa ng panimulang response (Hayaan lang dumaan ang request)
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. I-initialize ang Supabase gamit ang tamang TypeScript inference (Inayos mula sa Hakbang 2)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // Ginawa nang type-safe gamit ang opisyal na Supabase cookie shape structure
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          supabaseResponse = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Basahin lang ang user session para mag-refresh ang auth token
  await supabase.auth.getUser()

  // 4. Ibalik ang response nang walang harang o redirect
  return supabaseResponse
}

export const config = {
  // Inayos mula sa Hakbang 4: Pinalitan ang "\$" ng "$" para mawala ang lint warnings sa regex regex string extension
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
