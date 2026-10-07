// components/marketplace/shop/StorePerks.tsx  (BAGO)
import { ShieldCheck, Truck, MessageCircle } from 'lucide-react';

// PLACEHOLDER na teksto: sa susunod, hilahin sa store settings ng bawat tenant
const perks = [
  { icon: ShieldCheck, title: 'Secure checkout', text: 'Protektado ang bawat order' },
  { icon: Truck, title: 'Delivery', text: 'Ipapadala diretso sa iyo' },
  { icon: MessageCircle, title: 'Support', text: 'Handang sumagot sa tanong mo' },
];

export default function StorePerks() {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {perks.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-center gap-3 bg-white rounded-xl border border-[#1B211D]/10 px-4 py-3">
          <Icon size={20} className="shrink-0 text-[#1B211D]/60" />
          <div>
            <p className="text-sm font-semibold text-[#1B211D]">{title}</p>
            <p className="text-xs text-[#1B211D]/50">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}