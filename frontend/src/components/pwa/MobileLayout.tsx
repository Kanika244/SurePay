import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import OfflineBanner from "./OfflineBanner";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { syncPendingTransactions, getPendingSyncCount } from "@/lib/offlineSyncManager";
import { useToast } from "@/hooks/use-toast";
import { useIndividual } from "@/contexts/IndividualContext";

const MobileLayout = () => {
    const { isOnline, wasOffline } = useNetworkStatus();
    const { refreshWallet, refreshTransactions } = useIndividual();
    const [pendingSyncCount, setPendingSyncCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const { toast } = useToast();

    const refreshPendingCount = useCallback(async () => {
        const count = await getPendingSyncCount();
        setPendingSyncCount(count);
    }, []);

    // Check pending count on mount and network change
    useEffect(() => {
        refreshPendingCount();
    }, [isOnline, refreshPendingCount]);

    // Auto-sync when coming back online
    useEffect(() => {
        if (isOnline && wasOffline) {
            handleSync();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline, wasOffline]);

    const handleSync = async () => {
        if (isSyncing) return;
        const count = await getPendingSyncCount();
        if (count === 0) return;

        setIsSyncing(true);
        try {
            const result = await syncPendingTransactions();
            if (result.synced > 0) {
                toast({ title: "Transactions Synced", description: `${result.synced} transaction(s) synced successfully` });
                await Promise.all([refreshWallet(), refreshTransactions()]);
            }
            if (result.failed > 0) {
                toast({ title: "Sync Incomplete", description: `${result.failed} transaction(s) failed to sync`, variant: "destructive" });
            }
        } catch {
            toast({ title: "Sync Error", description: "Could not sync transactions", variant: "destructive" });
        } finally {
            setIsSyncing(false);
            refreshPendingCount();
        }
    };

    return (
        <div className="min-h-screen bg-background max-w-lg mx-auto relative">
            <OfflineBanner
                isOnline={isOnline}
                wasOffline={wasOffline}
                pendingSyncCount={pendingSyncCount}
                isSyncing={isSyncing}
                onSyncNow={handleSync}
            />
            <div className="pb-20">
                <Outlet context={{ isOnline, pendingSyncCount, refreshPendingCount, handleSync, isSyncing }} />
            </div>
            <BottomNav />
        </div>
    );
};

export default MobileLayout;
