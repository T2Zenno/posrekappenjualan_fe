import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Shield } from 'lucide-react';
import { toast } from "sonner";

interface LoginFormProps {
  onLogin: (isAuthenticated: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call CSRF cookie endpoint before login
      await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        credentials: 'include',
      });

      // Get CSRF token from cookie
      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
      };

      const xsrfToken = getCookie('XSRF-TOKEN');

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(xsrfToken && { 'X-XSRF-TOKEN': xsrfToken }),
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('pos-authenticated', 'true');
        localStorage.setItem('pos-token', data.data.token);
        onLogin(true);
        toast.success('Login berhasil! Selamat datang di POS System');
      } else {
        toast.error(data.message || 'Login gagal!');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat login');
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

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:bg-primary-hover"
              disabled={loading}
            >
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </Button>
          </form>

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