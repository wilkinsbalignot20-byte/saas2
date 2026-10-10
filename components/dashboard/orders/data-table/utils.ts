 // components/dashboard/orders/data-table/utils.ts
import type { SerializedOrder, SortDir, SortKey } from "./types";

export const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

export const formatOrderDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

interface FilterOptions {
  search: string;
  status: string;
  payment: string;
  sortKey: SortKey;
  sortDir: SortDir;
}

/** Search + filter + sort ng orders (pure function, madaling i-test) */
export function filterAndSortOrders(orders: SerializedOrder[], opts: FilterOptions) {
  const term = opts.search.trim().toLowerCase();

  const rows = orders.filter((o) => {
    // 1. CASE-INSENSITIVE SEARCH FILTER MAPPING
    const matchesSearch =
      !term ||
      o.orderNumber.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.customerEmail.toLowerCase().includes(term);

    // Siguraduhing ligtas ang pag-evaluate sa pamamagitan ng uppercase conversion ng strings mula sa DB
    const shipping = (o.shippingStatus || "").toUpperCase();
    const payment = (o.paymentStatus || "").toUpperCase();

    // 2. ADVANCED TABS STATUS FILTERING LAYER
    let matchesStatus = true;
    if (opts.status !== "all") {
      switch (opts.status) {
        case "DRAFT":
          matchesStatus = shipping === "DRAFT";
          break;
        case "PENDING_ORDER": // Para sa Pending Tab
          matchesStatus = payment === "PENDING" && shipping === "UNFULFILLED";
          break;
        case "PAYMENT_REVIEW": // Para sa Payment Review Tab
          matchesStatus = payment === "PAYMENT_REVIEW";
          break;
        case "FAILED": // Para sa Failed Tab
          matchesStatus = payment === "FAILED";
          break;
        case "UNFULFILLED": // Para sa regular Unfulfilled Tab (Hindi kasama ang failed o for manual review)
          matchesStatus = shipping === "UNFULFILLED" && payment !== "FAILED" && payment !== "PAYMENT_REVIEW";
          break;
        case "SHIPPED":
          matchesStatus = shipping === "SHIPPED";
          break;
        case "DELIVERED":
          matchesStatus = shipping === "DELIVERED";
          break;
        case "RETURN_BAR": // Para sa Return Tab (Pinagsamang Requested at Returned)
          matchesStatus = shipping === "RETURN_REQUESTED" || shipping === "RETURNED";
          break;
        case "CANCELLED":
          matchesStatus = shipping === "CANCELLED";
          break;
        default:
          matchesStatus = true;
      }
    }

    // 3. SECONDARY DROPDOWN PAYMENT FILTER (Kung ginagamit sa toolbar dropdown)
    const matchesPayment = opts.payment === "all" || payment === opts.payment.toUpperCase();

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // 4. SORTING LAYER (Pinanatili ang iyong orihinal at malinis na arithmetic subtraction structure)
  rows.sort((a, b) => {
    const av = opts.sortKey === "date" ? Date.parse(a.createdAt) : Number(a.totalAmount);
    const bv = opts.sortKey === "date" ? Date.parse(b.createdAt) : Number(b.totalAmount);
    return opts.sortDir === "asc" ? av - bv : bv - av;
  });

  return rows;
}
