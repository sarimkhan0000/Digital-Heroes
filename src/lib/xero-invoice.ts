import { OrderRecord } from '@/types/database';

export function buildXeroInvoiceCsv(orders: OrderRecord[]): string {
  const headers = [
    '*ContactName',
    '*InvoiceNumber',
    '*InvoiceDate',
    '*DueDate',
    '*Description',
    '*Quantity',
    '*UnitAmount',
    '*AccountCode',
    '*TaxType',
    'Currency',
  ];

  const rows = orders.map((order) => {
    const dateStr = new Date(order.created_at).toISOString().split('T')[0];
    const description = `${order.division_slug.toUpperCase()} — ${order.width_mm}x${order.height_mm}mm (${order.material_name}) [Qty: ${order.quantity}]`;

    return [
      `"Customer_${order.user_id.slice(0, 8)}"`,
      `"INV-${order.order_number}"`,
      dateStr,
      dateStr,
      `"${description.replace(/"/g, '""')}"`,
      1,
      Number(order.subtotal_ex_vat).toFixed(2),
      '200',
      '20% (VAT on Income)',
      order.currency || 'GBP',
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}