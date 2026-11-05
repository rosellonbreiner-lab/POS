"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  X,
  Camera,
  Zap,
  AlertCircle,
  RefreshCw,
  Barcode,
  FlipHorizontal,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { playScanBeep } from "@/lib/sound";

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
}

export function CameraScannerModal({
  isOpen,
  onClose,
  onScan,
  title = "Escanear Código de Barras con la Cámara",
}: CameraScannerModalProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  // Referencias para video nativo y fallback
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isStoppingRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scannerContainerId = "live-camera-barcode-container";

  // Detener todos los flujos de cámara y procesos de escaneo
  const stopAllStreams = useCallback(() => {
    isStoppingRef.current = true;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
      } catch {}
    }
  }, []);

  // Manejador cuando se detecta un código con éxito
  const handleScanSuccess = useCallback(
    (codeText: string) => {
      const clean = codeText.trim();
      if (!clean || isStoppingRef.current) return;

      setDetectedCode(clean);
      playScanBeep(true);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(100);
        } catch {}
      }

      // Detener cámara inmediatamente para evitar lecturas duplicadas
      stopAllStreams();

      // Pequeña pausa de 350ms para feedback visual verde antes de entregar el resultado
      setTimeout(() => {
        onScan(clean);
        onClose();
      }, 350);
    },
    [onScan, onClose, stopAllStreams]
  );

  // Iniciar la cámara en vivo
  const startLiveCamera = useCallback(async () => {
    setIsStarting(true);
    setCameraError(null);
    setDetectedCode(null);
    isStoppingRef.current = false;

    // Verificar si el navegador soporta getUserMedia
    const hasMedia =
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function";

    if (!hasMedia) {
      setIsStarting(false);
      setIsLiveActive(false);
      setCameraError(
        "Tu navegador móvil no tiene acceso al video en vivo de la cámara. Si estás navegando por HTTP en red local, el navegador exige HTTPS o permiso local."
      );
      return;
    }

    // 1. INTENTO PRINCIPAL: getUserMedia directo con aceleración por hardware
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
        audio: false,
      });

      if (isStoppingRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      // Comprobar soporte de linterna en el track de video
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          const caps = (videoTrack.getCapabilities && videoTrack.getCapabilities()) as any;
          if (caps && caps.torch) {
            setHasTorch(true);
          }
        } catch {}
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsLiveActive(true);
      setIsStarting(false);

      // Comprobar si existe BarcodeDetector nativo (Chrome Android, Edge, etc.)
      const hasNativeBarcodeDetector =
        typeof window !== "undefined" && "BarcodeDetector" in window;

      if (hasNativeBarcodeDetector) {
        try {
          const detector = new (window as any).BarcodeDetector({
            formats: [
              "ean_13",
              "ean_8",
              "code_128",
              "code_39",
              "code_93",
              "upc_a",
              "upc_e",
              "itf",
              "qr_code",
              "data_matrix",
            ],
          });

          // Bucle de escaneo nativo a 60 FPS
          const scanNativeLoop = async () => {
            if (isStoppingRef.current || !videoRef.current) return;

            try {
              if (videoRef.current.readyState >= 2) {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                  handleScanSuccess(barcodes[0].rawValue);
                  return;
                }
              }
            } catch (err) {
              // Frame sin detección o formato no estándar
            }

            animFrameRef.current = requestAnimationFrame(scanNativeLoop);
          };

          animFrameRef.current = requestAnimationFrame(scanNativeLoop);
          return;
        } catch (e) {
          console.warn("Fallo BarcodeDetector nativo, recurriendo a Html5Qrcode:", e);
        }
      }

      // Si no hay BarcodeDetector nativo (ej: Safari en iOS), usamos Html5Qrcode sobre el elemento
      startHtml5QrcodeFallback();
    } catch (err: any) {
      console.warn("Error al iniciar video nativo, intentando Html5Qrcode directo:", err);
      startHtml5QrcodeFallback();
    }
  }, [facingMode, handleScanSuccess]);

  // Fallback con Html5Qrcode
  const startHtml5QrcodeFallback = async () => {
    try {
      await new Promise((r) => setTimeout(r, 150));
      const container = document.getElementById(scannerContainerId);
      if (!container || isStoppingRef.current) return;

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId, { verbose: false });
      }
      const scanner = html5QrCodeRef.current;

      await scanner.start(
        { facingMode: facingMode },
        {
          fps: 20,
          qrbox: (viewWidth, viewHeight) => ({
            width: Math.min(300, Math.floor(viewWidth * 0.85)),
            height: Math.min(180, Math.floor(viewHeight * 0.55)),
          }),
          aspectRatio: 1.333333,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {}
      );

      setIsLiveActive(true);
      setIsStarting(false);
    } catch (fallbackErr: any) {
      console.error("No se pudo iniciar la cámara:", fallbackErr);
      setIsStarting(false);
      setIsLiveActive(false);
      setCameraError(
        "No se pudo acceder a la cámara. Por favor autoriza los permisos de cámara en tu navegador."
      );
    }
  };

  // Alternar linterna (Flash)
  const toggleTorch = async () => {
    if (!streamRef.current && !html5QrCodeRef.current) return;
    const newTorch = !torchOn;

    try {
      if (streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        if (track) {
          await (track as any).applyConstraints({
            advanced: [{ torch: newTorch }],
          });
          setTorchOn(newTorch);
          return;
        }
      }

      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.applyVideoConstraints({
          advanced: [{ torch: newTorch }] as any,
        });
        setTorchOn(newTorch);
      }
    } catch (err) {
      console.warn("No se pudo alternar la linterna:", err);
    }
  };

  // Cambiar entre cámara trasera y delantera
  const toggleFacingMode = () => {
    stopAllStreams();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Foto de respaldo si el navegador móvil no permite video en vivo por HTTP
  const handleFileCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId, { verbose: false });
      }
      const decodedText = await html5QrCodeRef.current.scanFile(file, false);
      if (decodedText && decodedText.trim()) {
        handleScanSuccess(decodedText.trim());
      } else {
        setCameraError("No se detectó un código de barras en la imagen. Intenta de nuevo.");
      }
    } catch (err) {
      setCameraError("No se pudo leer el código. Enfoca de cerca con buena iluminación.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScanSuccess(manualCode.trim());
  };

  // Efecto de apertura/cierre del modal
  useEffect(() => {
    if (!isOpen) {
      stopAllStreams();
      return;
    }

    startLiveCamera();

    return () => {
      stopAllStreams();
    };
  }, [isOpen, facingMode, startLiveCamera, stopAllStreams]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-4 flex justify-center items-center select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileCapture}
      />

      <div className="w-full max-w-md bg-[#13161F] border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-[#181B26] to-[#13161F]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5AA9E6]/20 border border-[#5AA9E6]/40 flex items-center justify-center text-[#5AA9E6] shadow-[0_0_15px_rgba(90,169,230,0.3)]">
              <Camera className="w-5 h-5 text-[#5AA9E6]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
              <p className="text-[11px] text-[#5AA9E6] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Cámara en vivo activa</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-white p-2 rounded-xl hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visor de la Cámara en Vivo */}
        <div className="p-4 flex flex-col items-center">
          <div className="w-full h-72 sm:h-80 bg-black rounded-2xl overflow-hidden relative border border-white/15 flex items-center justify-center shadow-inner group">
            {/* 1. Elemento de Video Nativo (Directo con getUserMedia) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                isLiveActive && !detectedCode ? "opacity-100" : "opacity-90"
              }`}
            />

            {/* 2. Contenedor Fallback Html5Qrcode */}
            <div
              id={scannerContainerId}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* 3. Retícula / Láser de Escaneo Continuo en Vivo */}
            {isLiveActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Cuadro objetivo de escaneo con esquinas brillantes */}
                <div
                  className={`w-64 h-36 border-2 rounded-2xl relative transition-all duration-200 ${
                    detectedCode
                      ? "border-[#10B981] bg-[#10B981]/20 shadow-[0_0_35px_rgba(16,185,129,0.8)] scale-105"
                      : "border-[#5AA9E6]/80 shadow-[0_0_25px_rgba(90,169,230,0.4)]"
                  }`}
                >
                  {/* Esquinas de enfoque estilo HUD */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-[#22D3EE] rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-[#22D3EE] rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-[#22D3EE] rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-[#22D3EE] rounded-br-lg" />

                  {/* Línea Láser Roja/Cyan animada que barre el código */}
                  {!detectedCode && (
                    <div
                      className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent shadow-[0_0_12px_#22D3EE]"
                      style={{
                        animation: "scannerLine 1.8s ease-in-out infinite alternate",
                      }}
                    />
                  )}

                  {/* Mensaje de éxito al detectar el código */}
                  {detectedCode && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#10B981]/25 backdrop-blur-[2px] rounded-2xl">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
                      <span className="text-xs font-mono font-black text-white mt-1 bg-black/80 px-2.5 py-0.5 rounded-full border border-emerald-400/50">
                        {detectedCode}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <Barcode className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span className="text-[11px] text-white font-medium">
                    Apunta la cámara al código de barras
                  </span>
                </div>
              </div>
            )}

            {/* Spinner de conexión inicial */}
            {isStarting && (
              <div className="absolute inset-0 bg-[#0B0D12] flex flex-col items-center justify-center gap-3 p-4 text-center z-10">
                <RefreshCw className="w-8 h-8 text-[#5AA9E6] animate-spin" />
                <span className="text-xs text-white font-semibold">
                  Encendiendo cámara en vivo...
                </span>
                <span className="text-[11px] text-[#9CA3AF]">
                  Apuntando al lector automático continuo
                </span>
              </div>
            )}

            {/* Botones flotantes sobre el video: Linterna y Voltear Cámara */}
            {isLiveActive && (
              <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                {hasTorch && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`p-2.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-lg ${
                      torchOn
                        ? "bg-amber-400 text-black border-amber-300 shadow-amber-400/40"
                        : "bg-black/60 text-white border-white/20 hover:bg-black/80"
                    }`}
                    title={torchOn ? "Apagar linterna" : "Encender linterna"}
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
                  title="Cambiar de cámara"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mensaje si la cámara fue bloqueada por el navegador */}
            {cameraError && (
              <div className="absolute inset-0 bg-[#0E1118]/95 p-6 flex flex-col items-center justify-center text-center gap-3 z-30">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Cámara restringida</h4>
                  <p className="text-xs text-[#9CA3AF] mt-1 max-w-xs">{cameraError}</p>
                </div>

                <div className="flex gap-2 w-full mt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => startLiveCamera()}
                    className="flex-1 text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Reintentar
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1" />
                    Abrir Cámara Foto
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Ingreso manual como respaldo si el código de barras está roto o rayado */}
          <div className="w-full mt-3 pt-3 border-t border-white/[0.08]">
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="O escribe el código aquí..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#0B0D12] border border-white/10 rounded-xl text-white placeholder-[#6B7280] focus:outline-none focus:border-[#5AA9E6]"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={!manualCode.trim()}
                className="text-xs shrink-0 px-3 cursor-pointer"
              >
                Ingresar
              </Button>
            </form>
          </div>

          {/* Ayuda de cómo funciona el escáner continuo */}
          <div className="w-full mt-2.5">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-[11px] text-[#9CA3AF] hover:text-white flex items-center gap-1 mx-auto transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#5AA9E6]" />
              <span>¿Cómo funciona el escáner automático?</span>
            </button>

            {showHelp && (
              <div className="mt-2 p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-[11px] text-[#9CA3AF] space-y-1.5 text-left animate-in fade-in duration-150">
                <div className="flex items-start gap-1.5 text-white font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Detección continua instantánea</span>
                </div>
                <p className="pl-5 text-[#9CA3AF]">
                  La cámara analiza el video en tiempo real. Tan pronto el código de barras pase por el visor, sonará el pitido de confirmación y lo agregará al sistema automáticamente.
                </p>
                <div className="flex items-start gap-1.5 text-white font-medium pt-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Linterna integrada</span>
                </div>
                <p className="pl-5 text-[#9CA3AF]">
                  Si el lugar tiene poca luz, toca el botón de linterna arriba a la derecha para iluminar el código.
                </p>
              </div>
            )}
          </div>

          {/* Botón Cerrar */}
          <div className="w-full mt-3 flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-xs text-[#9CA3AF] hover:text-white cursor-pointer"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>

      {/* Animación CSS para la línea de barrido del láser */}
      <style jsx global>{`
        @keyframes scannerLine {
          0% {
            top: 8%;
            opacity: 0.7;
          }
          50% {
            top: 92%;
            opacity: 1;
          }
          100% {
            top: 8%;
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
