 // src/lib/db/users.ts
import { cache } from 'react';
import { createSupabaseServer } from '../supabase-server';

/**
 * 💡 KINS PLATFORM PERFORMANCE CHEAT SHEET:
 * 
 * 1. MATIPID SA DATABASE (Request Deduplication)
 *    - Naka-balot sa cache() para kahit tawagin ang profile ng user na ito
 *      sa Navbar, Sidebar, at Account settings, ISANG BESES lang ito 
 *      tatalbog o hihingi ng request sa Supabase cloud database mo [unauthorized].
 * 
 * 2. MABILIS ANG RUNTIME (Reduced Waterfall Lag)
 *    - Huwag itong i-await nang hiwalay kung may kasabay na store configurations.
 *    - Palaging gamitin ang parallel pattern sa iyong page cockpit layouts:
 *         const [profile, store] = await Promise.all([ getUserProfile(id), getStoreByOwner(id) ]);
 */
export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createSupabaseServer();

  const { data } = await supabase
    .from('users')
    .select('id, email, full_name, role, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  return data;
});
