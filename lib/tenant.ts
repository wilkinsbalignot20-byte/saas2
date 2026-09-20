 // lib/tenant.ts
import { cache } from 'react';
import { headers } from 'next/headers';
import { createSupabaseServer } from './supabase-server';

/**
 * Awtomatikong kukunin ang active Tenant Slug mula sa Next.js request context headers,
 * o gamit ang isang explicit slug argument.
 */
export const getActiveTenantSlug = async (): Promise<string | null> => {
  const headersList = await headers();
  const tenantSlug = headersList.get('X-Tenant-Slug');
  return tenantSlug || null;
};

/**
 * Kukuha ng branding settings ng tindahan (Kulay, Pangalan, Logo).
 * Salamat sa React cache(), kahit tawagin mo ito ng maraming beses sa iisang page,
 * ISANG BESES lang ito hihingi ng request o data sa Supabase mo sa bawat request cycle! 💎
 */
export const getStoreBranding = cache(async (explicitSlug?: string) => {
  // 1. Tukuyin kung anong slug ang gagamitin (galing sa argument o galing sa Middleware header)
  const storeSlug = explicitSlug || (await getActiveTenantSlug());

  if (!storeSlug || storeSlug === '_platform') {
    return null;
  }

  console.log(`[Deduplicated DB Hit] Fetching active configuration for tenant: ${storeSlug}`);

  // 2. Ikonekta ang iyong safe server client instance
  const supabase = await createSupabaseServer();

  // 3. Kunin ang mga kailangang columns para sa disenyo ng storefront
  const { data, error } = await supabase
    .from('stores')
    .select('id, name, theme_color, logo_url, slug')
    .eq('slug', storeSlug)
    .maybeSingle(); // Magbabalik ng null kung walang nahanap na tindahan

  if (error) {
    console.error('❌ Database Tenant Query Error:', error.message);
    return null;
  }

  return data;
});
