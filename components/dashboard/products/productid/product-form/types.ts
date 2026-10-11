// components/dashboard/products/product-form/types.ts

export interface CategoryOption {
  id: string;
  name: string;
}

export interface VariantInput {
  name: string;
  sku: string;
  price: string;
  stock: string;
}

// Attribute Rows ng Optimizer
export interface AttributeGroup {
  name: string; // Halimbawa: "Size" o "Color"
  options: string; // Halimbawa: "S, M, L" o "Red, Blue"
}

export interface ProductFormProps {
  categories: CategoryOption[];
  slug: string;
  storeName?: string;
  productId?: string;
  initialData?: {
    id: string;
    name: string;
    description: string;
    images: string[];
    status: string;
    categoryId: string;
    variants: VariantInput[];
    bundles: BundleInput[];
  };
}

/** Mga basic info values ng form */
export interface ProductFieldValues {
  name: string;
  description: string;
  categoryId: string;
  newCategoryName: string;
  status: string;
  images: string[];
}

export interface BundleInput {
  id?: string;       // Opsyonal, para malaman kung umiiral na sa DB
  name: string;      // Halimbawa: "Bundle of 3", "Family Pack"
  quantity: string;  // Naka-string muna para sa state input form control layer
  price: string;     // Convert string decimal para iwas rounding input format errors
}
