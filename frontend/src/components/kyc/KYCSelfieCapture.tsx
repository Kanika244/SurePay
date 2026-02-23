import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera, Check, RefreshCw, Upload, AlertCircle, Sun, Glasses, User } from "lucide-react";

interface KYCSelfieData {
  selfieImage: string | null;
  livenessCompleted: boolean;
}

interface KYCSelfieCaptureProps {
  data: KYCSelfieData;
  onUpdate: (data: KYCSelfieData) => void;
  onContinue: () => void;
  onBack: () => void;
  loading?: boolean;
}

type CaptureStep = 'instructions' | 'camera' | 'preview' | 'upload-fallback';

const KYCSelfieCapture = ({ data, onUpdate, onContinue, onBack, loading }: KYCSelfieCaptureProps) => {
  const [step, setStep] = useState<CaptureStep>('instructions');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const instructions = [
    { icon: Sun, text: "Ensure good lighting on your face" },
    { icon: Glasses, text: "Remove glasses or face coverings" },
    { icon: User, text: "Keep your face centered in the frame" },
  ];

  // Attach stream via ref callback so it fires the moment the <video> node mounts,
  // avoiding the AnimatePresence race condition that caused the black screen.
  const videoRefCallback = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (node && stream) {
        node.srcObject = stream;
        node.play().catch(console.error);
      }
    },
    [stream]
  );

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      setStep('camera');
      setCameraReady(false);
    } catch (error) {
      console.error('Camera error:', error);
      setStep('upload-fallback');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setCameraReady(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onUpdate({ selfieImage: imageData, livenessCompleted: true });
    stopCamera();
    setStep('preview');
  }, [onUpdate, stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imageData = ev.target?.result as string;
      onUpdate({ selfieImage: imageData, livenessCompleted: true });
      setStep('preview');
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    onUpdate({ selfieImage: null, livenessCompleted: false });
    startCamera();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 py-4"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Selfie Verification</h2>
        <p className="text-sm text-muted-foreground">Take a clear selfie for liveness check</p>
      </div>

      <AnimatePresence mode="wait">

        {/* Instructions */}
        {step === 'instructions' && (
          <motion.div key="instructions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex justify-center py-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-primary/50" />
                </div>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full border-2 border-primary/20" />
              </div>
            </div>

            <div className="space-y-3">
              {instructions.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">{item.text}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onBack} className="flex-1 h-12">Back</Button>
              <Button onClick={startCamera} className="flex-1 h-12 gradient-primary hover:opacity-90">
                <Camera className="w-4 h-4 mr-2" />Open Camera
              </Button>
            </div>
          </motion.div>
        )}

        {/* Camera View */}
        {step === 'camera' && (
          <motion.div key="camera" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="relative aspect-[3/4] max-h-[400px] rounded-2xl overflow-hidden bg-black">
              <video
                ref={videoRefCallback}
                autoPlay
                playsInline
                muted
                onCanPlay={() => setCameraReady(true)}
                className="w-full h-full object-cover"
              />

              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <p className="text-white text-sm">Starting camera...</p>
                </div>
              )}

              {/* Face oval overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 border-4 border-white/50 rounded-[50%]" />
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
                <p className="text-xs text-white font-medium">Position your face in the oval</p>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { stopCamera(); setStep('instructions'); }} className="flex-1 h-12">
                Cancel
              </Button>
              <Button onClick={capturePhoto} disabled={!cameraReady} className="flex-1 h-12 gradient-primary hover:opacity-90">
                <Camera className="w-4 h-4 mr-2" />Capture
              </Button>
            </div>
          </motion.div>
        )}

        {/* Preview */}
        {step === 'preview' && data.selfieImage && (
          <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="relative aspect-[3/4] max-h-[400px] rounded-2xl overflow-hidden">
              <img src={data.selfieImage} alt="Captured selfie" className="w-full h-full object-cover" />
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="absolute top-4 right-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRetake} className="flex-1 h-12">
                <RefreshCw className="w-4 h-4 mr-2" />Retake
              </Button>
              <Button onClick={onContinue} disabled={loading} className="flex-1 h-12 gradient-primary hover:opacity-90">
                {loading ? "Uploading..." : "Confirm & Continue"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Upload Fallback */}
        {step === 'upload-fallback' && (
          <motion.div key="upload-fallback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive text-sm">Camera not available</p>
                  <p className="text-xs text-muted-foreground mt-1">Please upload a clear selfie photo instead</p>
                </div>
              </div>
            </div>

            <label className="block cursor-pointer">
              <div className="p-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 transition-colors">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Upload Selfie</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>
              <input type="file" accept="image/*" capture="user" onChange={handleFileUpload} className="hidden" />
            </label>

            <Button variant="outline" onClick={onBack} className="w-full h-12">Back</Button>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
};

export default KYCSelfieCapture;