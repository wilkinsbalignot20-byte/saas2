 // src/lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServer() {
  const cookieStore = await cookies() // Next.js Asynchronous Cookies Resolving

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // 🟢 INAYOS: Nilagyan ng explicit structural array type ({ name: string; value: string; options?: any }[]) 
        // upang mawala ang pulang guhit at maging 100% safe sa strict mode ng TypeScript!
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Sinasalo ang babala kapag binago ang cookies habang nag-re-redirect sa Middleware/Proxy
          }
        },
      },
    }
  )
}
