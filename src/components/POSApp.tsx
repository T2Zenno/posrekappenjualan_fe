import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useData } from '@/hooks/useData';
import { Store, ShoppingCart, Users, Package, Route, CreditCard, Settings, Zap, Download, RotateCcw, Sun, Moon, LogOut, BarChart3, FileText } from 'lucide-react';
import { toast } from 'sonner';
import Dashboard from './Dashboard';
import SalesManager from './SalesManager';
import CustomerManager from './CustomerManager';
import ProductManager from './ProductManager';
import ChannelManager from './ChannelManager';
import PaymentManager from './PaymentManager';
import AdminManager from './AdminManager';
import Reports from './Reports';

type ActiveTab = 'dashboard' | 'penjualan' | 'pelanggan' | 'produk' | 'channel' | 'pembayaran' | 'admin' | 'laporan';

interface POSAppProps {
  onLogout: () => void;
}

const POSApp: React.FC<POSAppProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const { theme, toggleTheme } = useTheme();
  const { loadDemoData, resetAllData, exportData } = useData();

  const handleDemoLoad = () => {
    loadDemoData();
    toast.success('Data demo berhasil dimuat!');
  };

  const handleReset = () => {
    if (window.confirm('Hapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
      resetAllData();
      toast.success('Semua data telah dihapus.');
    }
  };

  const handleExport = () => {
    exportData();
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
    { id: 'laporan', label: 'Laporan', component: FileText }
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
            
            {/* Toolbar - Mobile Responsive */}
            <div className="flex gap-2 justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDemoLoad} title="Muat data contoh">
                  <Zap className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Demo</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} title="Ekspor semua data">
                  <Download className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Ekspor</span>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleReset} title="Hapus semua data">
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Reset</span>
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  title="Toggle tema"
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  title="Logout"
                  className="text-xs sm:text-sm"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
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
      </main>
    </div>
  );
};

export default POSApp;