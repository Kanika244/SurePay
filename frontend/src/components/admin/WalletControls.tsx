import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Minus, Lock, Unlock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WalletControlsProps {
    entityType: "enterprise" | "employee" | "individual";
    entityId: string;
    entityName: string;
    currentBalance: number;
    isFrozen: boolean;
    onCredit: (amount: number) => void;
    onDebit: (amount: number) => void;
    onFreeze: () => void;
    onUnfreeze: () => void;
}

const WalletControls = ({
    entityType,
    entityId,
    entityName,
    currentBalance,
    isFrozen,
    onCredit,
    onDebit,
    onFreeze,
    onUnfreeze,
}: WalletControlsProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<"credit" | "debit">("credit");
    const [amount, setAmount] = useState("");

    const handleOpenDialog = (type: "credit" | "debit") => {
        setDialogType(type);
        setAmount("");
        setDialogOpen(true);
    };

    const handleConfirm = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast({
                title: "Invalid amount",
                description: "Please enter a valid positive amount",
                variant: "destructive",
            });
            return;
        }

        if (dialogType === "debit" && numAmount > currentBalance) {
            toast({
                title: "Insufficient balance",
                description: "Debit amount exceeds current balance",
                variant: "destructive",
            });
            return;
        }

        if (dialogType === "credit") {
            onCredit(numAmount);
            toast({
                title: "Wallet credited",
                description: `₹${numAmount.toLocaleString()} credited to ${entityName}`,
            });
        } else {
            onDebit(numAmount);
            toast({
                title: "Wallet debited",
                description: `₹${numAmount.toLocaleString()} debited from ${entityName}`,
            });
        }

        setDialogOpen(false);
    };

    const handleFreezeToggle = () => {
        if (isFrozen) {
            onUnfreeze();
            toast({
                title: "Wallet unfrozen",
                description: `${entityName}'s wallet has been unfrozen`,
            });
        } else {
            onFreeze();
            toast({
                title: "Wallet frozen",
                description: `${entityName}'s wallet has been frozen`,
                variant: "destructive",
            });
        }
    };

    return (
        <>
            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => handleOpenDialog("credit")}
                    disabled={isFrozen}
                >
                    <Plus size={14} />
                    Credit
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => handleOpenDialog("debit")}
                    disabled={isFrozen}
                >
                    <Minus size={14} />
                    Debit
                </Button>
                <Button
                    size="sm"
                    variant={isFrozen ? "default" : "outline"}
                    className="gap-1"
                    onClick={handleFreezeToggle}
                >
                    {isFrozen ? (
                        <>
                            <Unlock size={14} />
                            Unfreeze
                        </>
                    ) : (
                        <>
                            <Lock size={14} />
                            Freeze
                        </>
                    )}
                </Button>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogType === "credit" ? "Credit" : "Debit"} Wallet
                        </DialogTitle>
                        <DialogDescription>
                            {dialogType === "credit" ? "Add funds to" : "Remove funds from"} {entityName}'s wallet
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Current Balance</Label>
                            <p className="text-2xl font-bold">₹{currentBalance.toLocaleString()}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant={dialogType === "credit" ? "default" : "destructive"}
                            onClick={handleConfirm}
                        >
                            {dialogType === "credit" ? "Credit" : "Debit"} ₹{amount || "0"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default WalletControls;