 import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server' // Siguraduhing tama ang alias path mo sa lib

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next')

  if (code) {
    // I-call lang ang malinis mong helper function
    const supabase = await createClient()

    // 1. I-exchange ang auth code para sa permanenteng User Session Token
    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!authError && authData?.user) {
      const user = authData.user

      // 2. MAG-QUERY SA DATABASE: Hanapin ang slug ng store gamit ang 'owner_id'
      const { data: store } = await supabase
        .from('stores')
        .select('slug')
        .eq('owner_id', user.id)
        .maybeSingle()

      // 3. REDIRECTION FLOW:
      if (store?.slug) {
        // Kung may tindahan na, papasukin direkta sa dashboard/[slug]
        return NextResponse.redirect(`${origin}/dashboard/${store.slug}`)
      } else {
        // Kung walang nahanap na tindahan, ipadala sa onboarding setup form
        const destination = rawNext && rawNext.startsWith('/') ? rawNext : '/onboarding'
        return NextResponse.redirect(`${origin}${destination}`)
      }
    }
  }

  // Kung nagkaroon ng error sa handshake, ibalik sila sa login page
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
