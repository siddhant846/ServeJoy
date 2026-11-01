import { Bill, CafeProfile, Printer } from '../types';
import { storage } from './storage';

export const BLE_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
  '0000ff00-0000-1000-8000-00805f9b34fb', // PeriPage / Rego / POS-58
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent UART
  '0000ffe0-0000-1000-8000-00805f9b34fb', // Telink / Broadcom mini printer
  '0000fff0-0000-1000-8000-00805f9b34fb', // Feasycom BLE
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // JP-58
  '0000af30-0000-1000-8000-00805f9b34fb', // MPT-II
  '0000ae30-0000-1000-8000-00805f9b34fb', // ZJ printer
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service (NUS)
];

export interface PrintResult {
  success: boolean;
  message: string;
  errorReason?: string;
  bytesSent?: number;
  isSimulated?: boolean;
}

class ThermalPrinterService {
  private activeDevice: any = null;
  private activeGattServer: any = null;
  private activeCharacteristic: any = null;

  isBluetoothSupported(): boolean {
    if (typeof navigator === 'undefined') return false;
    const nav = navigator as any;
    return !!(nav.bluetooth && typeof nav.bluetooth.requestDevice === 'function');
  }

  getPlatformInfo(): { isIOS: boolean; isAndroid: boolean; browserName: string } {
    if (typeof navigator === 'undefined') {
      return { isIOS: false, isAndroid: false, browserName: 'Unknown' };
    }
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    let browserName = 'Browser';
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) browserName = 'Google Chrome';
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browserName = 'Apple Safari';
    else if (/Edg/.test(ua)) browserName = 'Microsoft Edge';
    else if (/Bluefy/.test(ua)) browserName = 'Bluefy BLE';

