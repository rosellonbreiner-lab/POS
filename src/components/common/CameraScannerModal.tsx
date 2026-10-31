"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  X,
  Camera,
  Zap,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  HelpCircle,
  CheckCircle2,
  Barcode,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

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
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoStatus, setPhotoStatus] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scannerContainerId = "camera-barcode-reader-box";

  const playBeep = () => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1900, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext may be restricted
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    const clean = decodedText.trim();
    if (!clean) return;
    playBeep();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(100);
      } catch {}
    }
    // Stop live scanner if running
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
        onScan(clean);
        onClose();
      });
    } else {
      onScan(clean);
      onClose();
    }
  };

  // Intentar iniciar video en vivo si el navegador lo soporta de forma segura
  const tryStartLiveCamera = async () => {
    setIsStarting(true);
    setCameraError(null);

    // Los navegadores restringen getUserMedia si no es HTTPS ni localhost
    const isSecure =
      typeof window !== "undefined" &&
      (window.isSecureContext ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    const hasMedia =
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function";

    if (!isSecure && !hasMedia) {
      setIsStarting(false);
      setIsLiveActive(false);
      setCameraError(
        "Chrome en móvil bloquea el video en vivo sobre HTTP sin certificado. Usa el botón 'Tomar Foto con la Cámara' abajo que funciona al 100% de inmediato."
      );
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (!document.getElementById(scannerContainerId)) return;

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }
      const scanner = html5QrCodeRef.current;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.333,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Frame sin código
        }
      );

      setIsLiveActive(true);
      setIsStarting(false);

      try {
        const capabilities = scanner.getRunningTrackCapabilities();
        if (capabilities && (capabilities as any).torch) {
          setHasTorch(true);
        }
      } catch {}
    } catch (err: any) {
      console.warn("No se pudo iniciar video continuo:", err);
      setIsStarting(false);
      setIsLiveActive(false);
      setCameraError(
        "El navegador móvil no permitió iniciar el video en vivo. ¡No te preocupes! Puedes usar el botón 'Tomar Foto con la Cámara' de abajo que funciona directamente sin restricciones."
      );
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setCameraError(null);
    setPhotoStatus(null);
    setIsProcessingPhoto(false);
    setTorchOn(false);
    setHasTorch(false);
    setManualCode("");

    // Intentar iniciar la cámara
    tryStartLiveCamera();

    return () => {
      mounted = false;
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().catch(() => {});
          }
        } catch {}
      }
    };
  }, [isOpen]);

  const toggleTorch = async () => {
    if (!html5QrCodeRef.current || !hasTorch) return;
    try {
      const newState = !torchOn;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: newState }] as any,
      });
      setTorchOn(newState);
    } catch (err) {
      console.warn("No se pudo alternar linterna:", err);
    }
  };

  // Disparar captura nativa de cámara móvil
  const triggerCameraPhoto = () => {
    fileInputRef.current?.click();
  };

  // Procesar imagen capturada con la cámara o galería
  const handleFileCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPhoto(true);
    setPhotoStatus("Leyendo código de barras de la foto...");
    setCameraError(null);

    try {
      // Detener escáner en vivo si estuviera corriendo
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        try {
          await html5QrCodeRef.current.stop();
          setIsLiveActive(false);
        } catch {}
      }

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }
      const scanner = html5QrCodeRef.current;

      const decodedText = await scanner.scanFile(file, false);
      if (decodedText && decodedText.trim()) {
        handleScanSuccess(decodedText.trim());
      } else {
        setCameraError(
          "No se detectó un código de barras en la foto. Intenta tomarla más cerca y con buena iluminación."
        );
      }
    } catch (err: any) {
      console.error("Error al procesar foto:", err);
      setCameraError(
        "No se pudo leer el código en la foto. Asegúrate de enfocar bien las barras y que no tenga reflejos."
      );
    } finally {
      setIsProcessingPhoto(false);
      setPhotoStatus(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScanSuccess(manualCode.trim());
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-4 flex justify-center items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Input invisible que abre la cámara nativa del teléfono */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileCapture}
      />

      <div className="w-full max-w-md bg-[#13161F] border border-white/20 rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-[#181B26] to-[#13161F]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5AA9E6]/15 border border-[#5AA9E6]/30 flex items-center justify-center text-[#5AA9E6] shadow-[0_0_15px_rgba(255,106,26,0.2)]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[11px] text-[#9CA3AF]">
                Cámara móvil · Repuestos y Productos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visor o Panel de Captura */}
        <div className="p-4 flex flex-col items-center">
          <div className="w-full bg-black rounded-xl overflow-hidden relative border border-white/10 min-h-[240px] flex items-center justify-center shadow-inner">
            {/* Contenedor del scanner HTML5 (requerido por la librería) */}
            <div
              id={scannerContainerId}
              className={`w-full h-full ${!isLiveActive ? "hidden" : "block"}`}
            ></div>

            {/* Guía visual cuando el video en vivo está activo */}
            {isLiveActive && !isStarting && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-64 h-32 border-2 border-[#5AA9E6]/90 rounded-xl relative shadow-[0_0_20px_rgba(255,106,26,0.4)] animate-pulse">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#22D3EE]"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#22D3EE]"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#22D3EE]"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#22D3EE]"></div>
                  <div className="w-full h-0.5 bg-[#5AA9E6] absolute top-1/2 -translate-y-1/2 opacity-75"></div>
                </div>
                <span className="text-[10px] text-[#22D3EE] font-mono mt-3 bg-black/70 px-2 py-0.5 rounded border border-[#22D3EE]/30">
                  Enfoca el código de barras
                </span>
              </div>
            )}

            {/* Spinner de inicio de cámara */}
            {isStarting && (
              <div className="absolute inset-0 bg-[#0B0D12] flex flex-col items-center justify-center gap-2.5 p-4 text-center">
                <RefreshCw className="w-7 h-7 text-[#5AA9E6] animate-spin" />
                <span className="text-xs text-white font-medium">
                  Conectando cámara del celular...
                </span>
                <span className="text-[11px] text-[#9CA3AF]">
                  Si tarda, puedes tomar la foto directamente con el botón verde abajo
                </span>
              </div>
            )}

            {/* Estado de procesamiento de foto */}
            {isProcessingPhoto && (
              <div className="absolute inset-0 bg-[#0B0D12]/95 flex flex-col items-center justify-center gap-2.5 p-4 text-center z-20">
                <RefreshCw className="w-8 h-8 text-[#22D3EE] animate-spin" />
                <span className="text-xs text-[#22D3EE] font-bold">
                  {photoStatus || "Procesando código de barras..."}
                </span>
                <span className="text-[11px] text-[#9CA3AF]">
                  Buscando código en la imagen...
                </span>
              </div>
            )}

            {/* Vista amigable si el video en vivo no inició (ej: HTTP en celular) */}
            {!isLiveActive && !isStarting && !isProcessingPhoto && (
              <div className="p-6 flex flex-col items-center justify-center text-center gap-3 w-full bg-[#0E1118]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10B981]/20 to-[#059669]/10 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Modo Cámara de Alta Calidad
                  </h4>
                  <p className="text-xs text-[#9CA3AF] mt-1 max-w-xs">
                    Toma una foto rápida al código de barras con la cámara de tu celular. Se leerá al instante sin trabarse.
                  </p>
                </div>

                <Button
                  type="button"
                  size="lg"
                  onClick={triggerCameraPhoto}
                  className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold py-3.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <Camera className="w-5 h-5" />
                  <span>Tomar Foto con la Cámara</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mensaje de error / aviso si lo hay */}
          {cameraError && (
            <div className="w-full mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-200">
                <span>{cameraError}</span>
              </div>
            </div>
          )}

          {/* Botón de acción principal si el video en vivo está activo */}
          {isLiveActive && (
            <div className="w-full mt-3 flex items-center justify-between gap-2">
              {hasTorch && (
                <Button
                  type="button"
                  size="sm"
                  variant={torchOn ? "primary" : "secondary"}
                  onClick={toggleTorch}
                  className="text-xs flex-1"
                >
                  <Zap className="w-3.5 h-3.5 mr-1" />
                  {torchOn ? "Apagar Flash" : "Encender Flash"}
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={triggerCameraPhoto}
                className="text-xs flex-1 bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/10"
              >
                <Camera className="w-3.5 h-3.5 mr-1 text-[#10B981]" />
                Tomar Foto
              </Button>
            </div>
          )}

          {/* Opción B: Ingresar código manualmente */}
          <div className="w-full mt-4 pt-3 border-t border-white/[0.08]">
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
                className="text-xs shrink-0 px-3"
              >
                Ingresar
              </Button>
            </form>
          </div>

          {/* Ayuda sobre permisos de cámara */}
          <div className="w-full mt-3">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-[11px] text-[#9CA3AF] hover:text-white flex items-center gap-1 mx-auto transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>¿Cómo funciona la cámara en celular?</span>
            </button>

            {showHelp && (
              <div className="mt-2 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-[#9CA3AF] space-y-1.5 text-left animate-in fade-in duration-150">
                <div className="flex items-start gap-1.5 text-white font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                  <span>Método 1: Foto Directa (Recomendado)</span>
                </div>
                <p className="pl-5 text-[#9CA3AF]">
                  Toca el botón verde <b>"Tomar Foto con la Cámara"</b>. Tu celular abrirá su app de cámara con autofocus, tomas la foto al código y la detecta de inmediato. Funciona en el 100% de celulares sin ninguna configuración.
                </p>
                <div className="flex items-start gap-1.5 text-white font-medium pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22D3EE] shrink-0 mt-0.5" />
                  <span>Método 2: Video continuo en vivo en Chrome</span>
                </div>
                <p className="pl-5 text-[#9CA3AF]">
                  Para video en vivo, Chrome exige habilitar la IP local. En Chrome de tu celular ve a <code className="text-[#5AA9E6]">chrome://flags/#unsafely-treat-insecure-origin-as-secure</code>, pon <code className="text-[#22D3EE]">http://192.168.1.215:3000</code>, marca <b>Enabled</b> y reinicia Chrome.
                </p>
              </div>
            )}
          </div>

          {/* Botón cancelar */}
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
    </div>
  );
}
