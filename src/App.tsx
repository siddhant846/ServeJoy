import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'sonner';

import { PosPage } from './pages/PosPage';
import { WaiterPage } from './pages/WaiterPage';
import { KitchenPage } from './pages/KitchenPage';
import { CustomerMenuPage } from './pages/CustomerMenuPage';
import { LoginPage } from './pages/LoginPage';
import { McpConsentPage } from './pages/McpConsentPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 300000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="loader-ring h-10 w-10 border-4" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<PosPage />} />
              <Route path="/waiter" element={<WaiterPage />} />
              <Route path="/kitchen" element={<KitchenPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<LoginPage />} />
              <Route path="/menu/:userId" element={<CustomerMenuPage />} />
              <Route path="/.lovable/oauth/consent" element={<McpConsentPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>

          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '1.25rem',
                fontSize: '0.8125rem',
                boxShadow: 'var(--shadow-elevated)',
                fontFamily: 'DM Sans, sans-serif',
              },
            }}
          />
        </BrowserRouter>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;

