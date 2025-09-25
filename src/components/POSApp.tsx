import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useData } from '@/hooks/useData';
import { useTheme } from '@/contexts/ThemeContext';
import { Store, ShoppingCart, Users, Package, Route, CreditCard, Users2, BarChart3, FileText, Cog, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import Dashboard from './Dashboard';
import SalesManager from './SalesManager';
import CustomerManager from './CustomerManager';
import ProductManager from './ProductManager';
import ChannelManager from './ChannelManager';
import PaymentManager from './PaymentManager';
import AdminManager from './AdminManager';
import Reports from './Reports';
import SettingsComponent from './Settings';
import api from '@/lib/axios';

type ActiveTab = 'dashboard' | 'penjualan' | 'pelanggan' | 'produk' | 'channel' | 'pembayaran' | 'admin' | 'laporan' | 'settings';

interface POSAppProps {
  onLogout: () => void;
}

const POSApp: React.FC<POSAppProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const { exportData } = useData();
  const { theme, toggleTheme } = useTheme();

  const handleExport = (options?: { sections?: string[] }) => {
    exportData(options);
    toast.success('Data berhasil diekspor!');
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');

      // Tidak perlu memeriksa response.ok secara ketat untuk logout,
      // karena kita tetap ingin menghapus state lokal bahkan jika API gagal
      // (misalnya, token sudah kadaluarsa di server).
    } catch (error: any) {
      console.error("Logout API call failed, but logging out locally.", error.response?.data?.message || error.message);
    } finally {
      localStorage.removeItem('pos-authenticated');
      localStorage.removeItem('pos-auth-token');
      localStorage.removeItem('pos-user-data');
      onLogout();
      toast.success('Berhasil logout.');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: BarChart3 },
    { id: 'penjualan', label: 'Penjualan', component: ShoppingCart },
    { id: 'pelanggan', label: 'Pelanggan', component: Users },
    { id: 'produk', label: 'Produk', component: Package },
    { id: 'channel', label: 'Channel', component: Route },
    { id: 'pembayaran', label: 'Metode Bayar', component: CreditCard },
    { id: 'admin', label: 'Admin', component: Users2 },
    { id: 'laporan', label: 'Laporan', component: FileText },
    { id: 'settings', label: 'Pengaturan', component: Cog }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">POS & Rekap Penjualan</h1>
              </div>
            </div>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
                aria-label="Ganti Tema"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>

          {/* Navigation - Mobile Responsive */}
          <nav className="flex flex-col gap-4">
            {/* Navigation Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => {
                const IconComponent = tab.component;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className="whitespace-nowrap min-w-fit flex-shrink-0"
                  >
                    <IconComponent className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Button>
                );
              })}
            </div>


          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'penjualan' && <SalesManager />}
        {activeTab === 'pelanggan' && <CustomerManager />}
        {activeTab === 'produk' && <ProductManager />}
        {activeTab === 'channel' && <ChannelManager />}
        {activeTab === 'pembayaran' && <PaymentManager />}
        {activeTab === 'admin' && <AdminManager />}
        {activeTab === 'laporan' && <Reports />}
        {activeTab === 'settings' && <SettingsComponent onLogout={handleLogout} onExport={handleExport} />}
      </main>
    </div>
  );
};

export default POSApp;
