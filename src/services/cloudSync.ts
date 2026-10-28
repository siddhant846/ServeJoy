import { Order, WaiterRequest, Bill, CloudSyncStatus } from '../types';
import { storage } from './storage';

const FIREBASE_PROJECT = 'servejoy-pos-live';
const FIREBASE_KEY = 'AIzaSyB5Gg4T2hIHtqXHjiqT1H63W6ZkIBxxqZw';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;

class CloudSyncEngine {
  private status: CloudSyncStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
  };

  private listeners = new Set<(status: CloudSyncStatus) => void>();
  private newDataCallbacks = new Set<(data: { newOrders: Order[]; newRequests: WaiterRequest[] }) => void>();
  private pollIntervalId: any = null;
  private knownOrderIds = new Set<string>();
  private knownRequestIds = new Set<string>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.status.isOnline = true;
        this.notifyListeners();
        this.syncAll();
      });
      window.addEventListener('offline', () => {
        this.status.isOnline = false;
        this.notifyListeners();
      });
      window.addEventListener('focus', () => {
        this.pullRemoteData();
      });
    }
  }

  getStatus(): CloudSyncStatus {
    return { ...this.status };
  }

  subscribeStatus(listener: (status: CloudSyncStatus) => void): () => void {
    this.listeners.add(listener);
    listener({ ...this.status });
    return () => this.listeners.delete(listener);
  }

  subscribeNewData(callback: (data: { newOrders: Order[]; newRequests: WaiterRequest[] }) => void): () => void {
    this.newDataCallbacks.add(callback);
    return () => this.newDataCallbacks.delete(callback);
  }

  private notifyListeners(): void {
    const copy = { ...this.status };
    this.listeners.forEach((fn) => fn(copy));
  }

  private makeDocument(id: string, payload: any, docType: string) {
    return {
      fields: {
        docId: { stringValue: id },
        docType: { stringValue: docType },
        payload: { stringValue: JSON.stringify(payload) },
        updatedAt: { stringValue: new Date().toISOString() },
      },
    };
  }

  async pushOrder(order: Order): Promise<boolean> {
    if (!this.status.isOnline) return false;
    this.knownOrderIds.add(order.id);
    try {
      const url = `${FIRESTORE_BASE}/servejoy_orders/${order.id}?key=${FIREBASE_KEY}`;
      const doc = this.makeDocument(order.id, order, 'order');
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      if (res.ok) {
        this.status.lastSyncedAt = new Date();
        this.status.error = null;
        this.notifyListeners();
        return true;
      }
    } catch (err: any) {
      console.warn('[CloudSync] pushOrder error:', err);
    }
    return false;
  }

  async pushWaiterRequest(request: WaiterRequest): Promise<boolean> {
    if (!this.status.isOnline) return false;
    this.knownRequestIds.add(request.id);
    try {
      const url = `${FIRESTORE_BASE}/servejoy_requests/${request.id}?key=${FIREBASE_KEY}`;
      const doc = this.makeDocument(request.id, request, 'request');
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      if (res.ok) {
        this.status.lastSyncedAt = new Date();
        this.status.error = null;
        this.notifyListeners();
        return true;
      }
    } catch (err: any) {
      console.warn('[CloudSync] pushWaiterRequest error:', err);
    }
    return false;
  }

  async pushBill(bill: Bill): Promise<boolean> {
    if (!this.status.isOnline) return false;
    try {
      const url = `${FIRESTORE_BASE}/servejoy_bills/${bill.id}?key=${FIREBASE_KEY}`;
      const doc = this.makeDocument(bill.id, bill, 'bill');
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      if (res.ok) {
        this.status.lastSyncedAt = new Date();
        this.status.error = null;
        this.notifyListeners();
        return true;
      }
    } catch (err: any) {
      console.warn('[CloudSync] pushBill error:', err);
    }
    return false;
  }

  async pullRemoteData(): Promise<{ newOrders: Order[]; newRequests: WaiterRequest[] }> {
    if (!this.status.isOnline) return { newOrders: [], newRequests: [] };

    this.status.isSyncing = true;
    this.notifyListeners();
    const result: { newOrders: Order[]; newRequests: WaiterRequest[] } = {
      newOrders: [],
      newRequests: [],
    };

    try {
      // 1. Fetch Orders
      const orderUrl = `${FIRESTORE_BASE}/servejoy_orders?pageSize=50&key=${FIREBASE_KEY}`;
      const orderRes = await fetch(orderUrl);
      if (orderRes.ok) {
        const data = await orderRes.json();
        const documents = data.documents || [];
        const localOrders = storage.getOrders();
        const orderMap = new Map<string, Order>(localOrders.map((o) => [o.id, o]));
        let hasChanges = false;

        for (const doc of documents) {
          const payloadStr = doc.fields?.payload?.stringValue;
          if (payloadStr) {
            try {
              const remoteOrder: Order = JSON.parse(payloadStr);
              const local = orderMap.get(remoteOrder.id);
              if (local) {
                if (
                  remoteOrder.updatedAt &&
                  local.updatedAt &&
                  new Date(remoteOrder.updatedAt).getTime() > new Date(local.updatedAt).getTime()
                ) {
                  orderMap.set(remoteOrder.id, remoteOrder);
                  hasChanges = true;
                }
              } else {
                result.newOrders.push(remoteOrder);
                orderMap.set(remoteOrder.id, remoteOrder);
                hasChanges = true;
              }
            } catch {}
          }
        }

        if (hasChanges) {
          const merged = Array.from(orderMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          storage.saveOrders(merged);
          window.dispatchEvent(new Event('servejoy_sync'));
        }
      }

      // 2. Fetch Waiter Requests
      const reqUrl = `${FIRESTORE_BASE}/servejoy_requests?pageSize=50&key=${FIREBASE_KEY}`;
      const reqRes = await fetch(reqUrl);
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        const reqDocs = reqData.documents || [];
        const localRequests = storage.getWaiterRequests();
        const reqMap = new Map<string, WaiterRequest>(localRequests.map((r) => [r.id, r]));
        let hasChanges = false;

        for (const doc of reqDocs) {
          const payloadStr = doc.fields?.payload?.stringValue;
          if (payloadStr) {
            try {
              const remoteReq: WaiterRequest = JSON.parse(payloadStr);
              const local = reqMap.get(remoteReq.id);
              if (local) {
                if (remoteReq.status !== local.status) {
                  reqMap.set(remoteReq.id, remoteReq);
                  hasChanges = true;
                }
              } else {
                result.newRequests.push(remoteReq);
                reqMap.set(remoteReq.id, remoteReq);
                hasChanges = true;
              }
            } catch {}
          }
        }

        if (hasChanges) {
          const mergedReqs = Array.from(reqMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          storage.saveWaiterRequests(mergedReqs);
          window.dispatchEvent(new Event('servejoy_sync'));
        }
      }

      this.status.lastSyncedAt = new Date();
      this.status.error = null;
    } catch (err: any) {
      console.warn('[CloudSync] pullRemoteData error:', err);
      this.status.error = err.message || 'Sync failed';
    } finally {
      this.status.isSyncing = false;
      this.notifyListeners();
    }

    if (result.newOrders.length > 0 || result.newRequests.length > 0) {
      this.newDataCallbacks.forEach((cb) => cb(result));
    }

    return result;
  }

  async syncAll(): Promise<void> {
    await this.pullRemoteData();
  }

  start(intervalMs = 4500): void {
    if (this.pollIntervalId) return;
    this.pullRemoteData();
    this.pollIntervalId = setInterval(() => {
      this.pullRemoteData();
    }, intervalMs);
  }

  stop(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }
}

export const cloudSync = new CloudSyncEngine();

