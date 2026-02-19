import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, ScanLine, Flashlight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

const PWAScan = () => {
    const [scanning] = useState(true);
    const navigate = useNavigate();

    const handleMockScan = () => {
        // Mock: simulate scanning a QR code
        navigate("/app/send");
    };

    return (
        <div className="min-h-screen bg-foreground/95 relative">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4 flex items-center justify-between">
                <Link to="/app" className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
                    <ArrowLeft size={20} className="text-primary-foreground" />
                </Link>
                <span className="text-primary-foreground font-semibold text-base">Scan & Pay</span>
                <button className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
                    <Flashlight size={20} className="text-primary-foreground" />
                </button>
            </div>

            {/* Scanner viewport */}
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    {/* Scanner frame */}
                    <div className="w-64 h-64 relative">
                        {/* Corner markers */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />

                        {/* Scanning line animation */}
                        {scanning && (
                            <motion.div
                                className="absolute left-2 right-2 h-0.5 bg-primary shadow-glow"
                                initial={{ top: "10%" }}
                                animate={{ top: ["10%", "90%", "10%"] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            />
                        )}
                    </div>

                    <p className="text-primary-foreground/70 text-center text-sm mt-6">
                        Point your camera at a QR code
                    </p>
                </motion.div>
            </div>

            {/* Bottom actions */}
            <div className="absolute bottom-8 left-0 right-0 px-6 space-y-3">
                <Button variant="hero" size="lg" className="w-full gap-2" onClick={handleMockScan}>
                    <Camera size={18} /> Simulate Scan
                </Button>
                <div className="flex gap-3">
                    <Button variant="glass" size="lg" className="flex-1" asChild>
                        <Link to="/app/send">Send Manually</Link>
                    </Button>
                    <Button variant="glass" size="lg" className="flex-1" asChild>
                        <Link to="/app/receive">My QR Code</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PWAScan;
