 import { createServerClient, type CookieOptions } from '@supabase/ssr' // Idinagdag ang CookieOptions
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // Binalot sa isang solong object para mag-match sa Next.js 16 specs
              cookieStore.set({ name, value, ...options })
            )
          } catch {
            // Ang 'setAll' ay pwedeng matawag mula sa isang Server Component. Safe i-ignore.
          }
        },
      },
    }
  )
}
