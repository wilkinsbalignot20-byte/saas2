 // app/(seller-center)/seller/dashboard/[storeSlug]/page.tsx
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

interface PageProps {
  params: Promise<Record<string, string>>;
}

interface StoreThemeConfig {
  featured_title?: string;
  typing_texts?: string[];
  active_animation_component?: "TextType" | "DepthCarousel" | "AccordionGallery" | "None";
}

export default async function StoreDashboardOverviewPage({ params }: PageProps) {
  const resolvedParams = await params;
  const storeSlug = resolvedParams.storeSlug || resolvedParams.storeslug || resolvedParams.slug;

  if (!storeSlug) return notFound();

  const supabase = await createSupabaseServer();

  // 1. KUNIN ANG PINAKABAGONG DATA NG STORE MULA SA DATABASE TABLE
  const { data: store, error } = await supabase
    .from("stores")
    .select("id, name, slug, status, theme_config, business_type, contact_number, pickup_address")
    .eq("slug", storeSlug.toLowerCase().trim())
    .maybeSingle();

  if (error || !store) return notFound();

  // Ligtas na i-parse ang theme_config JSONB column para sa TypeScript engineering stability
  const currentTraits = (
    typeof store.theme_config === "string"
      ? JSON.parse(store.theme_config)
      : store.theme_config
  ) as StoreThemeConfig || {};

  // Default value settings para sa data layout blocks kung bago pa ang store account
  const savedTexts = currentTraits.typing_texts || ["Welcome to our shop!"];
  const activeAnimation = currentTraits.active_animation_component || "TextType";

  // 2. SERVER ACTION FOR VISUAL TEXT CONFIGURATION UPDATES
  async function updateTextConfig(formData: FormData) {
    "use server";
    const supabaseClient = await createSupabaseServer();
    
    const rawTypingText = formData.get("typingTextsInput") as string;
    const typingTextsArray = rawTypingText.split(",").map((t) => t.trim()).filter(Boolean);
    const updatedTitle = formData.get("featuredTitle") as string;
    const selectedComponent = formData.get("activeComponent") as StoreThemeConfig["active_animation_component"];

    const newThemeConfig = {
      ...currentTraits,
      featured_title: updatedTitle || "Our Products",
      typing_texts: typingTextsArray.length > 0 ? typingTextsArray : savedTexts,
      active_animation_component: selectedComponent || "None"
    };

    if (store) {
      await supabaseClient
        .from("stores")
        .update({ theme_config: newThemeConfig })
        .eq("id", store.id);

      // Awtomatikong linisin ang cache ng server para mag-reflect agad ang bagong text changes
      revalidatePath(`/seller/dashboard/${store.slug}`);
    }
  }

  // Summary Metrics array layout blocks (Naka-link direct sa system subdirectories mo)
  const cardsInfo = [
    { title: "Active Orders", value: "0", desc: "Manage store logs", folder: "/order", color: "border-l-amber-500" },
    { title: "Finance Total Revenue", value: "₱0.00", desc: "Track earnings pipeline", folder: "/finance", color: "border-l-emerald-500" },
    { title: "Products Count", value: "0 listed", desc: "Inventory catalogue state", folder: "/product", color: "border-l-indigo-500" },
    { title: "Active Marketing Campaigns", value: "0", desc: "Customer acquisition", folder: "/marketing", color: "border-l-pink-500" },
  ];

  return (
    <div className="space-y-6 text-black w-full">
      
      {/* 🟢 CLEAN WELCOME BANNER */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {store.name} Command Overview
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Narito ang pangkalahatang lagay ng iyong operational matrix tools.
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 h-fit w-fit">
          Account Status: {store.status}
        </span>
      </div>

      {/* Summary Metrics Grid Indicators */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardsInfo.map((card) => (
          <a 
            href={`/seller/dashboard/${store.slug}${card.folder}`} 
            key={card.title} 
            className={`block rounded-xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm transition hover:shadow-md ${card.color}`}
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{card.title}</span>
            <span className="text-2xl font-black text-slate-900 block mt-1">{card.value}</span>
            <span className="text-[11px] text-slate-500 block mt-2">📂 Go to {card.desc} →</span>
          </a>
        ))}
      </div>

      {/* Control Actions Form & Meta Info Split Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* SHOP EDITOR LIVE FORM CONFIGURATOR */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Store-Editor Quick Controls</h3>
            <p className="text-xs text-slate-500">I-edit ang custom layout setup at animations na gagana sa iyong public shop layout.</p>
          </div>

          <form action={updateTextConfig} className="space-y-4 pt-2">
            
            {/* 🆕 ACTIVE COMPONENT EFFECTS DROP-SELECTOR SELECTION */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Active Frontpage Animation</label>
              <select 
                name="activeComponent"
                defaultValue={activeAnimation}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-black bg-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="TextType">🔠 Streaming TextType Effect (Sulat Line Animation)</option>
                <option value="DepthCarousel">🖼️ 3D DepthCarousel View (Umuusad na mga Produkto)</option>
                <option value="AccordionGallery">📂 AccordionGallery Sliding Lookbook (Bumubukang Card)</option>
                <option value="None">❌ Standard Design (Walang Animation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Featured Products Title</label>
              <input 
                name="featuredTitle" 
                type="text" 
                defaultValue={currentTraits.featured_title || "Our Products"} 
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-black bg-white focus:border-indigo-500 focus:outline-none" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">TextType Phrases (Comma Separated)</label>
              <textarea 
                name="typingTextsInput" 
                rows={3} 
                defaultValue={savedTexts.join(", ")} 
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-black bg-white focus:border-indigo-500 focus:outline-none" 
              />
            </div>

            <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Save Visual Text Configurations
            </button>
          </form>
        </div>

        {/* LOGISTICS AND BUSINESS DETAILS COLUMN */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Business Data Matrix
          </h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[9px]">Business Type</span>
              <span className="text-slate-700 font-bold block mt-0.5">{store.business_type}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[9px]">Contact Number</span>
              <span className="text-slate-700 font-bold block mt-0.5">{store.contact_number}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[9px]">Logistics Pickup Address</span>
              <span className="text-slate-600 font-medium block mt-1 p-2 bg-slate-50 rounded border border-slate-100 leading-relaxed">
                📍 {store.pickup_address}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
