// components/marketplace/shop/StorefrontFooter.tsx  (BAGO)

export default function StorefrontFooter({ storeName }: { storeName: string }) {
  return (
    <footer className="mt-12 border-t border-[#1B211D]/10 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 text-sm text-[#1B211D]/50">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}