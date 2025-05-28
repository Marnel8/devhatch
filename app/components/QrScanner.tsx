"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface QrScannerProps {
  onResult: (result: string) => void
  onError?: (error: string) => void
}

export function QrScanner({ onResult, onError }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    // Cleanup function to stop scanning when component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current = null
          })
          .catch((err) => console.error("Failed to stop scanner:", err))
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      setError(null)
      const scanner = new Html5Qrcode("qr-reader")
      scannerRef.current = scanner

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      }

      setIsScanning(true)

      await scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onResult(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Ignore common scanning messages
          if (
            !errorMessage.includes("No MultiFormat Readers were able to detect the code") &&
            !errorMessage.includes("No barcode or QR code detected") &&
            !errorMessage.includes("No QR code found")
          ) {
            setError("Please make sure the QR code is clearly visible and try again.")
            if (onError) {
              onError(errorMessage)
            }
          }
        },
      )
    } catch (err) {
      console.error("Error starting scanner:", err)
      setIsScanning(false)
      setError("Failed to start camera. Please check camera permissions and try again.")
      if (onError) {
        onError("Failed to start camera. Please check camera permissions.")
      }
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        setIsScanning(false)
        setError(null)
      } catch (err) {
        console.error("Failed to stop scanner:", err)
      }
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <div
          id="qr-reader"
          className="mx-auto max-w-[400px] aspect-square bg-gray-100 rounded-lg overflow-hidden"
        />
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-sm">
            <Camera className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4 text-center px-4">
              Position the QR code within the camera view.
              <br />
              Make sure it's well-lit and clearly visible.
            </p>
            <Button onClick={startScanning} size="lg" className="w-full max-w-[200px]">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          </div>
        )}
        {isScanning && (
          <>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border-2 border-primary pointer-events-none">
              <div className="absolute inset-0 border-2 border-white/30"></div>
              <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-primary"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 border-primary"></div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              Scanning...
            </div>
          </>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isScanning && (
        <div className="text-center">
          <Button onClick={stopScanning} variant="destructive" size="lg" className="w-full max-w-[200px]">
            Stop Camera
          </Button>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        {isScanning ? (
          <p>Hold your device steady. Scanning for QR codes...</p>
        ) : (
          <p>The camera will automatically detect and process QR codes.</p>
        )}
      </div>
    </div>
  )
} 