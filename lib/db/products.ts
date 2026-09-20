// src/lib/db/products.ts
import { createSupabaseServer } from '../supabase-server';

/**
 * Hihilahin ang mga produkto ng isang partikular na tindahan.
 * Idinisenyo bilang isang simpleng async function para madaling 
 * isabay sa Promise.all() ng kahit anong page o layout.
 */
export async function getStoreProducts(storeId: string) {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, image_url, stock')
    .eq('store_id', storeId);

  if (error) {
    console.error(`Error fetching products for store ${storeId}:`, error.message);
    return [];
  }

  return data || [];
}
