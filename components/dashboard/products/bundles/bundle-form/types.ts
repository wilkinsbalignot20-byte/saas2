 export interface BundleTierInput {
  id?: string;
  quantity: number;
  price: number;
  images: string;
}

export interface BundleChoiceInput {
  id?: string;
  name: string;
  imageUrl: string;
}

export interface BundleFormProps {
  slug: string;
  storeName: string;
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    bundleType: string; // 🌟 IDINAGDAG: Para sa multi-strategy tracking
    tiers: BundleTierInput[];
    choices: BundleChoiceInput[];
  };
}
