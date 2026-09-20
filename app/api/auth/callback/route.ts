 // app/api/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const originUrl = requestUrl.origin; 

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                // FIX 1: Pinipilit ang path sa '/' para mabasa ng proxy at dashboards ang session
                cookieStore.set({ 
                  name, 
                  value, 
                  ...options, 
                  path: '/' 
                });
              } catch (error) {
                // Sinasalo ang automated middleware reactions
              }
            });
          },
        },
      }
    );

    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (!sessionError && sessionData?.user) {
      const user = sessionData.user;
      const userId = user.id;

      const { data: store } = await supabase
        .from('stores')
        .select('slug')
        .eq('owner_id', userId)
        .maybeSingle();

      if (!store) {
        const onboardingUrl = new URL('/onboarding', originUrl);
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'New Merchant';
        onboardingUrl.searchParams.set('name', encodeURIComponent(fullName));
        
        return NextResponse.redirect(onboardingUrl.toString());
      }

      // FIX 2: Swak sa file structure mo na app/(seller-center)/seller/dashboard/[storeSlug]
      return NextResponse.redirect(`${originUrl}/seller/dashboard/${store.slug}`);
    }
  }

  // Fallback kapag nabigo ang network validation exchange handshake
  return NextResponse.redirect(`${originUrl}/seller/login?error=oauth_handshake_failed`);
}
