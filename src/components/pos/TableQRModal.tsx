import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, QrCode, Printer, Wifi, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface TableQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableQRModal: React.FC<TableQRModalProps> = ({ isOpen, onClose }) => {
  const { cafeProfile, networkHost, setNetworkHost } = useApp();
  const [selectedTable, setSelectedTable] = useState<string>('Table 1');
  const [isEditingHost, setIsEditingHost] = useState<boolean>(false);
  const [tempHost, setTempHost] = useState<string>(networkHost);

  if (!isOpen) return null;

  const tables = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Takeaway'];

  const customerMenuUrl = `${networkHost}/menu/${cafeProfile.id}?table=${encodeURIComponent(selectedTable)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(customerMenuUrl)}`;

  const handleSaveHost = () => {
    if (!tempHost.trim()) return;
    setNetworkHost(tempHost.trim());
    setIsEditingHost(false);
  };

  const handlePrintStandee = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to print the table standee.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedTable} Standee - ${cafeProfile.name}</title>
          <style>
            @page { size: A6 portrait; margin: 10mm; }
            body {
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              text-align: center;
              margin: 0;
              padding: 15px;
              color: #1a1a1a;
              background: #fff;
              border: 3px solid #f97316;
              border-radius: 20px;
            }
            .title { font-size: 24px; font-weight: 800; color: #3a1e12; margin-top: 5px; }
            .tagline { font-size: 11px; color: #666; margin-bottom: 12px; }
            .table-badge {
              display: inline-block;
              background: #fff7ed;
              color: #c2410c;
              border: 1.5px solid #fed7aa;
              font-size: 14px;
              font-weight: 800;
              padding: 4px 16px;
              border-radius: 30px;
              margin-bottom: 12px;
            }
            .qr-box {
              display: inline-block;
              background: #fff;
              padding: 10px;
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.06);
            }
            .qr-img { width: 180px; height: 180px; display: block; border-radius: 8px; }
            .instructions { font-size: 13px; font-weight: 700; color: #1f2937; margin-top: 14px; }
            .subtext { font-size: 10px; color: #6b7280; margin-top: 2px; }
            .footer { margin-top: 15px; font-size: 9px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="title">${cafeProfile.name}</div>
          <div class="tagline">${cafeProfile.tagLine}</div>
          <div class="table-badge">${selectedTable.toUpperCase()}</div>
          <br />
          <div class="qr-box">
            <img class="qr-img" src="${qrImageUrl}" alt="Scan QR" />
          </div>
          <div class="instructions">📱 Scan with Phone Camera to Order</div>
          <div class="subtext">Browse Menu • Customise Dishes • Call Waiter</div>
          <div class="subtext" style="margin-top: 4px; font-weight: 600; color: #ea580c;">No App Download Needed</div>
          <div class="footer">Powered by ServeJoy Contactless Dining</div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-elevated">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">Table QR Standee</h3>
              <p className="text-[11px] text-muted-foreground">{selectedTable} • Contactless Dining</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Table Selector */}
        <div className="mt-3">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Choose Table
          </label>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {tables.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTable(t)}
                className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                  selectedTable === t
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-secondary text-foreground hover:bg-muted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Standee Card Preview */}
        <div className="mt-3.5 flex flex-col items-center justify-center rounded-3xl bg-white p-4 text-neutral-900 shadow-md border-2 border-orange-200">
          <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
            Scan with phone camera
          </span>
          <h4 className="font-display text-lg font-extrabold text-neutral-900 mt-0.5">
            {cafeProfile.name}
          </h4>
          <span className="mt-1 inline-block rounded-full bg-orange-100 px-3 py-0.5 text-xs font-extrabold text-orange-700 border border-orange-300">
            {selectedTable}
          </span>

          <div className="my-2.5 flex h-40 w-40 items-center justify-center rounded-2xl bg-white p-2 shadow-inner border border-neutral-200">
            <img
              src={qrImageUrl}
              alt={`QR for ${selectedTable}`}
              className="h-full w-full object-contain rounded-xl"
            />
          </div>

          <p className="text-xs font-bold text-neutral-800 text-center">
            Open Digital Menu & Call Waiter
          </p>
          <p className="text-[10px] text-neutral-500 text-center mt-0.5">
            Instant mobile ordering • No app download needed
          </p>
        </div>

        {/* Network Host Settings */}
        <div className="mt-3 rounded-2xl bg-secondary/50 p-2.5 border border-border space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
              <Wifi className="h-3.5 w-3.5 text-emerald-600" />
              <span>Target Host Address:</span>
            </div>
            <button
              onClick={() => setIsEditingHost(!isEditingHost)}
              className="flex items-center gap-1 text-[11px] font-bold text-accent hover:underline"
            >
              <Edit2 className="h-3 w-3" />
              <span>{isEditingHost ? 'Cancel' : 'Change Host'}</span>
            </button>
          </div>

          {isEditingHost ? (
            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={tempHost}
                onChange={(e) => setTempHost(e.target.value)}
                placeholder="http://192.168.1.14:5173"
                className="flex-1 rounded-xl border border-border bg-card px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                onClick={handleSaveHost}
                className="rounded-xl bg-accent px-3 py-1 text-xs font-bold text-white hover:bg-accent/90"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="font-mono text-[11px] text-foreground truncate select-all">
              {networkHost}
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handlePrintStandee}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition"
        >
          <Printer className="h-4 w-4" />
          <span>Print A6 Acrylic Standee</span>
        </button>
      </div>
    </div>
  );
};

