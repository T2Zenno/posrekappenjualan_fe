import React from 'react';
import { Card } from "@/components/ui/card";
import { useData } from '@/hooks/useData';
import { formatCurrency, formatDate } from '@/utils/formatters';

const Dashboard: React.FC = () => {
  const { sales, customers, products, channels, payments, admins } = useData();

  // Calculate KPIs
  const totalOrders = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Get top channel by revenue
  const channelRevenue = sales.reduce((acc, sale) => {
    acc[sale.channel] = (acc[sale.channel] || 0) + (sale.price || 0);
    return acc;
  }, {} as Record<string, number>);

  const topChannelId = Object.entries(channelRevenue).reduce(
    (max, [channelId, revenue]) => revenue > max.revenue ? { channelId, revenue } : max,
    { channelId: '', revenue: -1 }
  ).channelId;

  const topChannel = channels.find(c => c.id === topChannelId)?.name || '-';

  // Last 7 days data
  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - i));
    return date.toISOString().slice(0, 10);
  });

  const dailyStats = last7Days.map(date => {
    const daySales = sales.filter(sale => sale.date === date);
    return {
      date,
      orders: daySales.length,
      revenue: daySales.reduce((sum, sale) => sum + (sale.price || 0), 0)
    };
  });

  // Current month by channel
  const currentMonth = now.toISOString().slice(0, 7);
  const monthSales = sales.filter(sale => sale.date.startsWith(currentMonth));
  const channelStats = channels.map(channel => {
    const channelSales = monthSales.filter(sale => sale.channel === channel.id);
    return {
      name: channel.name,
      orders: channelSales.length,
      revenue: channelSales.reduce((sum, sale) => sum + (sale.price || 0), 0)
    };
  }).filter(stat => stat.orders > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gradient">Dashboard Monitoring</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Order</p>
                <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Pendapatan</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Rata-rata Order</p>
                <p className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <span className="text-2xl">🛣️</span>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Channel Teratas</p>
                <p className="text-lg font-bold truncate">{topChannel}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last 7 Days */}
        <Card className="glass">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ringkasan 7 Hari Terakhir</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 text-sm text-muted-foreground">Tanggal</th>
                    <th className="text-right py-2 text-sm text-muted-foreground">Order</th>
                    <th className="text-right py-2 text-sm text-muted-foreground">Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyStats.map((stat, index) => (
                    <tr key={stat.date} className="border-b border-border/30 hover:bg-accent/20">
                      <td className="py-3 text-sm">{formatDate(stat.date)}</td>
                      <td className="py-3 text-sm text-right">{stat.orders}</td>
                      <td className="py-3 text-sm text-right font-medium">
                        {formatCurrency(stat.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Channel Performance */}
        <Card className="glass">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performa per Channel (Bulan Ini)</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 text-sm text-muted-foreground">Channel</th>
                    <th className="text-right py-2 text-sm text-muted-foreground">Order</th>
                    <th className="text-right py-2 text-sm text-muted-foreground">Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {channelStats.length > 0 ? (
                    channelStats.map((stat) => (
                      <tr key={stat.name} className="border-b border-border/30 hover:bg-accent/20">
                        <td className="py-3 text-sm font-medium">{stat.name}</td>
                        <td className="py-3 text-sm text-right">{stat.orders}</td>
                        <td className="py-3 text-sm text-right font-medium">
                          {formatCurrency(stat.revenue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-muted-foreground">
                        Belum ada data bulan ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;