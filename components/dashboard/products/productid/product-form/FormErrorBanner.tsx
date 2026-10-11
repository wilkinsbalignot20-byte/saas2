// components/dashboard/products/product-form/FormErrorBanner.tsx
import { AlertCircle } from "lucide-react";

export default function FormErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 text-sm">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  );
}