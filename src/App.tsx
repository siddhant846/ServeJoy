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
import { PricingPage } from './pages/PricingPage';
import { McpConsentPage } from './pages/McpConsentPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SuperAdminPage } from './pages/SuperAdminPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminProtectedRoute } from './components/auth/AdminProtectedRoute';

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
              {/* Protected Restaurant Operations */}
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'manager', 'cashier']}>
                    <PosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/waiter"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'manager', 'waiter']}>
                    <WaiterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kitchen"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'manager', 'kitchen']}>
                    <KitchenPage />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin Master Platform Console */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <SuperAdminPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/superadmin"
                element={
                  <AdminProtectedRoute>
                    <SuperAdminPage />
                  </AdminProtectedRoute>
                }
              />

              {/* Public Marketing, Authentication & Customer Menu Routes */}
              <Route path="/pricing" element={<PricingPage />} />
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

