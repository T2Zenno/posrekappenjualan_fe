import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { Store } from "lucide-react";
import LoginForm from "@/components/LoginForm";
import POSApp from "@/components/POSApp";
import RegisterForm from "@/components/RegisterForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = localStorage.getItem('pos-authenticated') === 'true';
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const handleLogin = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-surface">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary mb-4 mx-auto flex items-center justify-center animate-pulse">
            <Store className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {!isAuthenticated ? ( 
            view === 'login' ? (
              <LoginForm onLogin={handleLogin} onNavigateToRegister={() => setView('register')} />
            ) : (
            <RegisterForm 
                onRegister={(isRegistered: boolean) => {
                  if (isRegistered) {
                    setIsAuthenticated(true);
                  }
                }} 
                onNavigateToLogin={() => setView('login')} />
            )
          ) : (
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<POSApp onLogout={handleLogout} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          )}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
