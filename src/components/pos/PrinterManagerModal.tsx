import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Printer } from '../../types';
import { thermalPrinter } from '../../services/printerService';
import {
  X,
  Printer as PrinterIcon,
  Bluetooth,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Star,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface PrinterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrinterManagerModal: React.FC<PrinterManagerModalProps> = ({ isOpen, onClose }) => {
  const { printers, activePrinter, setActivePrinter, addPrinter, removePrinter, setDefaultPrinter, cafeProfile } = useApp();

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showManualAdd, setShowManualAdd] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>('MPT-II');
  const [manualWidth, setManualWidth] = useState<'58mm' | '80mm'>('58mm');

  if (!isOpen) return null;

  const isBleSupported = thermalPrinter.isBluetoothSupported();
  const isSerialSupported = thermalPrinter.isSerialSupported();
  const { isIOS, browserName } = thermalPrinter.getPlatformInfo();

  const handleScanAndPair = async () => {
    setIsScanning(true);
    try {
      const res = await thermalPrinter.pairNewPrinter();
      if (res.success && res.printer) {
        toast.success(`Paired and saved: ${res.printer.name}!`, { icon: '📶' });
        setActivePrinter(res.printer);
      } else {
        toast.error(res.error || 'Bluetooth pairing was not completed.');
      }
    } catch (e: any) {
      toast.error('Bluetooth search failed: ' + (e.message || String(e)));
    } finally {
      setIsScanning(false);
    }
  };

  const handlePairSerial = async () => {
    setIsScanning(true);
    try {
      const res = await thermalPrinter.pairSerialPrinter();
      if (res.success && res.printer) {
        toast.success(`Connected: ${res.printer.name}!`, { icon: '🔌' });
        setActivePrinter(res.printer);
      } else {
        toast.error(res.error || 'Serial/COM port selection was not completed.');
      }
    } catch (e: any) {
      toast.error('Connection failed: ' + (e.message || String(e)));
    } finally {
      setIsScanning(false);
    }
  };

  const handleTestPrint = async (printer: Printer) => {
    setTestingId(printer.id);
    try {
      const testBytes = thermalPrinter.buildTestEscPos(cafeProfile, printer.paperWidth);
      const res = await thermalPrinter.printEscPosBytes(testBytes, printer.name);

      if (res.success) {
        toast.success(res.message, { icon: '🖨️' });
      } else {
        toast.error(res.errorReason || res.message || 'Test print failed.');
      }
    } catch (err: any) {
      toast.error('Print error: ' + (err.message || String(err)));
    } finally {
      setTestingId(null);
    }
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      toast.error('Please enter a printer name');
      return;
    }
    const created = addPrinter(manualName.trim(), manualWidth);
    setActivePrinter(created);
    setShowManualAdd(false);
    toast.success(`Added ${created.name} to saved printers!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-elevated max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <PrinterIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">Available Thermal Printers</h3>
              <p className="text-[11px] text-muted-foreground">Saved Bluetooth & ESC/POS Devices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Browser & OS Info Banner */}
        <div className="mt-3.5 space-y-2">
          {isBleSupported ? (
            <div className="flex items-start gap-2 rounded-2xl bg-emerald-500/10 p-3 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold">Web Bluetooth Enabled ({browserName})</p>
                <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400 mt-0.5">
                  Direct ESC/POS Bluetooth Low Energy printing is supported on your device.
                </p>
              </div>
            </div>
          ) : isIOS ? (
            <div className="flex items-start gap-2.5 rounded-2xl bg-amber-500/10 p-3 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
              <HelpCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">iPhone / iOS Safari Notice</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Apple Safari does not allow web apps to access Bluetooth directly. You have 2 simple solutions:
                </p>
                <ul className="text-[11px] space-y-1 list-disc pl-3 text-muted-foreground">
                  <li>
                    <strong>AirPrint / PDF:</strong> Tap the <strong>"PDF"</strong> button on the receipt to print to any printer installed on your phone.
                  </li>
                  <li>
                    <strong>Direct BLE:</strong> Open this website in the free <strong>Bluefy Web BLE Browser</strong> app from the App Store.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-2xl bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Web Bluetooth Not Detected</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Please use Google Chrome, Microsoft Edge, or the Android app for direct Bluetooth printing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Saved Printers List */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
            <span>Saved Devices ({printers.length})</span>
            <span className="text-[10px] text-accent font-semibold">Select to set active</span>
          </div>

          {printers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center">
              <PrinterIcon className="h-8 w-8 text-muted-foreground/50 mb-1.5" />
              <p className="text-xs font-semibold text-foreground">No thermal printers saved</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Pair a Bluetooth printer below to save it for future receipts.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {printers.map((printer) => {
                const isActive = activePrinter?.id === printer.id;
                const isTesting = testingId === printer.id;

                return (
                  <div
                    key={printer.id}
                    onClick={() => setActivePrinter(printer)}
                    className={`flex items-center justify-between rounded-2xl p-3 border transition cursor-pointer ${
                      isActive
                        ? 'border-accent bg-accent/5 ring-1 ring-accent/30 shadow-sm'
                        : 'border-border bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          isActive ? 'bg-accent text-white' : 'bg-card text-muted-foreground border border-border'
                        }`}
                      >
                        <Bluetooth className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-foreground">{printer.name}</h4>
                          {isActive && (
                            <span className="flex items-center gap-0.5 rounded-full bg-accent/15 px-1.5 py-0.2 text-[9px] font-bold text-accent">
                              Active
                            </span>
                          )}
                          {printer.isDefault && (
                            <span className="flex items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-bold text-amber-600">
                              <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span>Paper: {printer.paperWidth}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                            {isActive ? 'Ready for print' : 'Saved'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleTestPrint(printer)}
                        disabled={isTesting}
                        title="Send diagnostic test print"
                        className="rounded-xl bg-card border border-border px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted active:scale-95 transition disabled:opacity-50"
                      >
                        {isTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Test'}
                      </button>

                      {!printer.isDefault && (
                        <button
                          onClick={() => setDefaultPrinter(printer.id)}
                          title="Set as Default Printer"
                          className="p-1.5 text-muted-foreground hover:text-amber-500 transition"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => removePrinter(printer.id)}
                        title="Delete from saved printers"
                        className="p-1.5 text-muted-foreground hover:text-destructive transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Scan & Pair Button */}
        <div className="mt-4 pt-3 border-t border-border space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleScanAndPair}
              disabled={isScanning}
              className="flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 px-2 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition active:scale-98 disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Scanning BLE...</span>
                </>
              ) : (
                <>
                  <Bluetooth className="h-4 w-4" />
                  <span>Pair Bluetooth (BLE)</span>
                </>
              )}
            </button>

            {isSerialSupported && (
              <button
                onClick={handlePairSerial}
                disabled={isScanning}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-secondary py-3 px-2 text-xs font-bold text-foreground border border-border shadow-sm hover:bg-muted transition active:scale-98 disabled:opacity-50"
                title="Connect via Serial Port / USB / Windows Paired Bluetooth COM port"
              >
                <span>🔌 Connect COM / USB</span>
              </button>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground text-center leading-tight pt-1">
            💡 <strong>Paired MPT-II in Windows?</strong> Windows connects it as a COM port. Click <em>Connect COM / USB</em>, or configure it in <em>Manual Add</em> below.
          </p>

          {/* Toggle Manual Add */}
          <div className="text-center pt-1">
            <button
              onClick={() => setShowManualAdd(!showManualAdd)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showManualAdd ? 'Hide Manual Config' : 'Manual Add / Custom Profile'}</span>
            </button>
          </div>

          {showManualAdd && (
            <form onSubmit={handleManualAddSubmit} className="mt-2 rounded-2xl bg-secondary/50 p-3 border border-border space-y-2 animate-fade-in text-xs">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                  Printer Model / Name
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. PeriPage A6 58mm or MPT-II"
                  className="w-full rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                  Paper Roll Width
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualWidth('58mm')}
                    className={`rounded-xl py-1.5 text-xs font-bold border transition ${
                      manualWidth === '58mm' ? 'bg-accent text-white border-accent' : 'bg-card text-foreground border-border'
                    }`}
                  >
                    58mm (Standard Mobile)
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualWidth('80mm')}
                    className={`rounded-xl py-1.5 text-xs font-bold border transition ${
                      manualWidth === '80mm' ? 'bg-accent text-white border-accent' : 'bg-card text-foreground border-border'
                    }`}
                  >
                    80mm (Countertop POS)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-accent py-2 text-xs font-bold text-white shadow-sm hover:bg-accent/90 transition mt-1"
              >
                Save Custom Printer
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

