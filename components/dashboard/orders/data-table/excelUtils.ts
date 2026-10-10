 // components/dashboard/orders/data-table/excelUtils.ts
import * as XLSX from "xlsx";
import type { SerializedOrder } from "./types";

/**
 * Awtomatikong kumukuha ng filtered orders at nag-e-generate ng Excel download (.xlsx)
 * @param filteredOrders - Ang listahan ng orders na kasalukuyang naka-filter sa screen ng merchant
 * @param currentTabLabel - Ang pangalan ng tab (e.g., "Payment Review", "Unfulfilled") para sa pangalan ng file
 */
export function exportOrdersToExcel(filteredOrders: SerializedOrder[], currentTabLabel: string) {
  if (!filteredOrders || filteredOrders.length === 0) {
    alert("Walang orders na matatagpuan sa kasalukuyang filter para mai-export.");
    return;
  }

  // 1. I-map ang database objects patungo sa malilinis na mga hanay (rows) ng Excel sheet
  const excelRows = filteredOrders.map((order) => {
    // Bilangin ang kabuuang piraso ng binili sa order
    const totalItems = (order.orderItems || []).reduce((acc, item) => acc + item.quantity, 0);

    return {
      "Order Number": order.orderNumber,
      "Customer Name": order.customerName,
      "Customer Email": order.customerEmail,
      "Total Items": totalItems,
      "Payment Status": order.paymentStatus.toUpperCase(),
      "Fulfillment Status": order.shippingStatus.toUpperCase(),
      "Total Amount (PHP)": parseFloat(order.totalAmount),
      "Date Placed": new Date(order.createdAt).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  });

  // 2. Gawan ng bagong Workbook at Worksheet gamit ang SheetJS
  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const workbook = XLSX.utils.book_new();
  
  // Isama ang worksheet sa loob ng workbook shell
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders Summary");

  // 3. I-configure ang column spacing gamit ang 'wch' para sa strict TypeScript validation (ts2322)
  // [Order Number, Customer Name, Customer Email, Total Items, Payment Status, Fulfillment Status, Total Amount, Date Placed]
  const maxPropsWidth: number[] = [15, 25, 30, 12, 16, 18, 18, 15];
  
  // Explicitly nating nilagyan ng ': number' type ang parameter para mawala ang implicit any error (ts7006)
  worksheet["!cols"] = maxPropsWidth.map((width: number) => ({ wch: width }));

  // 4. Awtomatikong i-trigger ang file download layer sa web browser ng merchant
  const safeFileName = `Orders_Report_${currentTabLabel.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, safeFileName);
}
