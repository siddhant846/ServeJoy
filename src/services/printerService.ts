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

// Clean text helper to prevent Chinese GBK character corruption on thermal printers
function cleanAscii(str: string): string {
  if (!str) return '';
  return str
    .replace(/₹/g, 'Rs.')
    .replace(/€/g, 'EUR')
    .replace(/£/g, 'GBP')
    .replace(/[^\x20-\x7E\n\r\t]/g, ''); // strip raw multi-byte unicode symbols & emojis
}

function getThermalCurrency(currency: string): string {
  if (!currency || currency.includes('₹') || currency === '₹') return 'Rs.';
  if (currency === '$') return '$';
  if (currency === '€') return 'EUR ';
  if (currency === '£') return 'GBP ';
  const cleaned = cleanAscii(currency).trim();
  return cleaned ? `${cleaned} ` : 'Rs.';
}

class ThermalPrinterService {
  private activeDevice: any = null;
  private activeGattServer: any = null;
  private activeCharacteristic: any = null;
  private activeSerialPort: any = null;

  isBluetoothSupported(): boolean {
    if (typeof navigator === 'undefined') return false;
    const nav = navigator as any;
    return !!(nav.bluetooth && typeof nav.bluetooth.requestDevice === 'function');
  }

  isSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  getPlatformInfo(): { isIOS: boolean; isAndroid: boolean; browserName: string; hasSerial: boolean } {
    if (typeof navigator === 'undefined') {
      return { isIOS: false, isAndroid: false, browserName: 'Unknown', hasSerial: false };
    }
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    let browserName = 'Browser';
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) browserName = 'Google Chrome';
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browserName = 'Apple Safari';
    else if (/Edg/.test(ua)) browserName = 'Microsoft Edge';
    else if (/Bluefy/.test(ua)) browserName = 'Bluefy BLE';

