/**
 * Offline Sync Manager
 * Handles queuing, syncing, and reconciliation of offline transactions.
 */

import {
  offlineTransactions,
  cachedWallets,
  type OfflineTransaction,
  type CachedWallet,
} from "./offlineDb";
import type { WalletData, Transaction } from "@/contexts/IndividualContext";

// Validate a transaction against cached wallet data
export function validateOfflineTransaction(
  amount: number,
  wallet: WalletData | CachedWallet,
  walletType: "personal" | "employer"
): { valid: boolean; reason?: string } {
  if (amount <= 0) return { valid: false, reason: "Amount must be greater than zero" };

  const balance = "balance" in wallet ? wallet.balance : 0;
  if (balance < amount) return { valid: false, reason: "Insufficient balance" };

  if ("frozen" in wallet && wallet.frozen) return { valid: false, reason: "Wallet is frozen" };

  // Employer wallet constraints
  if (walletType === "employer") {
    const maxPerTx = "max_per_transaction" in wallet
      ? wallet.max_per_transaction
      : "maxPerTransaction" in wallet
        ? (wallet as WalletData).maxPerTransaction
        : undefined;

    if (maxPerTx && amount > maxPerTx) {
      return { valid: false, reason: `Exceeds per-transaction limit of ₹${maxPerTx.toLocaleString()}` };
    }

    const monthlyLimit = "monthly_limit" in wallet
      ? wallet.monthly_limit
      : "monthlyLimit" in wallet
        ? (wallet as WalletData).monthlyLimit
        : undefined;

    const spentThisMonth = "spent_this_month" in wallet
      ? wallet.spent_this_month
      : "spentThisMonth" in wallet
        ? (wallet as WalletData).spentThisMonth
        : 0;

    if (monthlyLimit && (spentThisMonth || 0) + amount > monthlyLimit) {
      return { valid: false, reason: "Exceeds monthly spending limit" };
    }
  }

  return { valid: true };
}

// Cache wallet state to IndexedDB
export async function cacheWalletState(wallets: WalletData[], userId: string): Promise<void> {
  for (const w of wallets) {
    const cached: CachedWallet = {
      user_id: userId,
      wallet_id: w.id,
      wallet_type: w.type,
      balance: w.balance,
      employer_balance: w.type === "employer" ? w.balance : undefined,
      monthly_limit: w.monthlyLimit,
      spent_this_month: w.spentThisMonth,
      max_per_transaction: w.maxPerTransaction,
      frozen: w.frozen,
      last_updated: new Date().toISOString(),
    };
    await cachedWallets.save(cached);
  }
}

// Cache recent transactions
export async function cacheTransactions(transactions: Transaction[]): Promise<void> {
  const { cachedTransactionsDb } = await import("./offlineDb");
  // Only cache the last 20
  const toCache = transactions.slice(0, 20);
  await cachedTransactionsDb.clear();
  for (const tx of toCache) {
    await cachedTransactionsDb.save({
      id: tx.id,
      data: JSON.stringify(tx),
      cached_at: new Date().toISOString(),
    });
  }
}

import { API_BASE_URL } from "@/services/config";

// Real-world sync: Call the backend API
async function syncTransaction(tx: OfflineTransaction): Promise<{ success: boolean; reason?: string }> {
  try {
    const endpoint = tx.wallet_type === "employer" 
      ? `${API_BASE_URL}/api/v1/wallet/individual/employer-transfer`
      : `${API_BASE_URL}/api/v1/wallet/individual/transfer`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_user_id: tx.sender_id,
        receiver_id: tx.receiver_id,
        amount: tx.amount,
        note: tx.note
      }),
    });

    const data = await res.json();

    if (res.ok && data.status === "success") {
      return { success: true };
    } else {
      return { success: false, reason: data.detail || data.message || "Transfer failed" };
    }
  } catch (err) {
    console.error("Sync Error:", err);
    return { success: false, reason: "Network or Server Error" };
  }
}

export interface SyncResult {
  synced: number;
  failed: number;
  results: Array<{ id: string; success: boolean; reason?: string }>;
}

// Sync all pending offline transactions sequentially
export async function syncPendingTransactions(): Promise<SyncResult> {
  const pending = await offlineTransactions.getPending();
  const failed = await offlineTransactions.getFailed();
  const toSync = [...pending, ...failed.filter(f => f.retry_count < 3)];

  const result: SyncResult = { synced: 0, failed: 0, results: [] };

  for (const tx of toSync) {
    // Mark as syncing
    await offlineTransactions.update({ ...tx, status: "syncing" });

    const syncResult = await syncTransaction(tx);

    if (syncResult.success) {
      await offlineTransactions.update({ ...tx, status: "synced" });
      result.synced++;
      result.results.push({ id: tx.id, success: true });
    } else {
      await offlineTransactions.update({
        ...tx,
        status: "failed",
        retry_count: tx.retry_count + 1,
        error_reason: syncResult.reason,
      });
      result.failed++;
      result.results.push({ id: tx.id, success: false, reason: syncResult.reason });
    }
  }

  return result;
}

// Get count of pending offline transactions
export async function getPendingSyncCount(): Promise<number> {
  const pending = await offlineTransactions.getPending();
  const failed = await offlineTransactions.getFailed();
  return pending.length + failed.filter(f => f.retry_count < 3).length;
}

// Revert a failed transaction's wallet deduction
export async function revertFailedTransaction(tx: OfflineTransaction): Promise<void> {
  const wallet = await cachedWallets.get(tx.wallet_id);
  if (wallet) {
    wallet.balance += tx.amount;
    if (wallet.wallet_type === "employer" && wallet.spent_this_month !== undefined) {
      wallet.spent_this_month = Math.max(0, wallet.spent_this_month - tx.amount);
    }
    wallet.last_updated = new Date().toISOString();
    await cachedWallets.save(wallet);
  }
}
