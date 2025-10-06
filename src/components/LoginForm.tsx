import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Shield } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface LoginFormProps {
  onLogin: (isAuthenticated: boolean) => void;
  onNavigateToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onNavigateToRegister,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ingatSaya, setIngatSaya] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });
      const data = response.data;

      // Jika login sukses (response 200), set authenticated
      if (data.user) {
        localStorage.setItem("pos-authenticated", "true");
        localStorage.setItem("pos-user-data", JSON.stringify(data.user));
        if (ingatSaya) localStorage.setItem("pos-remember", "true");
        onLogin(true);
        toast.success("Login berhasil!");
      } else {
        throw new Error("Respon login tidak valid");
      }
    } catch (error: any) {
      onLogin(false);
      const message =
        error.response?.data?.message || error.message || "Login gagal";
      toast.error(message);
    }   finally {
      setLoading(false);
      // Reset password field on any login attempt (success or failure)
      setPassword("");
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

      <Card className="w-full max-w-md glass">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">
              POS Admin Login
            </h1>
            <p className="text-muted-foreground text-center mt-2">
              Masuk ke sistem Point of Sale
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <Label htmlFor="ingatSaya" className="select-none">
                Ingat Saya
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:bg-primary-hover"
              disabled={loading}
            >
              {loading ? "Memverifikasi..." : "Masuk"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Button
              variant="link"
              onClick={onNavigateToRegister}
              className="p-0 h-auto text-primary hover:text-primary-hover"
            >
              Daftar di sini
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
