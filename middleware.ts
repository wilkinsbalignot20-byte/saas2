 import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Gumawa ng panimulang response (Hayaan lang dumaan ang request)
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. I-initialize ang Supabase gamit ang SAPILITANG getAll at setAll na simple lang
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // Gumamit ng 'any[]' para walang pulang linya sa TypeScript mo
        setAll(cookiesToSet: any[]) {
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)\$).*)',
  ],
}
