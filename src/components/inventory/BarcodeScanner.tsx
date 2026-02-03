'use client';

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { Camera, ScanBarcode, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string, format: string) => void;
}

/**
 * Barcode/QR Scanner Component
 * Uses device camera to scan barcodes and QR codes
 */
export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    setLastScanned(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        startBarcodeDetection();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  const startBarcodeDetection = () => {
    // Check for BarcodeDetector API support
    if ('BarcodeDetector' in window) {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'],
      });

      scanIntervalRef.current = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const { rawValue, format } = barcodes[0];
              if (rawValue !== lastScanned) {
                setLastScanned(rawValue);
                onScan(rawValue, format);
                
                // Haptic feedback if available
                if ('vibrate' in navigator) {
                  navigator.vibrate(200);
                }
              }
            }
          } catch {
            // Detection failed, continue scanning
          }
        }
      }, 250);
    } else {
      setError('Barcode detection is not supported in this browser. Try Chrome or Edge.');
    }
  };

  const handleManualEntry = () => {
    const code = prompt('Enter barcode/serial number manually:');
    if (code) {
      onScan(code, 'manual');
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={(open) => !open && onClose()}
      size="xl"
      radius="lg"
      classNames={{
        backdrop: "bg-black/80 backdrop-blur-md",
        base: "bg-black",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <ScanBarcode size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-black text-lg">Scan Barcode / QR</h3>
              <p className="text-xs text-white/50 font-medium">Point camera at code</p>
            </div>
          </div>
          <Button isIconOnly variant="light" onPress={onClose} className="text-white">
            <X size={20} />
          </Button>
        </ModalHeader>
        
        <ModalBody className="p-0">
          <div className="relative aspect-video bg-black overflow-hidden">
            {/* Camera Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Scan Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 relative">
                {/* Corner Markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                
                {/* Scanning Line Animation */}
                {isScanning && (
                  <div className="absolute inset-x-2 h-0.5 bg-primary animate-pulse" 
                    style={{ 
                      animation: 'scanline 2s ease-in-out infinite',
                      top: '50%'
                    }} 
                  />
                )}
              </div>
            </div>
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
            
            {/* Error Message */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center p-6">
                  <Camera size={48} className="mx-auto mb-4 text-white/30" />
                  <p className="text-white/70 text-sm mb-4">{error}</p>
                  <Button color="primary" onPress={handleManualEntry}>
                    Enter Manually
                  </Button>
                </div>
              </div>
            )}
            
            {/* Last Scanned */}
            {lastScanned && (
              <div className="absolute bottom-4 left-4 right-4 bg-success/90 text-white p-3 rounded-xl">
                <p className="text-xs font-bold uppercase opacity-70">Scanned:</p>
                <p className="font-black text-lg truncate">{lastScanned}</p>
              </div>
            )}
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </ModalBody>
        
        <ModalFooter className="bg-black border-t border-white/10">
          <Button variant="flat" onPress={handleManualEntry} className="text-white">
            <ScanBarcode size={16} />
            Manual Entry
          </Button>
          <Button color="primary" onPress={onClose} className="font-black">
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
      
      <style jsx global>{`
        @keyframes scanline {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
      `}</style>
    </Modal>
  );
}
