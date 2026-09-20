 // lib/supabase-server.ts (O kung nasaan ang iyong server client file)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServer() {
  // Await ang asynchronous Next.js cookies engine matrix
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // Explicit type mapping para sa strict system compilation
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // 🟢 SUCCESS IMPLEMENTATION: Isang buong single object wrapper para sa Next.js native set
              cookieStore.set({ 
                name, 
                value, 
                ...options, 
                path: '/' // Tinitiyak na ang session tokens ay gumagana sa global domain hierarchy at subdomains
              })
            )
          } catch {
            // Sinasalo ang natural layout engine mutation updates galing sa pure Server Components
          }
        },
      },
    }
  )
}
