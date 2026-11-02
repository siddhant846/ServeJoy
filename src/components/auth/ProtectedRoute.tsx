import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { subscriptionService } from '../../services/subscriptionService';
import { AuthUser, UserRole } from '../../types';
import { PricingPage } from '../../pages/PricingPage';
import { Lock, ShieldAlert, Sparkles, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const unsub = authService.subscribe(setCurrentUser);
    return () => unsub();
  }, []);

  // 1. Authentication Check
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role-Based Access Control (RBAC) Check
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // If a waiter tries to visit /kitchen or cashier tries to visit owner-only routes, redirect gracefully
    toast.error(`Access restricted. Your role is ${currentUser.role.toUpperCase()}.`);
    if (currentUser.role === 'waiter') {
      return <Navigate to="/waiter" replace />;
    }
    if (currentUser.role === 'kitchen') {
      return <Navigate to="/kitchen" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // 3. Subscription & 7-Day Trial Expiry Check
  const subInfo = subscriptionService.getSubscriptionInfo(currentUser.businessId);

  if (subInfo.isExpired) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6">
          <div className="rounded-3xl border border-destructive/40 bg-card p-6 sm:p-8 text-center shadow-elevated space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
              <Lock className="h-7 w-7" />
            </div>

            <div>
              <span className="inline-block rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive mb-2 uppercase tracking-wider">
                {subInfo.isTrial ? '7-Day Free Trial Expired' : 'Subscription Expired'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                Your ServeJoy Free Trial Has Concluded
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
                All your customer records, past bills, and menu items remain <strong>safely preserved</strong>. Select a plan below to resume active counter billing and voice announcements.
              </p>
            </div>

            {currentUser.isOwner ? (
              <div className="pt-2">
                <PricingPage
                  isModal={true}
                  onPlanSelected={(tier, cycle) => {
                    subscriptionService.activatePlan(tier, cycle, `ref_${Date.now()}`, currentUser.businessId);
                    toast.success(`Welcome to ServeJoy ${tier.toUpperCase()}!`, { icon: '🎉' });
                    window.location.reload();
                  }}
                />
              </div>
            ) : (
              <div className="rounded-2xl bg-secondary/80 p-4 max-w-md mx-auto text-xs text-muted-foreground">
                <p>
                  Please contact your restaurant owner (<strong>{currentUser.email}</strong>) to renew the ServeJoy subscription for this terminal.
                </p>
                <button
                  onClick={() => {
                    authService.logout();
                    window.location.href = '/login';
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-destructive/10 text-destructive px-3.5 py-1.5 font-bold hover:bg-destructive/20 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out of Terminal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

