import { WifiOff, Wifi, RefreshCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OfflineBannerProps {
    isOnline: boolean;
    wasOffline: boolean;
    pendingSyncCount: number;
    isSyncing: boolean;
    onSyncNow: () => void;
}

const OfflineBanner = ({ isOnline, wasOffline, pendingSyncCount, isSyncing, onSyncNow }: OfflineBannerProps) => {
    // No banner if online, not recently reconnected, and no pending
    if (isOnline && !wasOffline && pendingSyncCount === 0 && !isSyncing) return null;

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-secondary/15 border-b border-secondary/30 px-4 py-2 flex items-center justify-between"
                >
                    <div className="flex items-center gap-2">
                        <WifiOff size={14} className="text-secondary" />
                        <span className="text-xs font-medium text-secondary">You are offline</span>
                    </div>
                    {pendingSyncCount > 0 && (
                        <span className="text-[10px] bg-secondary/20 text-secondary rounded-full px-2 py-0.5 font-medium">
                            {pendingSyncCount} pending
                        </span>
                    )}
                </motion.div>
            )}

            {isOnline && wasOffline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-mint/15 border-b border-mint/30 px-4 py-2 flex items-center justify-between"
                >
                    <div className="flex items-center gap-2">
                        <Wifi size={14} className="text-mint" />
                        <span className="text-xs font-medium text-mint">Back online</span>
                    </div>
                </motion.div>
            )}

            {isOnline && pendingSyncCount > 0 && !wasOffline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-secondary/10 border-b border-secondary/20 px-4 py-2 flex items-center justify-between"
                >
                    <div className="flex items-center gap-2">
                        {isSyncing
                            ? <Loader2 size={14} className="text-secondary animate-spin" />
                            : <RefreshCw size={14} className="text-secondary" />}
                        <span className="text-xs font-medium text-secondary">
                            {isSyncing ? "Syncing..." : `${pendingSyncCount} transactions pending sync`}
                        </span>
                    </div>
                    {!isSyncing && (
                        <button
                            onClick={onSyncNow}
                            className="text-[10px] bg-secondary/20 text-secondary rounded-full px-2.5 py-0.5 font-medium hover:bg-secondary/30 transition-colors"
                        >
                            Sync Now
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineBanner;
