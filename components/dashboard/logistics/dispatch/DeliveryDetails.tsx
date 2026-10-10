// components/dashboard/logistics/dispatch/DeliveryDetails.tsx
import { MapPin, Phone, Map as MapIcon } from "lucide-react";
import { itemLine, type Delivery } from "../utils";

/** Address, contact links, at listahan ng items */
export default function DeliveryDetails({ order }: { order: Delivery }) {
  const items = order.orderItems.map(itemLine);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.shippingAddress)}`;

  return (
    <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
      <div className="space-y-2">
        <p className="flex items-start gap-2">
          <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
          <span className="line-clamp-3">{order.shippingAddress}</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-[23px] text-xs font-medium">
          <a href={`tel:${order.customerPhone}`} className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900">
            <Phone size={12} /> {order.customerPhone}
          </a>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
          >
            <MapIcon size={12} /> Open in Maps
          </a>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-400">{order.orderItems.reduce((n, i) => n + i.quantity, 0)} item(s)</p>
        <p className="text-slate-700" title={items.join(", ")}>
          {items.slice(0, 2).join(", ")}
          {items.length > 2 && <span className="text-slate-400"> +{items.length - 2} more</span>}
        </p>
        {order.notes && <p className="text-xs italic text-slate-500">Note: {order.notes}</p>}
      </div>
    </div>
  );
}