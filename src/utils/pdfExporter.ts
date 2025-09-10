import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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

export const exportToPDF = (data: ExportData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Laporan Data POS & Rekap Penjualan', 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 20, 35);
  
  let yPosition = 50;
  
  // Statistics
  const totalOrders = data.sales.length;
  const totalRevenue = data.sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
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
  
  // Sales table
  if (data.sales.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Detail Transaksi:', 20, yPosition);
    yPosition += 10;
    
    const salesTableData = data.sales.map(sale => {
      const customer = data.customers.find(c => c.id === sale.customer);
      const product = data.products.find(p => p.id === sale.product);
      const channel = data.channels.find(c => c.id === sale.channel);
      const payment = data.payments.find(p => p.id === sale.payment);
      const admin = data.admins.find(a => a.id === sale.admin);
      
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
    
    doc.autoTable({
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
  
  // Summary by channel
  const channelStats = new Map();
  data.sales.forEach(sale => {
    const channel = data.channels.find(c => c.id === sale.channel);
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
    
    doc.autoTable({
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