 // src/lib/tenant.ts
import { cache } from 'react';
import { createSupabaseServer } from './supabase-server';

/**
 * Kukuha ng branding settings ng tindahan (Kulay, Pangalan, Logo).
 * Salamat sa React cache(), kahit tawagin mo ito ng maraming beses sa iisang page,
 * ISANG BESES lang ito hihingi ng request o data sa Supabase mo! 💎
 */
export const getStoreBranding = cache(async (storeSlug: string) => {
  console.log(`[Deduplicated DB Hit] Fetching data for: ${storeSlug}`);

  // 1. Ikonekta ang iyong safe server client instance
  const supabase = await createSupabaseServer();

  // 2. Kunin ang mga kailangang columns para sa disenyo ng storefront
  const { data, error } = await supabase
    .from('stores')
    .select('id, name, theme_color, logo_url')
    .eq('slug', storeSlug)
    .maybeSingle(); // Magbabalik ng null kung walang nahanap na tindahan

  if (error) {
    console.error('Database error:', error.message);
    return null;
  }

  return data;
});
