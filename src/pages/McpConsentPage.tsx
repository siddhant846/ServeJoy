import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Coffee, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const McpConsentPage: React.FC = () => {
  const { cafeProfile } = useApp();
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

  const handleAuthorize = () => {
    setIsAuthorizing(true);
    toast.success('MCP Agent Client Authorized successfully!');
    setTimeout(() => {
      window.location.href = '/';
    }, 1200);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-card p-6 shadow-elevated border border-border text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[#372215] text-amber-200 shadow-md">
          <Coffee className="h-7 w-7 text-amber-200" />
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-foreground">MCP Agent Authorization</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Allow AI Agent MCP access to {cafeProfile.name}?
          </p>
        </div>

        <div className="rounded-2xl bg-secondary/50 p-3.5 text-left text-xs space-y-2 border border-border/60">
          <p className="font-bold text-foreground">Requested Tool Scopes:</p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>list_menu_items (view menu dishes)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>list_recent_bills (view receipts)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>sales_summary (revenue & KPIs)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>list_orders (active KOT tickets)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>create_menu_item (append dishes)</span>
            </li>
          </ul>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleAuthorize}
            disabled={isAuthorizing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition active:scale-98 disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{isAuthorizing ? 'Granting Access...' : 'Authorize MCP Agent'}</span>
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full text-xs text-muted-foreground hover:text-foreground py-1"
          >
            Cancel & Return
          </button>
        </div>
      </div>
    </div>
  );
};

