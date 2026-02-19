/**
 * IndexedDB wrapper for offline-first PWA storage.
 * Tables: offline_transactions, cached_wallet, cached_transactions, cached_profile
 */

const DB_NAME = "surepay_offline";
const DB_VERSION = 1;

export interface OfflineTransaction {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  wallet_type: "personal" | "employer";
  wallet_id: string;
  note: string;
  created_at: string;
  status: "pending" | "syncing" | "failed" | "synced";
  retry_count: number;
  error_reason?: string;
}

export interface CachedWallet {
  user_id: string;
  wallet_id: string;
  wallet_type: "personal" | "employer";
  balance: number;
  employer_balance?: number;
  monthly_limit?: number;
  spent_this_month?: number;
  max_per_transaction?: number;
  frozen: boolean;
  last_updated: string;
}

export interface CachedTransaction {
  id: string;
  data: string; // JSON serialized transaction
  cached_at: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("offline_transactions")) {
        const txStore = db.createObjectStore("offline_transactions", { keyPath: "id" });
        txStore.createIndex("status", "status", { unique: false });
        txStore.createIndex("created_at", "created_at", { unique: false });
      }

      if (!db.objectStoreNames.contains("cached_wallets")) {
        db.createObjectStore("cached_wallets", { keyPath: "wallet_id" });
      }

      if (!db.objectStoreNames.contains("cached_transactions")) {
        db.createObjectStore("cached_transactions", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("cached_profile")) {
        db.createObjectStore("cached_profile", { keyPath: "user_id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generic helpers
async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function get<T>(storeName: string, key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function put<T>(storeName: string, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(value);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
}

async function remove(storeName: string, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.delete(key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
}

async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.clear();
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllByIndex<T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

// ===================== OFFLINE TRANSACTIONS =====================

export const offlineTransactions = {
  add: (tx: OfflineTransaction) => put("offline_transactions", tx),
  getAll: () => getAll<OfflineTransaction>("offline_transactions"),
  getPending: () => getAllByIndex<OfflineTransaction>("offline_transactions", "status", "pending"),
  getFailed: () => getAllByIndex<OfflineTransaction>("offline_transactions", "status", "failed"),
  get: (id: string) => get<OfflineTransaction>("offline_transactions", id),
  update: (tx: OfflineTransaction) => put("offline_transactions", tx),
  remove: (id: string) => remove("offline_transactions", id),
  clear: () => clearStore("offline_transactions"),
};

// ===================== CACHED WALLETS =====================

export const cachedWallets = {
  save: (wallet: CachedWallet) => put("cached_wallets", wallet),
  get: (walletId: string) => get<CachedWallet>("cached_wallets", walletId),
  getAll: () => getAll<CachedWallet>("cached_wallets"),
  clear: () => clearStore("cached_wallets"),
};

// ===================== CACHED TRANSACTIONS =====================

export const cachedTransactionsDb = {
  save: (tx: CachedTransaction) => put("cached_transactions", tx),
  getAll: () => getAll<CachedTransaction>("cached_transactions"),
  clear: () => clearStore("cached_transactions"),
};

// ===================== CACHE INVALIDATION =====================

export async function clearAllCaches(): Promise<void> {
  await Promise.all([
    clearStore("offline_transactions"),
    clearStore("cached_wallets"),
    clearStore("cached_transactions"),
    clearStore("cached_profile"),
  ]);
}

export function generateOfflineTxId(): string {
  return `OTX-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}
