import { motion } from "framer-motion";
import { ArrowLeft, Copy, Share2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const PWASurePayId = () => {
    const { user } = useIndividual();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(user.surePayId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="px-4 pt-4">
            <div className="flex items-center gap-3 mb-5">
                <Link to="/app/profile"><ArrowLeft size={20} className="text-muted-foreground" /></Link>
                <h1 className="text-lg font-bold text-foreground">SurePay ID</h1>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* ID Display */}
                <div className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                        <span className="text-2xl font-bold text-primary">₹</span>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Your SurePay ID</p>
                        <p className="text-lg font-bold text-foreground break-all">{user.surePayId}</p>
                    </div>
                    <div className="flex gap-2 justify-center pt-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
                            {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            {copied ? "Copied!" : "Copy ID"}
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2"
                            onClick={() => navigator.share?.({ text: user.surePayId, title: "My SurePay ID" })}>
                            <Share2 size={14} />Share
                        </Button>
                    </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground text-center">
                        Share your SurePay ID with others so they can send you money directly without needing your phone number.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default PWASurePayId;