import type { Invoice } from '@/app/domains/invoices/models/invoices.model';
import type { Language } from '@/app/utils/i18n';
import { formatCurrency, formatDateTime } from '@/app/utils/format-value';

export type ProductInvoiceLabels = {
  title: string;
  description: string;
  generated: string;
  product: string;
  productDescription: string;
  inventoryId: string;
  price: string;
  quantity: string;
  lineTotal: string;
  total: string;
};

export async function downloadProductInvoice(
  invoice: Invoice,
  language: Language,
  labels: ProductInvoiceLabels,
): Promise<void> {
  if (!invoice.items.length) return;

  const { jsPDF } = await import('jspdf');
  const document = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const margin = 14;
  const columns = [
    { key: 'product', label: labels.product, width: 48 },
    { key: 'description', label: labels.productDescription, width: 90 },
    { key: 'inventoryId', label: labels.inventoryId, width: 36 },
    { key: 'price', label: labels.price, width: 34 },
    { key: 'quantity', label: labels.quantity, width: 23 },
    { key: 'lineTotal', label: labels.lineTotal, width: 38 },
  ] as const;
  const isNumericColumn = (key: (typeof columns)[number]['key']) =>
    key === 'price' || key === 'quantity' || key === 'lineTotal';
  let y = 0;

  const drawDocumentHeader = () => {
    document.setFillColor(37, 99, 235);
    document.rect(0, 0, pageWidth, 39, 'F');
    document.setTextColor(255, 255, 255);
    document.setFont('helvetica', 'bold');
    document.setFontSize(22);
    document.text(labels.title, margin, 14);
    document.setFontSize(13);
    document.text(invoice.name, margin, 22);
    document.setFont('helvetica', 'normal');
    document.setFontSize(9);
    document.text(invoice.description || labels.description, margin, 29, {
      maxWidth: pageWidth - margin * 2,
    });
    document.text(
      `${labels.generated}: ${formatDateTime(invoice.createdAt, language)}`,
      margin,
      36,
    );
    y = 47;
  };

  const drawTableHeader = () => {
    let x = margin;
    document.setFillColor(239, 246, 255);
    document.setDrawColor(191, 219, 254);
    columns.forEach(({ width }) => {
      document.rect(x, y, width, 9, 'FD');
      x += width;
    });
    x = margin;
    document.setTextColor(30, 64, 175);
    document.setFont('helvetica', 'bold');
    document.setFontSize(8);
    columns.forEach(({ key, label, width }) => {
      const align = isNumericColumn(key) ? 'right' : 'left';
      document.text(label, align === 'right' ? x + width - 2 : x + 2, y + 5.8, {
        align,
        maxWidth: width - 4,
      });
      x += width;
    });
    y += 9;
  };

  const addPage = (includeTitle = false) => {
    if (includeTitle) document.addPage();
    if (includeTitle) {
      document.setTextColor(15, 23, 42);
      document.setFont('helvetica', 'bold');
      document.setFontSize(13);
      document.text(labels.title, margin, 14);
      y = 20;
    }
    drawTableHeader();
  };

  drawDocumentHeader();
  addPage();

  invoice.items.forEach((item) => {
    const values = {
      product: item.name,
      description: item.description || '-',
      inventoryId: `NX-${item.productId.slice(-6).toUpperCase()}`,
      price: formatCurrency(item.unitPrice, language),
      quantity: String(item.quantity),
      lineTotal: formatCurrency(item.unitPrice * item.quantity, language),
    };
    const lines = columns.map(({ key, width }) =>
      document.splitTextToSize(values[key], width - 4) as string[],
    );
    const rowHeight = Math.max(11, ...lines.map((value) => value.length * 4.2 + 4));

    if (y + rowHeight > pageHeight - 15) addPage(true);

    let x = margin;
    document.setFont('helvetica', 'normal');
    document.setFontSize(8);
    document.setTextColor(51, 65, 85);
    document.setDrawColor(226, 232, 240);
    columns.forEach(({ key, width }, index) => {
      document.rect(x, y, width, rowHeight);
      const align = isNumericColumn(key) ? 'right' : 'left';
      document.text(lines[index], align === 'right' ? x + width - 2 : x + 2, y + 5, {
        align,
        maxWidth: width - 4,
      });
      x += width;
    });
    y += rowHeight;
  });

  const total = invoice.total;
  if (y + 14 > pageHeight - 15) {
    document.addPage();
    y = 20;
  }
  document.setFillColor(239, 246, 255);
  document.setTextColor(30, 64, 175);
  document.setFont('helvetica', 'bold');
  document.setFontSize(11);
  document.roundedRect(pageWidth - margin - 75, y + 4, 75, 11, 2, 2, 'F');
  document.text(
    `${labels.total}: ${formatCurrency(total, language)}`,
    pageWidth - margin - 4,
    y + 11,
    { align: 'right' },
  );

  const pageCount = document.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    document.setPage(page);
    document.setFontSize(8);
    document.setTextColor(100, 116, 139);
    document.text(`${page} / ${pageCount}`, pageWidth - margin, pageHeight - 7, {
      align: 'right',
    });
  }

  document.save(`invoice-${invoice.id}.pdf`);
}
