import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Shield } from 'lucide-react';
import { toast } from "sonner";
import api from '@/lib/axios';

interface LoginFormProps {
  onLogin: (isAuthenticated: boolean) => void; 
  onNavigateToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onNavigateToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ingatSaya, setIngatSaya] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/login', { username, password });
      const data = response.data;
      // Asumsi API mengembalikan token dan data user
      localStorage.setItem('pos-authenticated', 'true'); // Tandai pengguna sebagai terautentikasi
      localStorage.setItem('pos-auth-token', data.token); // Simpan token jika ada
      localStorage.setItem('pos-user-data', JSON.stringify(data.user)); // Simpan data user jika ada
      console.log('User data:', data.user);

      if (ingatSaya) {
        localStorage.setItem('pos-remember', 'true');
        localStorage.setItem('pos-user-data', JSON.stringify(data.user)); // Simpan data user juga jika "Ingat Saya" aktif
      } else {
        localStorage.removeItem('pos-remember');
      }
      onLogin(true);
      toast.success(data.message || 'Login berhasil! Selamat datang di POS System');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login gagal. Periksa username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-surface p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>
      
      <Card className="w-full max-w-md glass">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">POS Admin Login</h1>
            <p className="text-muted-foreground text-center mt-2">
              Masuk ke sistem Point of Sale
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="glass"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="ingatSaya"
                type="checkbox"
                checked={ingatSaya}
                onChange={(e) => setIngatSaya(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="ingatSaya" className="select-none">Ingat Saya</Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:bg-primary-hover"
              disabled={loading}
            >
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun? <Button variant="link" onClick={onNavigateToRegister} className="p-0 h-auto text-primary hover:text-primary-hover">Daftar di sini</Button>
          </p>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Demo Login:</strong><br />
              Username: <code>testuser</code><br />
              Password: <code>password</code>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;