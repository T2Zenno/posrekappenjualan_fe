import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

// Use the types from useData.ts
import type { Sale, Customer, Product, Channel, Payment, Admin } from '@/hooks/useData';

interface ExportData {
  sales: Sale[];
  customers: Customer[];
  products: Product[];
  channels: Channel[];
  payments: Payment[];
  admins: Admin[];
}

interface ExportOptions {
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  title?: string;
  sections?: string[];
}

// Helper function to get ID from either string or object
const getId = (value: any): string => {
  return typeof value === 'object' && value ? value.id : value;
};

// Helper function to safely get the array from a potential { data: [...] } object structure
const getArray = <T>(input: any): T[] => {
  if (Array.isArray(input)) return input;
  if (input && Array.isArray(input.data)) return input.data;
  return [];
};

export const exportToPDF = (data: ExportData, options: ExportOptions = {}) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text(options.title || 'Laporan Data POS & Rekap Penjualan', 20, 25);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 20, 35);

  // Date range info
  if (options.dateRange) {
    const { from, to } = options.dateRange;
    let periodText = 'Periode: ';
    if (!from && !to) {
      periodText += 'Semua Waktu';
    } else {
      const fromStr = from ? from.toISOString().slice(0, 10) : 'awal';
      const toStr = to ? to.toISOString().slice(0, 10) : 'akhir';
      periodText += `${fromStr} s/d ${toStr}`;
    }
    doc.text(periodText, 20, 42);
  }

  let yPosition = options.dateRange ? 55 : 50;

  // Statistics
  const salesArray = getArray<Sale>(data.sales);
  const customersArray = getArray<Customer>(data.customers);
  const productsArray = getArray<Product>(data.products);
  const channelsArray = getArray<Channel>(data.channels);
  const paymentsArray = getArray<Payment>(data.payments);
  const adminsArray = getArray<Admin>(data.admins);

  const totalOrders = salesArray.length;
  const totalRevenue = salesArray.reduce((sum, sale) => sum + (sale.price || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text('Ringkasan:', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.text(`Total Penjualan: ${totalOrders.toLocaleString()} transaksi`, 25, yPosition);
  yPosition += 7;
  doc.text(`Total Pendapatan: ${formatCurrency(totalRevenue)}`, 25, yPosition);
  yPosition += 7;
  doc.text(`Rata-rata per Transaksi: ${formatCurrency(averageOrderValue)}`, 25, yPosition);
  yPosition += 15;

  // Sales table (only if sales are included or no sections specified)
  if (salesArray.length > 0 && (!options.sections || options.sections.includes('penjualan'))) {
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Detail Transaksi:', 20, yPosition);
    yPosition += 10;

    const salesTableData = salesArray.map(sale => {
      const customer = customersArray.find(c => c.id === getId(sale.customer));
      const product = productsArray.find(p => p.id === getId(sale.product));
      const channel = channelsArray.find(c => c.id === getId(sale.channel));
      const payment = paymentsArray.find(p => p.id === getId(sale.payment));
      const admin = adminsArray.find(a => a.id === getId(sale.admin));

      return [
        formatDate(sale.date),
        customer?.name || '-',
        product?.name || '-',
        channel?.name || '-',
        formatCurrency(sale.price),
        payment?.name || '-',
        admin?.name || '-'
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Tanggal', 'Pelanggan', 'Produk', 'Channel', 'Harga', 'Pembayaran', 'Admin']],
      body: salesTableData,
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        4: { halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // Add new page if needed
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }

  // Summary by channel (only if sales are included)
  if (salesArray.length > 0 && (!options.sections || options.sections.includes('penjualan'))) {
    const channelStats = new Map();
    salesArray.forEach(sale => {
      const channel = channelsArray.find(c => c.id === getId(sale.channel));
      const channelName = channel?.name || '-';
      const current = channelStats.get(channelName) || { orders: 0, revenue: 0 };
      current.orders += 1;
      current.revenue += sale.price || 0;
      channelStats.set(channelName, current);
    });

    if (channelStats.size > 0) {
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text('Ringkasan per Channel:', 20, yPosition);
      yPosition += 10;

      const channelTableData = Array.from(channelStats.entries()).map(([name, stats]: [string, any]) => [
        name,
        stats.orders.toLocaleString(),
        formatCurrency(stats.revenue)
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Channel', 'Total Order', 'Total Pendapatan']],
        body: channelTableData,
        styles: {
          fontSize: 10,
          cellPadding: 4
        },
        headStyles: {
          fillColor: [139, 69, 19],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'right' }
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
  }

  // Additional sections based on selected sections
  if (options.sections) {
    // Customers section
    if (options.sections.includes('pelanggan') && customersArray.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text('Data Pelanggan:', 20, yPosition);
      yPosition += 10;

      const customerTableData = customersArray.map(customer => [
        customer.name,
        customer.username,
        customer.note || '-'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Nama', 'Username', 'Catatan']],
        body: customerTableData,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [40, 167, 69], textColor: 255, fontStyle: 'bold' },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Products section
    if (options.sections.includes('produk') && productsArray.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text('Data Produk:', 20, yPosition);
      yPosition += 10;

      const productTableData = productsArray.map(product => [
        product.name,
        product.type,
        product.sku
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Nama', 'Tipe', 'SKU']],
        body: productTableData,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [23, 162, 184], textColor: 255, fontStyle: 'bold' },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Channels section
    if (options.sections.includes('channel') && channelsArray.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text('Data Channel:', 20, yPosition);
      yPosition += 10;

      const channelTableData = channelsArray.map(channel => [
        channel.name,
        channel.desc || '-',
        channel.url || '-'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Nama', 'Deskripsi', 'URL']],
        body: channelTableData,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [255, 193, 7], textColor: 0, fontStyle: 'bold' },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Payments section
    if (options.sections.includes('pembayaran') && paymentsArray.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text('Data Metode Pembayaran:', 20, yPosition);
      yPosition += 10;

      const paymentTableData = paymentsArray.map(payment => [
        payment.name,
        payment.desc || '-',
        payment.code
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Nama', 'Deskripsi', 'Kode']],
        body: paymentTableData,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [220, 53, 69], textColor: 255, fontStyle: 'bold' },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Admins section
    if (options.sections.includes('admin') && adminsArray.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text('Data Admin:', 20, yPosition);
      yPosition += 10;

      const adminTableData = adminsArray.map(admin => [
        admin.name,
        admin.username,
        admin.note || '-'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Nama', 'Username', 'Catatan']],
        body: adminTableData,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [108, 117, 125], textColor: 255, fontStyle: 'bold' },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Halaman ${i} dari ${pageCount} - POS & Rekap Penjualan`,
      20,
      doc.internal.pageSize.height - 10
    );
  }

  // Save the PDF
  const filename = `laporan-pos-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
