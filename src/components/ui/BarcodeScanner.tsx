'use client';

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Maximize2 } from "lucide-react";
import { useEffect } from "react";

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (errorMessage: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function BarcodeScanner({ 
    onScanSuccess, 
    onScanError, 
    isOpen, 
    onClose 
}: BarcodeScannerProps) {
    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;

        if (isOpen) {
            // Delay slightly to ensure the modal is rendered and dimensions are stable
            const timer = setTimeout(() => {
                scanner = new Html5QrcodeScanner(
                    "reader",
                    { 
                        fps: 10, 
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    /* verbose= */ false
                );

                scanner.render(
                    (decodedText) => {
                        onScanSuccess(decodedText);
                        onClose(); // Close modal on success
                        if (scanner) scanner.clear();
                    },
                    (errorMessage) => {
                        if (onScanError) onScanError(errorMessage);
                    }
                );
            }, 300);

            return () => {
                clearTimeout(timer);
                if (scanner) {
                    scanner.clear().catch(error => {
                        console.error("Failed to clear scanner", error);
                    });
                }
            };
        }
    }, [isOpen, onScanSuccess, onScanError, onClose]);

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            size="2xl"
            backdrop="blur"
            classNames={{
                base: "bg-background border border-foreground/5 dark:bg-[#111318]",
                header: "border-b border-foreground/5",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Maximize2 size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black">Scan Barcode / QR</h3>
                                    <p className="text-xs text-foreground/50 font-medium">Position the item in front of your camera</p>
                                </div>
                            </div>
                        </ModalHeader>
                        <ModalBody className="py-6">
                            <div 
                                id="reader" 
                                className="w-full h-full min-h-[300px] overflow-hidden rounded-3xl border-2 border-dashed border-primary/20 bg-foreground/5 flex items-center justify-center relative"
                            >
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                                    <Maximize2 size={120} className="text-primary" />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={onClose} className="font-bold">
                                Close Scanner
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
