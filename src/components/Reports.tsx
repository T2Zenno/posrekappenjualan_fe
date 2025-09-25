import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useData, type Sale } from '@/hooks/useData';
import { formatCurrency, formatDate, parseDate, isDateBetween } from '@/utils/formatters';
import { Download, Package, DollarSign, TrendingUp, FileText } from 'lucide-react';

const Reports: React.FC = () => {
  const { sales, customers, products, channels, payments, admins } = useData();
  const [preset, setPreset] = useState('bulanan');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Preset options for combobox
  const presetOptions: ComboboxOption[] = [
    { value: 'harian', label: 'Harian (hari ini)' },
    { value: 'mingguan', label: 'Mingguan (minggu ini)' },
    { value: 'bulanan', label: 'Bulanan (bulan ini)' },
    { value: 'tahunan', label: 'Tahunan (tahun ini)' },
    { value: 'alltime', label: 'Semua Waktu' },
    { value: 'custom', label: 'Custom…' }
  ];

  // Get date range based on preset
  const getDateRange = (presetValue: string) => {
    const now = new Date();
    let from: Date | null = null;
    let to: Date | null = null;

    switch (presetValue) {
      case 'harian': {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      }
      case 'mingguan': {
        const day = (now.getDay() + 6) % 7; // Monday = 0
        from = new Date(now);
        from.setDate(now.getDate() - day);
        to = new Date(from);
        to.setDate(from.getDate() + 6);
        to.setHours(23, 59, 59, 999);
        break;
      }
      case 'bulanan': {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      }
      case 'tahunan': {
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      }
      case 'alltime': {
        from = null;
        to = null;
        break;
      }
      case 'custom': {
        from = parseDate(dateFrom);
        to = parseDate(dateTo);
        if (to) to.setHours(23, 59, 59, 999);
        break;
      }
    }

    return { from, to };
  };

  const { from, to } = getDateRange(preset);

  // Filter sales based on date range
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = parseDate(sale.date);
      return isDateBetween(saleDate, from, to);
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [sales, from, to]);

  // Helper function to get safe price
  const getSafePrice = (price: number | string | null | undefined) => {
    const num = Number(price);
    return isNaN(num) ? 0 : num;
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + getSafePrice(sale.price), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalOrders, totalRevenue, averageOrderValue };
  }, [filteredSales]);

  // Aggregate by different dimensions
  const aggregateBy = (keyFn: (sale: Sale) => string) => {
    const map = new Map<string, { orders: number; revenue: number }>();

    filteredSales.forEach(sale => {
      const key = keyFn(sale);
      const current = map.get(key) || { orders: 0, revenue: 0 };
      current.orders += 1;
      current.revenue += getSafePrice(sale.price);
      map.set(key, current);
    });

    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }));
  };

  const channelStats = aggregateBy(sale => sale.channel?.name || 'N/A');

  const productStats = aggregateBy(sale => sale.product?.name || 'N/A');

  const adminStats = aggregateBy(sale => sale.admin?.name || 'N/A');

  const handleExportPDF = () => {
    const exportData = {
      sales: filteredSales,
      customers,
      products,
      channels,
      payments,
      admins
    };

    // Import the PDF exporter function
    import('@/utils/pdfExporter').then(({ exportToPDF }) => {
      exportToPDF(exportData, {
        dateRange: { from, to },
        title: 'Laporan Rekapan Penjualan'
      });
    });
  };

  const formatPeriod = () => {
    if (!from && !to) return 'Semua Waktu';
    const fromStr = from ? from.toISOString().slice(0, 10) : 'awal';
    const toStr = to ? to.toISOString().slice(0, 10) : 'akhir';
    return `${fromStr} s/d ${toStr}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gradient">Rekapan Penjualan</h1>

            <div className="flex flex-wrap gap-2 items-center no-print">
              <Combobox
                options={presetOptions}
                value={preset}
                onValueChange={setPreset}
                className="w-48 glass"
              />

              {preset === 'custom' && (
                <>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="glass"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="glass"
                  />
                </>
              )}

              <Button variant="default" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Print Header */}
          <div className="hidden print:block mb-6">
            <h2 className="text-xl font-bold mb-2">Rekapan Penjualan</h2>
            <p>Periode: {formatPeriod()}</p>
            <p>Dicetak: {new Date().toLocaleString('id-ID')}</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="glass">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-muted-foreground text-sm">Total Order</p>
                    <p className="text-xl font-bold">{stats.totalOrders.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-accent" />
                  <div>
                    <p className="text-muted-foreground text-sm">Pendapatan</p>
                    <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-success" />
                  <div>
                    <p className="text-muted-foreground text-sm">Rata-rata Order</p>
                    <p className="text-xl font-bold">{formatCurrency(stats.averageOrderValue)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-sm">Periode</p>
                    <p className="text-sm font-bold">{formatPeriod()}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Analysis Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {/* By Channel */}
            <Card className="glass">
              <div className="p-4">
                <h3 className="font-semibold mb-3">Per Channel</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2">Channel</th>
                        <th className="text-right py-2">Order</th>
                        <th className="text-right py-2">Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelStats.length > 0 ? (
                        channelStats.map((stat) => (
                          <tr key={stat.name} className="border-b border-border/30">
                            <td className="py-2 font-medium">{stat.name}</td>
                            <td className="py-2 text-right">{stat.orders}</td>
                            <td className="py-2 text-right">{formatCurrency(stat.revenue)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-muted-foreground">
                            Tidak ada data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            {/* By Product */}
            <Card className="glass">
              <div className="p-4">
                <h3 className="font-semibold mb-3">Per Produk</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2">Produk</th>
                        <th className="text-right py-2">Order</th>
                        <th className="text-right py-2">Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productStats.length > 0 ? (
                        productStats.map((stat) => (
                          <tr key={stat.name} className="border-b border-border/30">
                            <td className="py-2 font-medium">{stat.name}</td>
                            <td className="py-2 text-right">{stat.orders}</td>
                            <td className="py-2 text-right">{formatCurrency(stat.revenue)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-muted-foreground">
                            Tidak ada data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            {/* By Admin */}
            <Card className="glass">
              <div className="p-4">
                <h3 className="font-semibold mb-3">Per Admin</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2">Admin</th>
                        <th className="text-right py-2">Order</th>
                        <th className="text-right py-2">Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminStats.length > 0 ? (
                        adminStats.map((stat) => (
                          <tr key={stat.name} className="border-b border-border/30">
                            <td className="py-2 font-medium">{stat.name}</td>
                            <td className="py-2 text-right">{stat.orders}</td>
                            <td className="py-2 text-right">{formatCurrency(stat.revenue)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-muted-foreground">
                            Tidak ada data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>

          {/* Detail Transactions */}
          <Card className="glass">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Detail Transaksi</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2">Tanggal</th>
                      <th className="text-left py-2">Pelanggan</th>
                      <th className="text-left py-2">Produk</th>
                      <th className="text-left py-2">Channel</th>
                      <th className="text-right py-2 pr-4">Harga</th>
                      <th className="text-left py-2 pl-4">Metode</th>
                      <th className="text-left py-2">Admin</th>
                      <th className="text-left py-2">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.length > 0 ? (
                      filteredSales.map((sale) => {
                        const customer = customers.find(c => c.id === sale.customer.id);
                        const product = products.find(p => p.id === sale.product.id);
                        const channel = channels.find(c => c.id === sale.channel.id);
                        const payment = payments.find(p => p.id === sale.payment.id);
                        const admin = admins.find(a => a.id === sale.admin.id);

                        return (
                          <tr key={sale.id} className="border-b border-border/30">
                            <td className="py-2">{formatDate(sale.date)}</td>
                            <td className="py-2">{customer?.name || '-'}</td>
                            <td className="py-2">{product?.name || '-'}</td>
                            <td className="py-2">{channel?.name || '-'}</td>
                            <td className="py-2 text-right font-medium pr-4">{formatCurrency(sale.price)}</td>
                            <td className="py-2 pl-4">{payment?.name || '-'}</td>
                            <td className="py-2">{admin?.name || '-'}</td>
                            <td className="py-2 max-w-32 truncate" title={sale.note}>{sale.note || '-'}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          Tidak ada transaksi pada periode ini
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
