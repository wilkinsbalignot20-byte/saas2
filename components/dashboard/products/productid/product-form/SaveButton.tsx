// components/dashboard/products/product-form/SaveButton.tsx
import { Save } from "lucide-react";

export default function SaveButton({ loading }: { loading: boolean }) {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 bg-[#3E8F68] text-white font-medium px-6 py-3 rounded-xl text-sm hover:bg-[#327555] active:scale-[0.98] transition-all disabled:opacity-50 select-none shadow-sm cursor-pointer"
      >
        <Save size={16} />
        <span>{loading ? "Writing to Supabase..." : "Save Product & Inventory"}</span>
      </button>
    </div>
  );
}