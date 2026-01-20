import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera, Check, RefreshCw, Upload, AlertCircle, Sun, Glasses, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface KYCSelfieData {
  selfieImage: string | null;
  livenessCompleted: boolean;
}

interface KYCSelfieCaptureProps {
  data: KYCSelfieData;
  onUpdate: (data: KYCSelfieData) => void;
  onContinue: () => void;
  onBack: () => void;
}

type CaptureStep = 'instructions' | 'camera' | 'preview' | 'upload-fallback';

const KYCSelfieCapture = ({ data, onUpdate, onContinue, onBack }: KYCSelfieCaptureProps) => {
  const [step, setStep] = useState<CaptureStep>('instructions');
  const [cameraError, setCameraError] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const instructions = [
    { icon: Sun, text: "Ensure good lighting on your face" },
    { icon: Glasses, text: "Remove glasses or face coverings" },
    { icon: User, text: "Keep your face centered in the frame" },
  ];

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStep('camera');
      setCameraError(false);
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError(true);
      setStep('upload-fallback');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onUpdate({ ...data, selfieImage: imageData, livenessCompleted: true });
        stopCamera();
        setStep('preview');
      }
    }
  }, [data, onUpdate, stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        onUpdate({ ...data, selfieImage: imageData, livenessCompleted: true });
        setStep('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    onUpdate({ ...data, selfieImage: null, livenessCompleted: false });
    startCamera();
  };

  const handleContinue = () => {
    if (data.selfieImage) {
      onContinue();
    }
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
          <motion.div
            key="instructions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-center py-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-primary/50" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full border-2 border-primary/20"
                />
              </div>
            </div>

            <div className="space-y-3">
              {instructions.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">{item.text}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1 h-12"
              >
                Back
              </Button>
              <Button
                onClick={startCamera}
                className="flex-1 h-12 gradient-primary hover:opacity-90"
              >
                <Camera className="w-4 h-4 mr-2" />
                Open Camera
              </Button>
            </div>
          </motion.div>
        )}

        {/* Camera View */}
        {step === 'camera' && (
          <motion.div
            key="camera"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="relative aspect-[3/4] max-h-[400px] rounded-2xl overflow-hidden bg-foreground/5">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Face outline overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 border-4 border-white/50 rounded-[50%]" />
              </div>

              {/* Liveness indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
                <p className="text-xs text-white font-medium">Position your face in the oval</p>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  stopCamera();
                  setStep('instructions');
                }}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                onClick={capturePhoto}
                className="flex-1 h-12 gradient-primary hover:opacity-90"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
            </div>
          </motion.div>
        )}

        {/* Preview */}
        {step === 'preview' && data.selfieImage && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="relative aspect-[3/4] max-h-[400px] rounded-2xl overflow-hidden">
              <img
                src={data.selfieImage}
                alt="Captured selfie"
                className="w-full h-full object-cover"
              />
              
              {/* Verified badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute top-4 right-4"
              >
                <div className="w-10 h-10 rounded-full bg-mint flex items-center justify-center shadow-lg">
                  <Check className="w-5 h-5 text-mint-foreground" />
                </div>
              </motion.div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRetake}
                className="flex-1 h-12"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1 h-12 gradient-primary hover:opacity-90"
              >
                Confirm & Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Upload Fallback */}
        {step === 'upload-fallback' && (
          <motion.div
            key="upload-fallback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive text-sm">Camera not available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please upload a clear selfie photo instead
                  </p>
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
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <div className="space-y-2">
              {instructions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={onBack}
              className="w-full h-12"
            >
              Back
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default KYCSelfieCapture;
