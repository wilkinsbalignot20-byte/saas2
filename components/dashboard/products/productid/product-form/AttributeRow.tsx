// components/dashboard/products/product-form/AttributeRow.tsx
import { Trash2 } from "lucide-react";
import type { AttributeGroup } from "./types";

interface Props {
  attribute: AttributeGroup;
  canRemove: boolean;
  onChange: (field: keyof AttributeGroup, value: string) => void;
  onRemove: () => void;
}

export default function AttributeRow({ attribute, canRemove, onChange, onRemove }: Props) {
  return (
    <div className="flex items-center gap-3 bg-white border border-[#1B211D]/10 p-3 rounded-xl">
      <input
        type="text"
        placeholder="e.g., Color, Size, Model"
        value={attribute.name}
        onChange={(e) => onChange("name", e.target.value)}
        className="w-1/3 bg-[#F6F5F1]/30 border border-[#1B211D]/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#3E8F68] font-semibold text-[#1B211D]"
      />
      <input
        type="text"
        placeholder="Maglagay ng kuwit sa pagitan ng pagpipilian (e.g., Red, Blue, Green)"
        value={attribute.options}
        onChange={(e) => onChange("options", e.target.value)}
        className="flex-1 bg-[#F6F5F1]/30 border border-[#1B211D]/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#3E8F68]"
      />
      <button
        type="button"
        disabled={!canRemove}
        onClick={onRemove}
        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}