    return { isIOS, isAndroid, browserName };
  }

  async pairNewPrinter(): Promise<{ success: boolean; printer?: Printer; error?: string }> {
    if (!this.isBluetoothSupported()) {
      const { isIOS } = this.getPlatformInfo();
      if (isIOS) {
        return {
          success: false,
          error: 'Web Bluetooth is not supported in Apple Safari on iOS. Please use Google Chrome on Android/PC, or open ServeJoy in the free "Bluefy Web BLE Browser" on iOS.',
        };
      }
      return {
        success: false,
        error: 'Web Bluetooth is not supported in this browser. Please use Google Chrome or Microsoft Edge.',
      };
    }

    try {
      const nav = navigator as any;
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: BLE_PRINTER_SERVICES,
      });

      if (!device) {
        return { success: false, error: 'No device selected' };
      }

      this.activeDevice = device;
      const connected = await this.connectGatt(device);

      const printerName = device.name || 'Thermal POS Printer';
      const newPrinter: Printer = {
        id: device.id || `bt_${Date.now()}`,
        name: printerName,
        paperWidth: '58mm',
        isDefault: true,
        connected: connected,
      };

      // Save to storage
      const existing = storage.getPrinters().filter((p) => p.name !== printerName && p.id !== newPrinter.id);
      const updated = [newPrinter, ...existing.map((p) => ({ ...p, isDefault: false }))];
      storage.savePrinters(updated);

      return { success: true, printer: newPrinter };
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('cancelled') || msg.includes('cancel')) {
        return { success: false, error: 'Bluetooth device selection cancelled by user.' };
      }
      return { success: false, error: msg };
    }
  }

  private async connectGatt(device: any): Promise<boolean> {
    try {
      if (device.gatt.connected && this.activeCharacteristic) {
        return true;
      }

      const server = await device.gatt.connect();
      this.activeGattServer = server;

      let writableChar: any = null;

      // 1. Try known printer service UUIDs first
      for (const serviceUuid of BLE_PRINTER_SERVICES) {
        try {
          const service = await server.getPrimaryService(serviceUuid);
          const chars = await service.getCharacteristics();
          for (const char of chars) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              writableChar = char;
              break;
            }
          }
          if (writableChar) break;
        } catch {}
      }

      // 2. If not found in known list, scan all primary services
      if (!writableChar && typeof server.getPrimaryServices === 'function') {
        try {
          const allServices = await server.getPrimaryServices();
          for (const service of allServices) {
            try {
              const chars = await service.getCharacteristics();
              for (const char of chars) {
                if (char.properties.write || char.properties.writeWithoutResponse) {
                  writableChar = char;
                  break;
                }
              }
              if (writableChar) break;
            } catch {}
          }
        } catch {}
      }

      if (writableChar) {
        this.activeCharacteristic = writableChar;
        return true;
      }
    } catch (err) {
      console.warn('GATT connection error:', err);
    }
    return false;
  }

  async printEscPosBytes(bytes: Uint8Array, printerName = 'Thermal ESC/POS'): Promise<PrintResult> {
    if (!this.isBluetoothSupported()) {
      const { isIOS } = this.getPlatformInfo();
      if (isIOS) {
        return {
          success: false,
          message: 'Web Bluetooth not supported on iOS Safari.',
          errorReason: 'Apple iOS Safari does not support Web Bluetooth. Please use the "PDF" button for AirPrint, or open ServeJoy in the Bluefy BLE Browser.',
        };
      }
      return {
        success: false,
        message: 'Web Bluetooth API not supported.',
        errorReason: 'Your browser does not support Web Bluetooth. Please use Google Chrome or Microsoft Edge.',
      };
    }

    try {
      const nav = navigator as any;

      // Check if we have an active connected characteristic
      if (!this.activeCharacteristic || !this.activeDevice?.gatt?.connected) {
        // Try to reconnect to known device via getDevices() if available
        let deviceToConnect = this.activeDevice;

        if (!deviceToConnect && typeof nav.bluetooth.getDevices === 'function') {
          const devices = await nav.bluetooth.getDevices();
          if (devices && devices.length > 0) {
            deviceToConnect = devices[0];
            this.activeDevice = deviceToConnect;
          }
        }

        if (deviceToConnect) {
          await this.connectGatt(deviceToConnect);
        } else {
          // If no remembered device, prompt user to select printer
          const res = await this.pairNewPrinter();
          if (!res.success || !this.activeCharacteristic) {
            return {
              success: false,
              message: res.error || 'No thermal printer selected.',
              errorReason: res.error || 'Bluetooth device selection cancelled.',
            };
          }
        }
      }

      if (!this.activeCharacteristic) {
        return {
          success: false,
          message: 'Could not establish writable channel to printer.',
          errorReason: 'Printer connected but no standard ESC/POS write characteristic was found.',
        };
      }

      // Send bytes in 60-byte chunks with small delay to avoid buffer overflow on mini printers
      const chunkSize = 60;
      for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        const chunk = bytes.slice(offset, offset + chunkSize);
        if (this.activeCharacteristic.properties.writeWithoutResponse) {
          await this.activeCharacteristic.writeValueWithoutResponse(chunk);
        } else {
          await this.activeCharacteristic.writeValue(chunk);
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      return {
        success: true,
        message: `Printed ${bytes.length} bytes to ${this.activeDevice?.name || printerName}!`,
        bytesSent: bytes.length,
        isSimulated: false,
      };
    } catch (err: any) {
      console.error('Thermal printer write error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: 'Failed to send data to thermal printer.',
        errorReason: msg,
      };
    }
  }

  // Generate ESC/POS byte stream for bill receipt
  buildReceiptEscPos(bill: Bill, cafe: CafeProfile, paperWidth: '58mm' | '80mm' = '58mm'): Uint8Array {
    const encoder = new TextEncoder();
    const bytes: number[] = [];
    const cols = paperWidth === '80mm' ? 48 : 32;

    // Initialize printer
    bytes.push(27, 64); // ESC @

    // Center header
    bytes.push(27, 97, 1); // ESC a 1 (center)
    bytes.push(29, 33, 17); // Double height + width
    encoder.encode(`${cafe.name}\n`).forEach((b) => bytes.push(b));
    bytes.push(29, 33, 0); // Normal text

    if (cafe.tagLine) {
      encoder.encode(`${cafe.tagLine}\n`).forEach((b) => bytes.push(b));
    }
    if (cafe.phone) {
      encoder.encode(`Ph: ${cafe.phone}\n`).forEach((b) => bytes.push(b));
    }
    if (cafe.address) {
      encoder.encode(`${cafe.address}\n`).forEach((b) => bytes.push(b));
    }

    const divider = '-'.repeat(cols) + '\n';
    const dateStr = new Date(bill.date).toLocaleString([], {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    encoder.encode(`\n${bill.billNumber} | ${bill.tableNumber || 'Takeaway'}\n`).forEach((b) => bytes.push(b));
    encoder.encode(`Date: ${dateStr}\n`).forEach((b) => bytes.push(b));
    encoder.encode(divider).forEach((b) => bytes.push(b));

    // Left align items
    bytes.push(27, 97, 0);

    if (cols === 48) {
      encoder.encode(`Item                         Qty    Price     Amount\n${divider}`).forEach((b) => bytes.push(b));
      bill.items.forEach((item) => {
        const name = item.name.length > 25 ? item.name.substring(0, 24) + '.' : item.name.padEnd(25, ' ');
        const qty = String(item.quantity).padStart(4, ' ');
        const rate = `${cafe.currency}${item.price}`.padStart(8, ' ');
        const amt = `${cafe.currency}${item.price * item.quantity}`.padStart(9, ' ');
        encoder.encode(`${name} ${qty} ${rate} ${amt}\n`).forEach((b) => bytes.push(b));
      });
    } else {
      // 58mm (32 cols)
      encoder.encode(`Item               Qty    Amount\n${divider}`).forEach((b) => bytes.push(b));
      bill.items.forEach((item) => {
        const name = item.name.length > 16 ? item.name.substring(0, 15) + '.' : item.name.padEnd(16, ' ');
        const qty = String(item.quantity).padStart(3, ' ');
        const amt = `${cafe.currency}${item.price * item.quantity}`.padStart(11, ' ');
        encoder.encode(`${name} ${qty} ${amt}\n`).forEach((b) => bytes.push(b));
      });
    }

    encoder.encode(divider).forEach((b) => bytes.push(b));

    // Right align totals
    bytes.push(27, 97, 2);
    if (bill.discountAmount > 0) {
      encoder.encode(`Subtotal: ${cafe.currency}${bill.subtotal}\n`).forEach((b) => bytes.push(b));
      encoder.encode(`Discount: -${cafe.currency}${bill.discountAmount}\n`).forEach((b) => bytes.push(b));
    }

    bytes.push(27, 69, 1); // Bold
    encoder.encode(`TOTAL: ${cafe.currency}${bill.total}\n`).forEach((b) => bytes.push(b));
    bytes.push(27, 69, 0); // Normal
    encoder.encode(`Payment: ${bill.paymentMode.toUpperCase()}\n`).forEach((b) => bytes.push(b));

    if (bill.customerName) {
      encoder.encode(`Customer: ${bill.customerName}\n`).forEach((b) => bytes.push(b));
    }

    // Center footer
    bytes.push(27, 97, 1);
    encoder.encode(`\n${divider}Thank you for visiting!\nPowered by ServeJoy POS\n\n\n\n`).forEach((b) => bytes.push(b));

    // Cut paper command: GS V 65 0
    bytes.push(29, 86, 65, 0);

    return new Uint8Array(bytes);
  }

  // Generate test receipt ticket
  buildTestEscPos(cafe: CafeProfile, paperWidth: '58mm' | '80mm' = '58mm'): Uint8Array {
    const encoder = new TextEncoder();
    const bytes: number[] = [];
    const cols = paperWidth === '80mm' ? 48 : 32;

    bytes.push(27, 64);
    bytes.push(27, 97, 1);
    bytes.push(29, 33, 17);
    encoder.encode(`${cafe.name}\n`).forEach((b) => bytes.push(b));
    bytes.push(29, 33, 0);
    encoder.encode(`THERMAL PRINTER TEST\n${'='.repeat(cols)}\n`).forEach((b) => bytes.push(b));

    bytes.push(27, 69, 1);
    encoder.encode(`STATUS: CONNECTED OK\n`).forEach((b) => bytes.push(b));
    bytes.push(27, 69, 0);
    encoder.encode(`Paper Width: ${paperWidth} (${cols} columns)\n`).forEach((b) => bytes.push(b));
    encoder.encode(`Time: ${new Date().toLocaleTimeString()}\n`).forEach((b) => bytes.push(b));
    encoder.encode(`${'-'.repeat(cols)}\n`).forEach((b) => bytes.push(b));

    bytes.push(27, 97, 0);
    encoder.encode(`Left Align  |  `).forEach((b) => bytes.push(b));
    bytes.push(27, 97, 2);
    encoder.encode(`Right Align\n`).forEach((b) => bytes.push(b));

    bytes.push(27, 97, 1);
    encoder.encode(`\nTest Ticket Printed Successfully!\n\n\n\n`).forEach((b) => bytes.push(b));
    bytes.push(29, 86, 65, 0);

    return new Uint8Array(bytes);
  }
}

export const thermalPrinter = new ThermalPrinterService();
