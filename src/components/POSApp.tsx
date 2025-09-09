import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useTheme } from '@/contexts/ThemeContext';
import { useData } from '@/hooks/useData';
import { Sun, Moon, Zap, Download, Upload, RotateCcw } from 'lucide-react';
import { toast } from "sonner";

// Import components (will be created next)
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
  const { loadDemoData, resetAllData, exportData, importData } = useData();

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

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importData(file);
          toast.success('Data berhasil diimpor!');
        } catch {
          toast.error('File tidak valid atau terjadi kesalahan.');
        }
      }
    };
    input.click();
  };

  const handleLogout = () => {
    if (window.confirm('Yakin ingin logout?')) {
      localStorage.removeItem('pos-authenticated');
      onLogout();
      toast.success('Berhasil logout.');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'penjualan', label: 'Penjualan', icon: '🛒' },
    { id: 'pelanggan', label: 'Pelanggan', icon: '👥' },
    { id: 'produk', label: 'Produk', icon: '📦' },
    { id: 'channel', label: 'Channel', icon: '🛣️' },
    { id: 'pembayaran', label: 'Metode Bayar', icon: '💳' },
    { id: 'admin', label: 'Admin', icon: '⚙️' },
    { id: 'laporan', label: 'Laporan', icon: '📋' }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <span className="text-xl">🏪</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">POS & Rekap Penjualan</h1>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-wrap gap-2 pb-4 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className="flex-shrink-0"
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
            
            <div className="flex-1" />
            
            {/* Toolbar */}
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleDemoLoad} title="Muat data contoh">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Demo</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} title="Ekspor semua data">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Ekspor</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleImport} title="Impor data dari JSON">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Impor</span>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleReset} title="Hapus semua data">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
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
              >
                Logout
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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