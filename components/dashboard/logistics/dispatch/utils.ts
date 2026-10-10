// components/dashboard/logistics/dispatch/utils.ts
import type { Courier, Delivery } from "../utils";
import type { DispatchView } from "./types";

type Groups = Record<DispatchView, Delivery[]>;

/** Hatiin ang deliveries sa tatlong listahan, na may kanya-kanyang sort */
export function groupDeliveries(deliveries: Delivery[]): Groups {
  const queue = deliveries
    .filter((d) => d.shippingStatus === "unfulfilled")
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)); // pinakamatagal na naghihintay, una
  const transit = deliveries
    .filter((d) => d.shippingStatus === "shipped")
    .sort((a, b) => +new Date(a.dispatchedAt ?? a.createdAt) - +new Date(b.dispatchedAt ?? b.createdAt));
  const delivered = deliveries
    .filter((d) => d.shippingStatus === "delivered")
    .sort((a, b) => +new Date(b.deliveredAt ?? 0) - +new Date(a.deliveredAt ?? 0));
  return { queue, transit, delivered };
}

export function filterDeliveries(list: Delivery[], search: string) {
  const term = search.trim().toLowerCase();
  if (!term) return list;
  return list.filter(
    (d) =>
      d.orderNumber.toLowerCase().includes(term) ||
      d.customerName.toLowerCase().includes(term) ||
      d.customerPhone.includes(term) ||
      d.shippingAddress.toLowerCase().includes(term) ||
      (d.courier?.name.toLowerCase().includes(term) ?? false)
  );
}

/** Mga rider na pwedeng pagbigyan ng order (available muna sa listahan) */
export function getAssignableCouriers(couriers: Courier[]) {
  return couriers
    .filter((c) => c.status !== "inactive")
    .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === "available" ? -1 : 1));
}