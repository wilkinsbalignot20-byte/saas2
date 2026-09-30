 // components/dashboard/ProductTable.tsx
'use client';

import Link from 'next/link';
import { Edit2, Eye, AlertCircle } from 'lucide-react';

// Tukuyin natin ang eksaktong hugis ng data na dumarating galing sa Prisma Server Query
interface VariantData {
  id: string;
  sku: string;
  price: any; // Decimal type mula sa Prisma o serialized number
  stock: number;
}

interface ProductWithRelations {
  id: string;
  name: string;
  status: string;
  images: string[]; // ➔ IDINAGDAG PARA SA CLOUDINARY PICTURE URLs ARRAY
  category: {
    name: string;
  };
  variants: VariantData[];
}

interface ProductTableProps {
  products: ProductWithRelations[];
  slug: string;
}

export default function ProductTable({ products, slug }: ProductTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#1B211D]/5 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm text-[#1B211D]">
          {/* TABLE HEADERS */}
          <thead className="bg-[#1B211D]/5 font-display text-[13px] font-semibold tracking-wider text-[#1B211D]/60 border-b border-[#1B211D]/5">
            <tr>
              <th className="py-4 px-6">Product Details</th>
              <th className="py-4 px-6">Category</th>
              <th className="py-4 px-6">SKUs & Prices</th>
              <th className="py-4 px-6 text-center">Total Stock</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>

          {/* TABLE BODY (LOOPING NG MGA PRODUKTO) */}
          <tbody className="divide-y divide-[#1B211D]/5">
            {products.map((product) => {
              // LOHIKA SA LIKOD: I-compute ang kabuuang stock ng lahat ng variants ng produktong ito
              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
              
              return (
                <tr key={product.id} className="hover:bg-[#F6F5F1]/30 transition-colors">
                  
                  {/* COL 1: PRODUCT DETAILS WITH CLOUDINARY THUMBNAIL PHOTO */}
                  <td className="py-5 px-6 vertical-align-top">
                    <div className="flex items-center gap-3">
                      
                      {/* PICTURE CELL LAYER */}
                      {product.images && product.images.length > 0 ? (
                        <div className="h-12 w-12 rounded-xl overflow-hidden border border-[#1B211D]/10 bg-[#F6F5F1] shrink-0">
                          <img 
                            src={product.images[0]} // Kunin ang unang larawan sa array list
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        /* GRAY BOX PLACEHOLDER BADGE KUNG WALANG LARAWAN */
                        <div className="h-12 w-12 rounded-xl bg-[#1B211D]/5 flex items-center justify-center text-[#1B211D]/30 shrink-0">
                          <svg xmlns="http://w3.org" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
                          </svg>
                        </div>
                      )}

                      {/* TEXT CELL LAYER PARA SA PRODUCT NAME AT STATUS */}
                      <div className="space-y-1 min-w-0">
                        <span className="font-medium text-base block truncate text-[#1B211D]" title={product.name}>
                          {product.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {product.status === 'published' ? (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/10">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  </td>

                  {/* COL 2: CATEGORY NAME */}
                  <td className="py-5 px-6 text-[#1B211D]/70 font-medium">
                    {product.category?.name || 'Uncategorized'}
                  </td>

                  {/* COL 3: VARIANTS LIST (SKU & PRICE MAP) */}
                  <td className="py-5 px-6">
                    <div className="space-y-2 max-w-xs">
                      {product.variants.map((v) => (
                        <div key={v.id} className="flex justify-between items-center bg-[#1B211D]/5 rounded-lg px-2.5 py-1 text-xs border border-[#1B211D]/5">
                          <span className="font-mono text-[#1B211D]/50 truncate mr-4" title={`SKU: ${v.sku}`}>
                            {v.sku}
                          </span>
                          <span className="font-semibold text-[#1B211D]/80">
                            ₱{Number(v.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* COL 4: TOTAL STOCK TRACKER */}
                  <td className="py-5 px-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className={`text-base font-bold ${totalStock === 0 ? 'text-rose-600' : totalStock <= 5 ? 'text-amber-600' : 'text-[#1B211D]'}`}>
                        {totalStock}
                      </span>
                      {totalStock === 0 && (
                        <span className="text-[10px] text-rose-600 font-medium flex items-center gap-0.5 mt-0.5">
                          <AlertCircle size={10} /> Out of stock
                        </span>
                      )}
                    </div>
                  </td>

                  {/* COL 5: EDIT & VIEW LINKS */}
                  <td className="py-5 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      {/* View Storefront Link */}
                      <Link
                        href={`/shop/${slug}/${product.id}`}
                        target="_blank"
                        className="p-2 text-[#1B211D]/40 hover:text-[#1B211D] hover:bg-[#1B211D]/5 rounded-lg transition-all"
                        title="View on shop"
                      >
                        <Eye size={16} />
                      </Link>
                      
                      {/* Edit Product Page Link */}
                      <Link
                        href={`/dashboard/${slug}/products/${product.id}`}
                        className="p-2 text-[#3E8F68] hover:text-white hover:bg-[#3E8F68] rounded-lg transition-all"
                        title="Edit product"
                      >
                        <Edit2 size={16} />
                      </Link>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
