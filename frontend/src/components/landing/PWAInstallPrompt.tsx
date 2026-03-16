import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const PWAInstallPrompt = () => {
  const isMobile = useIsMobile();
  const { promptToInstall, isInstallable, isAppInstalled } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show prompt if it's mobile, installable, not already installed, 
    // and hasn't been dismissed in this session
    const isDismissed = sessionStorage.getItem("pwaPromptDismissed") === "true";
    
    if (isMobile && isInstallable && !isAppInstalled && !isDismissed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isMobile, isInstallable, isAppInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("pwaPromptDismissed", "true");
  };

  const handleInstall = async () => {
    await promptToInstall();
    // Hide the prompt after the user clicks install, regardless of outcome
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 flex-shrink-0 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate">SurePay</span>
            <span className="text-xs text-muted-foreground truncate">Fast & Secure Payments</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={handleInstall} size="sm" className="rounded-full font-medium h-9 px-4">
            <Download className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden xs:inline">Install </span>App
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDismiss}
            className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Close prompt"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
