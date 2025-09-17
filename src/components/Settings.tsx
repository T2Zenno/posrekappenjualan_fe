import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Download, LogOut, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsProps {
  onLogout: () => void;
  onExport: (options?: { sections?: string[] }) => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout, onExport }) => {
  const { theme, toggleTheme } = useTheme();
  const [exportAll, setExportAll] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const handleLogout = () => {
    if (window.confirm('Yakin ingin logout?')) {
      onLogout();
      toast.success('Berhasil logout.');
    }
  };

  const handleExport = () => {
    const sections = exportAll ? undefined : selectedSections;
    onExport({ sections });
    toast.success('Data berhasil diekspor!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola preferensi dan data aplikasi</p>
      </div>

      

      {/* Export Settings */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Ekspor Data
        </h2>

        <div className="space-y-6">
          {/* Export All */}
          <div className="flex items-center p-4 rounded-lg border-2 border-gray-200 hover:border-primary/50 transition-colors">
            <input
              type="checkbox"
              checked={exportAll}
              onChange={(e) => {
                setExportAll(e.target.checked);
                if (e.target.checked) {
                  setSelectedSections([]);
                }
              }}
              className="mr-3 w-4 h-4"
            />
            <div>
              <p className="font-medium">Semua Data</p>
              <p className="text-sm text-muted-foreground">Ekspor semua data sistem</p>
            </div>
          </div>

          {/* Section Selection */}
          {!exportAll && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Pilih Bagian untuk Diekspor:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'penjualan', label: 'Penjualan', icon: '📊' },
                  { id: 'pelanggan', label: 'Pelanggan', icon: '👥' },
                  { id: 'produk', label: 'Produk', icon: '📦' },
                  { id: 'channel', label: 'Channel', icon: '🚚' },
                  { id: 'pembayaran', label: 'Metode Bayar', icon: '💳' },
                  { id: 'admin', label: 'Admin', icon: '👤' }
                ].map((section) => (
                  <label
                    key={section.id}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSections.includes(section.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSections([...selectedSections, section.id]);
                        } else {
                          setSelectedSections(selectedSections.filter(s => s !== section.id));
                        }
                      }}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="mr-2 text-lg">{section.icon}</span>
                    <span className="font-medium">{section.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={!exportAll && selectedSections.length === 0}
            className="w-full flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Ekspor Data ({exportAll ? 'Semua' : selectedSections.length + ' Bagian'})
          </Button>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <LogOut className="w-5 h-5" />
          Akun
        </h2>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Settings;
