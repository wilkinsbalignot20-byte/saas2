// app/api/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Kung may "next" parameter sa URL, doon natin sila ipadadala pagkatapos ma-verify (default ay /onboarding)
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const cookieStore = await cookies()
    
    // Gagawa tayo ng Server Client para ligtas na mai-save ang cookies sa server-side
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ang setAll ay pwedeng mag-fail kung tinawag mula sa Server Component. Safe itong i-ignore dito.
            }
          },
        },
      }
    )

    // 🚀 ENGINE EXCHANGE: Ipapalit ang temporary code para sa permanenteng User Session Token
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Kapag matagumpay ang palitan, ipadala sila sa /onboarding (o sa link na nasa 'next')
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Kung nagkaroon ng matinding error sa handshake, ibalik sila sa login page na may error token
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
