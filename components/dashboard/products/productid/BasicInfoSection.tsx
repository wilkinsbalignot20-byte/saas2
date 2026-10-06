// components/dashboard/BasicInfoSection.tsx
'use client';

import ImageUpload from './ImageUpload';

interface CategoryOption {
  id: string;
  name: string;
}

interface BasicInfoSectionProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  newCategoryName: string;
  setNewCategoryName: (v: string) => void;
  images: string[];
  setImages: (urls: string[]) => void;
  categories: CategoryOption[];
}

export default function BasicInfoSection({
  name, setName,
  description, setDescription,
  categoryId, setCategoryId,
  status, setStatus,
  newCategoryName, setNewCategoryName,
  images, setImages,
  categories
}: BasicInfoSectionProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#1B211D]/5 shadow-sm space-y-4">
      <h2 className="text-md font-bold text-[#1B211D] font-display uppercase tracking-wider text-xs opacity-50">
        Basic Information
      </h2>
      
      {/* PRODUCT NAME INPUT */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-[#1B211D]/70">Product Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Manipu Premium Leather Shoes"
          className="w-full bg-[#F6F5F1]/50 border border-[#1B211D]/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3E8F68] transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DYNAMIC CATEGORY PICKER */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#1B211D]/70">New Category (Type here if not in list)</label>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g., Shoes, Clothing"
            className="w-full bg-[#F6F5F1]/50 border border-[#1B211D]/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3E8F68] transition-colors mb-2"
          />
          
          <label className="text-xs font-semibold text-[#1B211D]/70 block mt-2">Or Select Existing Category *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-[#F6F5F1]/50 border border-[#1B211D]/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3E8F68] transition-colors"
          >
            <option value="">-- Select a Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* SHOP PUBLISH STATUS */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#1B211D]/70">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-[#F6F5F1]/50 border border-[#1B211D]/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3E8F68] transition-colors"
          >
            <option value="draft">Save as Draft</option>
            <option value="published">Publish (Active)</option>
          </select>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-[#1B211D]/70">Description (Optional)</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell your customers about the material, fit, or story behind this product..."
          className="w-full bg-[#F6F5F1]/50 border border-[#1B211D]/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3E8F68] transition-colors resize-none"
        />
      </div>

      {/* IMAGE UPLOAD CORE SPLIT SECTION */}
      <div className="pt-2">
        <ImageUpload value={images} onChange={(urls) => setImages(urls)} />
      </div>
    </div>
  );
}
