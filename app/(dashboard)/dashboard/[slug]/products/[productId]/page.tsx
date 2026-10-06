// app/(dashboard)/dashboard/[slug]/products/[productId]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma"; 
import ProductForm from "@/components/dashboard/products/productid/ProductForm"; 

interface ProductIdPageProps {
  params: Promise<{
    slug: string;
    productId: string;
  }>;
}

export default async function ProductIdPage({ params }: ProductIdPageProps) {
  // Ligtas na i-await ang params para sa Next.js 16 execution criteria
  const { slug, productId } = await params;

  // 🛡️ TENANT ISOLATION GUARD: Kunin ang product at tiyaking pag-aari ito ng store slug na nasa URL
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      store: {
        slug: slug,
      },
    },
    include: {
      variants: {
        orderBy: {
          createdAt: "asc", 
        },
      },
      store: {
        select: {
          name: true,
        },
      },
    },
  });

  // Kung walang valid product o sinubukang pasukin ng maling tenant, magbato ng 404 security layer
  if (!product) {
    return notFound();
  }

  // Kunin ang lahat ng active categories ng specific store na ito para sa dropdown selection box
  const categories = await prisma.category.findMany({
    where: {
      storeId: product.storeId,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Safe serialization ng database schema parameters patungong React state inputs
  const serializedProduct = {
    id: product.id,
    name: product.name,
    description: product.description || "",
    images: product.images,
    status: product.status,
    categoryId: product.categoryId,
    variants: product.variants.map((variant: any) => ({
      name: variant.name,
      sku: variant.sku,
      price: variant.price.toString(), // In-align sa string format para sa state mo sa client side
      stock: variant.stock.toString(), // Convert string integer para iwas rounding crashes
    })),
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Edit Product Details
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Modify product configurations, update matrix models, and handle store stocks.
          </p>
        </div>
      </div>

      {/* Ipapasa ang initialData at productId sa iyong ProductForm control array */}
      <ProductForm 
        categories={categories} 
        slug={slug} 
        storeName={product.store.name} 
        initialData={serializedProduct}
        productId={productId}
      />
    </div>
  );
}
