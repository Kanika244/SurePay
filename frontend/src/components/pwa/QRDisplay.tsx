import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRDisplayProps {
    value: string;
    surePayId: string;
    name: string;
    amount?: number;
    note?: string;
}

const QRDisplay = ({ value, surePayId, name, amount, note }: QRDisplayProps) => {
    const { toast } = useToast();

    const qrData = JSON.stringify({
        surePayId,
        name,
        ...(amount && { amount }),
        ...(note && { note }),
    });

    const copyId = () => {
        navigator.clipboard.writeText(surePayId);
        toast({ title: "Copied!", description: "SurePay ID copied to clipboard" });
    };

    return (
        <Card className="bg-card border-border">
            <CardContent className="p-6 flex flex-col items-center">
                <div className="bg-primary-foreground p-4 rounded-2xl mb-4">
                    <QRCodeSVG
                        value={qrData}
                        size={200}
                        level="H"
                        includeMargin={false}
                        bgColor="white"
                        fgColor="hsl(234, 89%, 54%)"
                    />
                </div>
                <p className="font-semibold text-foreground text-lg">{name}</p>
                <p className="text-sm text-muted-foreground mb-1">{surePayId}</p>
                {amount && (
                    <p className="text-primary font-bold text-xl mt-1">₹{amount.toLocaleString()}</p>
                )}
                {note && (
                    <p className="text-xs text-muted-foreground mt-1">"{note}"</p>
                )}
                <div className="flex gap-3 mt-4">
                    <Button variant="outline" size="sm" onClick={copyId} className="gap-1.5">
                        <Copy size={14} /> Copy ID
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: "Share", description: "QR sharing opened" })}>
                        <Share2 size={14} /> Share
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default QRDisplay;