    const hasSerial = 'serial' in navigator;
    return { isIOS, isAndroid, browserName, hasSerial };
  }

  async pairSerialPrinter(): Promise<{ success: boolean; printer?: Printer; error?: string }> {
    if (!this.isSerialSupported()) {
      return { success: false, error: 'Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.' };
    }
    try {
      const nav = navigator as any;
      const port = await nav.serial.requestPort();
      if (!port) return { success: false, error: 'No serial/COM port selected.' };

      try {
        await port.open({ baudRate: 9600 });
      } catch (openErr: any) {
        console.warn('Port open notice:', openErr);
      }

      this.activeSerialPort = port;
      const printerName = 'MPT-II (Serial / USB / Paired BT)';
      const newPrinter: Printer = {
        id: `serial_${Date.now()}`,
        name: printerName,
        paperWidth: '58mm',
        isDefault: true,
        connected: true,
      };

      const existing = storage.getPrinters().filter((p) => p.name !== printerName && p.id !== newPrinter.id);
      const updated = [newPrinter, ...existing.map((p) => ({ ...p, isDefault: false }))];
      storage.savePrinters(updated);

      return { success: true, printer: newPrinter };
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('cancelled') || msg.includes('cancel') || msg.includes('No port selected')) {
        return { success: false, error: 'Serial/COM port selection cancelled.' };
      }
      return { success: false, error: msg };
    }
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
    // 1. Try active Web Serial port if connected (ideal for MPT-II / USB / Windows Bluetooth COM)
    if (this.activeSerialPort) {
      try {
        if (!this.activeSerialPort.writable) {
          await this.activeSerialPort.open({ baudRate: 9600 });
        }
        if (this.activeSerialPort.writable) {
          const writer = this.activeSerialPort.writable.getWriter();
          await writer.write(bytes);
          writer.releaseLock();
          return {
            success: true,
            message: `Printed ${bytes.length} bytes to [${printerName}] via Serial / USB!`,
            bytesSent: bytes.length,
            isSimulated: false,
          };
        }
      } catch (serialErr: any) {
        console.warn('Serial print error, checking Bluetooth:', serialErr);
      }
    }

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
    const curr = getThermalCurrency(cafe.currency);

    // 1. Reset / Initialize printer
    bytes.push(27, 64); // ESC @

    // 2. Cancel Chinese / Kanji double-byte mode (FS .)
    bytes.push(28, 46); // FS . (Prevents thermal printers from misinterpreting bytes as GBK Chinese)

    // 3. Select standard character code table (PC437 Standard USA / English ASCII)
    bytes.push(27, 116, 0); // ESC t 0

    // Center header
    bytes.push(27, 97, 1); // ESC a 1 (center)
    bytes.push(29, 33, 17); // Double height + width
    encoder.encode(`${cleanAscii(cafe.name)}\n`).forEach((b) => bytes.push(b));
    bytes.push(29, 33, 0); // Normal text

    if (cafe.tagLine) {
      encoder.encode(`${cleanAscii(cafe.tagLine)}\n`).forEach((b) => bytes.push(b));
    }
    if (cafe.phone) {
      encoder.encode(`Ph: ${cleanAscii(cafe.phone)}\n`).forEach((b) => bytes.push(b));
    }
    if (cafe.address) {
      encoder.encode(`${cleanAscii(cafe.address)}\n`).forEach((b) => bytes.push(b));
    }

    const divider = '-'.repeat(cols) + '\n';
    const dateStr = new Date(bill.date).toLocaleString([], {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    encoder.encode(`\n${cleanAscii(bill.billNumber)} | ${cleanAscii(bill.tableNumber || 'Takeaway')}\n`).forEach((b) => bytes.push(b));
    encoder.encode(`Date: ${dateStr}\n`).forEach((b) => bytes.push(b));
    encoder.encode(divider).forEach((b) => bytes.push(b));

    // Left align items
    bytes.push(27, 97, 0);

    if (cols === 48) {
      encoder.encode(`Item                         Qty    Price     Amount\n${divider}`).forEach((b) => bytes.push(b));
      bill.items.forEach((item) => {
        const cleanName = cleanAscii(item.name);
        const name = cleanName.length > 25 ? cleanName.substring(0, 24) + '.' : cleanName.padEnd(25, ' ');
        const qty = String(item.quantity).padStart(4, ' ');
        const rate = `${curr}${item.price}`.padStart(8, ' ');
        const amt = `${curr}${item.price * item.quantity}`.padStart(9, ' ');
        encoder.encode(`${name} ${qty} ${rate} ${amt}\n`).forEach((b) => bytes.push(b));
      });
    } else {
      // 58mm (32 cols)
      encoder.encode(`Item               Qty    Amount\n${divider}`).forEach((b) => bytes.push(b));
      bill.items.forEach((item) => {
        const cleanName = cleanAscii(item.name);
        const name = cleanName.length > 16 ? cleanName.substring(0, 15) + '.' : cleanName.padEnd(16, ' ');
        const qty = String(item.quantity).padStart(3, ' ');
        const amt = `${curr}${item.price * item.quantity}`.padStart(11, ' ');
        encoder.encode(`${name} ${qty} ${amt}\n`).forEach((b) => bytes.push(b));
      });
    }

    encoder.encode(divider).forEach((b) => bytes.push(b));

    // Right align totals
    bytes.push(27, 97, 2);
    if (bill.discountAmount > 0) {
      encoder.encode(`Subtotal: ${curr}${bill.subtotal}\n`).forEach((b) => bytes.push(b));
      encoder.encode(`Discount: -${curr}${bill.discountAmount}\n`).forEach((b) => bytes.push(b));
    }

    bytes.push(27, 69, 1); // Bold
    encoder.encode(`TOTAL: ${curr}${bill.total}\n`).forEach((b) => bytes.push(b));
    bytes.push(27, 69, 0); // Normal
    encoder.encode(`Payment: ${bill.status === 'paid' ? bill.paymentMode.toUpperCase() + ' (PAID)' : 'PENDING (SCAN UPI)'}\n`).forEach((b) => bytes.push(b));

    if (bill.customerName) {
      encoder.encode(`Customer: ${cleanAscii(bill.customerName)}\n`).forEach((b) => bytes.push(b));
    }

    // Dynamic UPI QR Code for Restaurant Bill Payment
    const upiId = cafe.upiId || 'chaipoint@icici';
    const cleanCafeName = cleanAscii(cafe.name) || 'Cafe';
    const cleanBillNum = cleanAscii(bill.billNumber) || 'Bill';
    const upiData = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(cleanCafeName)}&am=${bill.total}&cu=INR&tn=${encodeURIComponent(cleanBillNum)}`;
    const qrBytes = new TextEncoder().encode(upiData);

    // Center QR Code
    bytes.push(27, 97, 1);
    encoder.encode(`\n${divider}`).forEach((b) => bytes.push(b));
    encoder.encode(`SCAN TO PAY VIA UPI\n`).forEach((b) => bytes.push(b));

    // Standard ESC/POS Hardware QR Code Commands (Model 2, GS ( k)
    // 1. Model 2: GS ( k 4 0 49 65 50 0
    bytes.push(29, 40, 107, 4, 0, 49, 65, 50, 0);
    // 2. Module pixel size: GS ( k 3 0 49 67 n (4 for 58mm, 5 for 80mm)
    const qrModuleSize = paperWidth === '80mm' ? 5 : 4;
    bytes.push(29, 40, 107, 3, 0, 49, 67, qrModuleSize);
    // 3. Error correction level M (49): GS ( k 3 0 49 69 49
    bytes.push(29, 40, 107, 3, 0, 49, 69, 49);
    // 4. Store symbol data: GS ( k pL pH 49 80 48 <data>
    const dataLen = qrBytes.length + 3;
    const pL = dataLen % 256;
    const pH = Math.floor(dataLen / 256);
    bytes.push(29, 40, 107, pL, pH, 49, 80, 48);
    qrBytes.forEach((b) => bytes.push(b));
    // 5. Print QR symbol: GS ( k 3 0 49 81 48
    bytes.push(29, 40, 107, 3, 0, 49, 81, 48);

    // Fallback & human readable UPI details under QR
    encoder.encode(`GPay - PhonePe - Paytm - BHIM\n`).forEach((b) => bytes.push(b));
    encoder.encode(`UPI ID: ${cleanAscii(upiId)}\n`).forEach((b) => bytes.push(b));
    encoder.encode(`Amount: ${curr}${bill.total}\n`).forEach((b) => bytes.push(b));

    // Center footer
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
    bytes.push(28, 46); // Cancel Chinese character mode
    bytes.push(27, 116, 0); // PC437
    bytes.push(27, 97, 1);
    bytes.push(29, 33, 17);
    encoder.encode(`${cleanAscii(cafe.name)}\n`).forEach((b) => bytes.push(b));
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

