import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, UserPlus, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import api from '@/lib/axios';

interface RegisterFormProps {
  onRegister: (isRegistered: boolean) => void;
  onNavigateToLogin: () => void; // Callback untuk navigasi ke halaman login
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegister,
  onNavigateToLogin,
}) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  //   const [email, setEmail] = useState('');
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Beri umpan balik hanya jika pengguna mulai mengetik di konfirmasi password
    if (passwordConfirmation) {
      setPasswordsMatch(password === passwordConfirmation);
    } else {
      setPasswordsMatch(null); // Reset jika kolom konfirmasi kosong
    }
  }, [password, passwordConfirmation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== passwordConfirmation) {
      toast.error("Password dan konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/register', {
        username,
        name,
        password,
        password_confirmation: passwordConfirmation
      });

      toast.success(
        "Registrasi berhasil! Anda akan diarahkan ke halaman login."
      );
      onRegister(true); // Memberi tahu komponen induk bahwa registrasi berhasil
      onNavigateToLogin(); // Mengarahkan pengguna ke halaman login
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan saat registrasi.");
      console.error("Registration error:", error.message);
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
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Card className="w-full max-w-md glass animate-fade-in-down">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary mb-4 flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">
              Daftar Akun Baru
            </h1>
            <p className="text-muted-foreground text-center mt-2">
              Buat akun untuk mengakses sistem Point of Sale
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Masukkan Nama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="glass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
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
                name="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass"
              />
            </div>

            <div className="relative space-y-2">
              <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  placeholder="Konfirmasi password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  className={`glass pr-10 ${
                    passwordsMatch === true
                      ? "focus-visible:ring-green-500 border-green-500"
                      : passwordsMatch === false
                      ? "focus-visible:ring-red-500 border-red-500"
                      : ""
                  }`}
                />
                {passwordsMatch === true && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
                {passwordsMatch === false && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
              </div>
              {passwordsMatch === false && (
                <p className="text-xs text-red-500 mt-1">
                  Password tidak cocok.
                </p>
              )}
              {passwordsMatch === true && (
                <p className="text-xs text-green-500 mt-1">
                  Password cocok!
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:bg-primary-hover animate-slide-up"
              disabled={loading}
            >
              {loading ? "Mendaftar..." : "Daftar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Button
              variant="link"
              onClick={onNavigateToLogin}
              className="p-0 h-auto text-primary hover:text-primary-hover"
            >
              Masuk di sini
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterForm;
