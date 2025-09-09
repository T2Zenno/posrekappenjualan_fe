import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-surface">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary mb-6 mx-auto flex items-center justify-center">
          <span className="text-2xl">🔍</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! Halaman tidak ditemukan</p>
        <Button asChild className="bg-gradient-primary">
          <a href="/">Kembali ke Beranda</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
