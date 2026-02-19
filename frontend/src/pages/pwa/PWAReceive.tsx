import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import QRDisplay from "@/components/pwa/QRDisplay";

const PWAReceive = () => {
    const { user } = useIndividual();
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [showDynamic, setShowDynamic] = useState(false);

    const fullName = `${user.firstName} ${user.lastName}`;

    return (
        <div className="px-4 pt-4">
            <Link to="/app" className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <ArrowLeft size={16} /> Back
            </Link>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <h1 className="text-xl font-bold text-foreground">Receive Money</h1>

                <QRDisplay
                    value={user.surePayId}
                    surePayId={user.surePayId}
                    name={fullName}
                    amount={showDynamic ? Number(amount) : undefined}
                    note={showDynamic ? note : undefined}
                />

                <div className="space-y-3">
                    <Button variant={showDynamic ? "default" : "outline"} className="w-full" onClick={() => setShowDynamic(!showDynamic)}>
                        {showDynamic ? "Hide Amount Fields" : "Request Specific Amount"}
                    </Button>

                    {showDynamic && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">₹</span>
                                    <Input type="number" placeholder="0" className="h-12 pl-8 text-xl font-bold" value={amount} onChange={e => setAmount(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Note</Label>
                                <Input placeholder="What's this for?" value={note} onChange={e => setNote(e.target.value)} />
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default PWAReceive;
