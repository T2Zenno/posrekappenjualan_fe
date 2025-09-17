import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useData } from '@/hooks/useData';
import { Store, ShoppingCart, Users, Package, Route, CreditCard, Settings, BarChart3, FileText, Cog } from 'lucide-react';
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

type ActiveTab = 'dashboard' | 'penjualan' | 'pelanggan' | 'produk' | 'channel' | 'pembayaran' | 'admin' | 'laporan' | 'settings';

interface POSAppProps {
  onLogout: () => void;
}

const POSApp: React.FC<POSAppProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const { exportData } = useData();

  const handleExport = (options?: { sections?: string[] }) => {
    exportData(options);
    toast.success('Data berhasil diekspor!');
  };

  const handleLogout = () => {
    if (window.confirm('Yakin ingin logout?')) {
      localStorage.removeItem('pos-authenticated');
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
    { id: 'admin', label: 'Admin', component: Settings },
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
