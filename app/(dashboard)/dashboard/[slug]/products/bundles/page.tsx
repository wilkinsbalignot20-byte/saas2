 import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plus, Package, Edit } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface BundlesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BundlesPage({ params }: BundlesPageProps) {
  const { slug } = await params;

  // 1. TENANT SECURITY CHECK & FETCH
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { id: true, name: true }
  });

  if (!store) return notFound();

  // 2. KUNIN ANG MGA MULTI-PRODUCT BUNDLES NG STORE NA ITO
  // Inayos: Direkta nang hinahanap gamit ang storeId na idinagdag natin sa schema structure
  const activeBundles = await prisma.productBundle.findMany({
    where: {
      storeId: store.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 bg-[#F6F5F1] text-[#1B211D] min-h-screen overflow-y-auto">
      {/* HEADER SECTION WITH CREATE BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1B211D]/5 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#1B211D]">
            Product Packages & Bundles
          </h1>
          <p className="text-sm text-[#1B211D]/50">
            Manage your wholesale group promotions, custom flavor packs, and wholesale tier deals.
          </p>
        </div>

        <Link
          href={`/dashboard/${slug}/products/bundles/new`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-[#1B211D] hover:bg-[#1B211D]/90 transition-colors shadow-sm select-none"
        >
          <Plus size={16} />
          <span>Create Bundle</span>
        </Link>
      </div>

      {/* BUNDLES DISPLAY GRID / LIST MANAGER */}
      {activeBundles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#1B211D]/10 rounded-2xl bg-white shadow-sm max-w-4xl mx-auto space-y-3">
          <div className="mx-auto w-12 h-12 rounded-xl bg-[#F6F5F1] flex items-center justify-center text-[#1B211D]/40">
            <Package size={22} />
          </div>
          <div className="space-y-1">
            <p className="text-base text-[#1B211D]/60 font-semibold">No wholesale bundles configured yet.</p>
            <p className="text-xs text-[#1B211D]/40">Give your tenants the ability to offer mix-match discounts or package deals.</p>
          </div>
          <div className="pt-2">
            <Link
              href={`/dashboard/${slug}/products/bundles/new`}
              className="text-xs font-bold text-[#1B211D] underline hover:text-[#1B211D]/70"
            >
              Set up your first package bundle promotion
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-[#1B211D]/5 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-[#1B211D]/5 text-xs font-bold text-[#1B211D]/50 uppercase tracking-wider">
                <th className="pb-3 pr-4">Bundle Info</th>
                <th className="pb-3 px-4 w-[140px]">Required Items</th>
                <th className="pb-3 px-4 w-[160px]">Package Price</th>
                <th className="pb-3 pl-4 w-[100px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B211D]/5 text-sm">
              {activeBundles.map((bundle: any) => (
                <tr key={bundle.id} className="group hover:bg-[#F6F5F1]/30 transition-colors">
                  <td className="py-4 pr-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-[#1B211D]/10 bg-[#F6F5F1] overflow-hidden flex items-center justify-center text-[#1B211D]/40 font-bold">
                      {bundle.images && bundle.images.length > 0 ? (
                        <img src={bundle.images[0]} alt={bundle.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={16} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1B211D] truncate">{bundle.name}</p>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-[#1B211D]/70 font-medium">
                    {bundle.quantity} pcs mix-match
                  </td>

                  <td className="py-4 px-4 font-semibold text-[#1B211D]">
                    ₱{Number(bundle.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-4 pl-4 text-right">
                    <Link
                      href={`/dashboard/${slug}/products/bundles/${bundle.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-[#1B211D]/10 hover:bg-[#1B211D] hover:text-white transition-all select-none"
                    >
                      <Edit size={12} />
                      <span>Configure</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
