import { Order, WaiterRequest, Bill, CloudSyncStatus, MenuItem, RestaurantTable, SubscriptionDetails, BusinessAccount, CafeProfile } from '../types';
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

  private getCollectionName(baseType: string, businessId?: string): string {
    const bizId = businessId || storage.getActiveBusinessId();
    const cleanBizId = bizId.replace(/[^a-zA-Z0-9_]/g, '_');
    return `servejoy_tenant_${cleanBizId}_${baseType}`;
  }

  private makeDocument(id: string, payload: any, docType: string) {
    return {
      fields: {
        docId: { stringValue: id },
        docType: { stringValue: docType },
        businessId: { stringValue: payload.businessId || storage.getActiveBusinessId() },
        payload: { stringValue: JSON.stringify(payload) },
        updatedAt: { stringValue: new Date().toISOString() },
      },
    };
  }

  async pushOrder(order: Order): Promise<boolean> {
    if (!this.status.isOnline) return false;
    this.knownOrderIds.add(order.id);
    try {
      const collection = this.getCollectionName('orders', order.businessId);
      const url = `${FIRESTORE_BASE}/${collection}/${order.id}?key=${FIREBASE_KEY}`;
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
      const collection = this.getCollectionName('requests', request.businessId);
      const url = `${FIRESTORE_BASE}/${collection}/${request.id}?key=${FIREBASE_KEY}`;
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
      const collection = this.getCollectionName('bills', bill.businessId);
      const url = `${FIRESTORE_BASE}/${collection}/${bill.id}?key=${FIREBASE_KEY}`;
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

  async pushMenuItems(items: MenuItem[], businessId?: string): Promise<boolean> {
    if (!this.status.isOnline) return false;
    try {
      const bizId = businessId || storage.getActiveBusinessId();
      const collection = this.getCollectionName('menu', bizId);
      const url = `${FIRESTORE_BASE}/${collection}/active_menu?key=${FIREBASE_KEY}`;
      const doc = this.makeDocument('active_menu', { items, businessId: bizId }, 'menu');
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      if (res.ok) {
        this.status.lastSyncedAt = new Date();
        this.notifyListeners();
        return true;
      }
    } catch (err: any) {
      console.warn('[CloudSync] pushMenuItems error:', err);
    }
    return false;
  }

  async pullMenuItems(businessId?: string): Promise<MenuItem[] | null> {
    try {
      const bizId = businessId || storage.getActiveBusinessId();
      const collection = this.getCollectionName('menu', bizId);
      const url = `${FIRESTORE_BASE}/${collection}/active_menu?key=${FIREBASE_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const payloadStr = data.fields?.payload?.stringValue;
        if (payloadStr) {
          const parsed = JSON.parse(payloadStr);
          if (Array.isArray(parsed.items)) {
            return parsed.items;
          }
        }
      }
    } catch (err: any) {
      console.warn('[CloudSync] pullMenuItems error:', err);
    }
    return null;
  }

  async pushTables(tables: RestaurantTable[], businessId?: string): Promise<boolean> {
    if (!this.status.isOnline) return false;
    try {
      const bizId = businessId || storage.getActiveBusinessId();
      const collection = this.getCollectionName('tables', bizId);
      const url = `${FIRESTORE_BASE}/${collection}/active_tables?key=${FIREBASE_KEY}`;
      const doc = this.makeDocument('active_tables', { tables, businessId: bizId }, 'tables');
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      if (res.ok) {
        this.status.lastSyncedAt = new Date();
        this.notifyListeners();
        return true;
      }
    } catch (err: any) {
      console.warn('[CloudSync] pushTables error:', err);
    }
    return false;
  }

  async pullTables(businessId?: string): Promise<RestaurantTable[] | null> {
    try {
      const bizId = businessId || storage.getActiveBusinessId();
      const collection = this.getCollectionName('tables', bizId);
      const url = `${FIRESTORE_BASE}/${collection}/active_tables?key=${FIREBASE_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const payloadStr = data.fields?.payload?.stringValue;
        if (payloadStr) {
          const parsed = JSON.parse(payloadStr);
          if (Array.isArray(parsed.tables)) {
            return parsed.tables;
          }
        }
      }
    } catch (err: any) {
      console.warn('[CloudSync] pullTables error:', err);
    }
    return null;
  }

  async pushSubscription(sub: SubscriptionDetails, businessId?: string): Promise<boolean> {
    if (!this.status.isOnline) return false;
    try {
      const bizId = businessId || storage.getActiveBusinessId();
      const cleanBizId = bizId.replace(/[^a-zA-Z0-9_]/g, '_');
      const url = `${FIRESTORE_BASE}/servejoy_platform_subscriptions/${cleanBizId}?key=${FIREBASE_KEY}`;
      const doc = this.makeDocument(cleanBizId, sub, 'subscription');
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      return res.ok;
    } catch (err: any) {
      console.warn('[CloudSync] pushSubscription error:', err);
    }
    return false;
  }

  async pullSubscription(businessId?: string): Promise<SubscriptionDetails | null> {
    try {
      const bizId = businessId || storage.getActiveBusinessId();
      const cleanBizId = bizId.replace(/[^a-zA-Z0-9_]/g, '_');
      const url = `${FIRESTORE_BASE}/servejoy_platform_subscriptions/${cleanBizId}?key=${FIREBASE_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const payloadStr = data.fields?.payload?.stringValue;
        if (payloadStr) {
          return JSON.parse(payloadStr);
        }
      }
    } catch (err: any) {
      console.warn('[CloudSync] pullSubscription error:', err);
    }
    return null;
  }

  async pushBusinessAccount(account: BusinessAccount): Promise<boolean> {
    if (!this.status.isOnline) return false;
    try {
      const cleanBizId = account.id.replace(/[^a-zA-Z0-9_]/g, '_');
      const url = `${FIRESTORE_BASE}/servejoy_platform_businesses/${cleanBizId}?key=${FIREBASE_KEY}`;
      const doc = this.makeDocument(cleanBizId, account, 'business_account');
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      return res.ok;
    } catch (err: any) {
      console.warn('[CloudSync] pushBusinessAccount error:', err);
    }
    return false;
  }

  async pullAllBusinesses(): Promise<BusinessAccount[] | null> {
    try {
      const url = `${FIRESTORE_BASE}/servejoy_platform_businesses?pageSize=100&key=${FIREBASE_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const documents = data.documents || [];
        const accounts: BusinessAccount[] = [];
        for (const doc of documents) {
          const payloadStr = doc.fields?.payload?.stringValue;
          if (payloadStr) {
            try {
              accounts.push(JSON.parse(payloadStr));
            } catch {}
          }
        }
        return accounts;
      }
    } catch (err: any) {
      console.warn('[CloudSync] pullAllBusinesses error:', err);
    }
    return null;
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
      const bizId = storage.getActiveBusinessId();
      // 1. Fetch Orders strictly scoped to current active business
      const orderCollection = this.getCollectionName('orders', bizId);
      const orderUrl = `${FIRESTORE_BASE}/${orderCollection}?pageSize=50&key=${FIREBASE_KEY}`;
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

      // 2. Fetch Waiter Requests strictly scoped to current active business
      const reqCollection = this.getCollectionName('requests', bizId);
      const reqUrl = `${FIRESTORE_BASE}/${reqCollection}?pageSize=50&key=${FIREBASE_KEY}`;
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

      // 3. Fetch latest Subscription for active business (Real-time plan upgrades from Super Admin)
      try {
        const cleanBizId = bizId.replace(/[^a-zA-Z0-9_]/g, '_');
        const subUrl = `${FIRESTORE_BASE}/servejoy_platform_subscriptions/${cleanBizId}?key=${FIREBASE_KEY}`;
        const subRes = await fetch(subUrl);
        if (subRes.ok) {
          const subData = await subRes.json();
          const subStr = subData.fields?.payload?.stringValue;
          if (subStr) {
            const remoteSub: SubscriptionDetails = JSON.parse(subStr);
            const localSub = storage.getSubscription(bizId);
            if (
              remoteSub.tier !== localSub.tier ||
              remoteSub.status !== localSub.status ||
              remoteSub.currentPeriodEnd !== localSub.currentPeriodEnd
            ) {
              storage.saveSubscription(remoteSub, bizId);
              const profile = storage.getCafeProfile(bizId);
              if (profile) {
                profile.subscriptionTier = remoteSub.tier;
                storage.saveCafeProfile(profile, bizId);
              }
              window.dispatchEvent(new Event('servejoy_sync'));
              window.dispatchEvent(new Event('servejoy_subscription_updated'));
            }
          }
        }
      } catch (subErr) {
        // Non-blocking
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

