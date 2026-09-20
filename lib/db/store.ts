 // src/lib/db/stores.ts
import { cache } from 'react';
import { createSupabaseServer } from '../supabase-server';

/**
 * 💡 KINS PLATFORM PERFORMANCE CHEAT SHEET:
 * 1. MATIPID SA DATABASE: Balot sa cache() para sa Request Deduplication (1 hit lang sa Supabase).
 * 2. MABILIS ANG RUNTIME: Isabay sa Promise.all() kapag tinawag sa Pages para patagin ang Waterfall lag.
 */
export const getStoreByOwner = cache(async (ownerId: string) => {
  const supabase = await createSupabaseServer();

  const { data } = await supabase
    .from('stores')
    .select('id, name, slug, theme_color, logo_url, owner_id')
    .eq('owner_id', ownerId)
    .maybeSingle();

  return data;
});
