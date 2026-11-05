"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone, Check, Sparkles, Share, PlusSquare, MoreVertical, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Registrar Service Worker oficial de inmediato sin esperar si el documento ya cargó
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((reg) => {
            console.log("[PWA] Service Worker registrado con scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Error al registrar Service Worker:", err);
          });
      };

      if (document.readyState === "complete" || document.readyState === "interactive") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }
    }

    // 2. Verificar si ya está ejecutándose como App Standalone instalada
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    if (checkStandalone()) return;

    // 3. Detectar si es dispositivo iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 4. Verificar si el usuario ya lo descartó recientemente
    const dismissedTimestamp = localStorage.getItem("pos_pwa_dismissed");
    if (dismissedTimestamp) {
      const elapsed = Date.now() - parseInt(dismissedTimestamp, 10);
      // No volver a mostrar por 2 días si fue descartado voluntariamente
      if (elapsed < 2 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } else {
      setIsDismissed(false);
    }

    // 5. Escuchar evento nativo de instalación en Android / Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 6. Detectar cuando se completa la instalación con éxito
    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      setIsStandalone(true);
      setShowGuideModal(false);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // 7. Escuchar evento manual para abrir la guía desde el menú
    const handleOpenGuide = () => {
      setShowGuideModal(true);
      setIsDismissed(false);
    };
    window.addEventListener("open-pwa-guide", handleOpenGuide);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("open-pwa-guide", handleOpenGuide);
    };
  }, []);

  // Si ya está en modo Standalone, no mostrar el banner flotante
  if (isStandalone && !installedSuccess) return null;

  const handleInstallClick = async () => {
    // Si el navegador soporta el disparador nativo, lo intentamos
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalledSuccess(true);
          setTimeout(() => setIsDismissed(true), 4000);
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn("[PWA] Error en deferredPrompt:", err);
      }
    }
    // Si falla o estamos en IP local (donde Android requiere el método de 2 toques), abrimos la guía visual
    setShowGuideModal(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("pos_pwa_dismissed", Date.now().toString());
  };

  return (
    <>
      {/* Banner flotante inferior de instalación PWA */}
      {!isDismissed && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-[#181D26]/95 backdrop-blur-xl border border-[#5AA9E6]/40 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.7)] relative overflow-hidden">
            {/* Barra superior con gradiente de la paleta */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1F3A5F] via-[#5AA9E6] to-[#34D399]" />

            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-2.5 right-2.5 text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>

            {installedSuccess ? (
              <div className="flex items-center gap-3 py-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">¡App Instalada con Éxito!</h4>
                  <p className="text-xs text-[#94A3B8]">Ya puedes abrir el POS desde tu pantalla de inicio.</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1F3A5F]/80 border border-[#5AA9E6]/40 flex items-center justify-center text-[#5AA9E6] shadow-[0_0_15px_rgba(90,169,230,0.35)] shrink-0 mt-0.5">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-[#5AA9E6] tracking-wider bg-[#5AA9E6]/15 px-2 py-0.5 rounded-full">
                        App Móvil
                      </span>
                      <Sparkles className="w-3 h-3 text-[#34D399]" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white mt-1 leading-tight">
                      Instalar POS en tu Teléfono
                    </h4>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-relaxed">
                      Acceso rápido en pantalla completa sin barra del navegador.
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-white/[0.08]">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={handleInstallClick}
                    className="flex-1 h-8 text-xs font-bold shadow-md shadow-[#5AA9E6]/25 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    <span>Instalar App</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowGuideModal(true)}
                    className="h-8 text-xs text-[#5AA9E6] hover:text-white px-2 cursor-pointer font-semibold"
                  >
                    ¿Cómo instalar?
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Guía Paso a Paso para Android e iPhone */}
      {showGuideModal && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#13161F] border border-[#5AA9E6]/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1F3A5F] via-[#5AA9E6] to-[#34D399]" />

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5AA9E6]/20 border border-[#5AA9E6]/40 flex items-center justify-center text-[#5AA9E6] mx-auto mb-2 shadow-[0_0_20px_rgba(90,169,230,0.3)]">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                Cómo Instalar la App en tu Teléfono
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Sigue estos 2 sencillos pasos en tu navegador móvil:
              </p>
            </div>

            {/* Guía para Android (Chrome) */}
            {!isIOS ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-3 text-xs text-[#EAF4F4]">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#5AA9E6] text-black font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-white block">Toca los 3 puntos del navegador:</span>
                      <span className="text-[#94A3B8] text-[11px] block mt-0.5">
                        Arriba a la derecha en Google Chrome, toca el icono de menú (<MoreVertical className="w-3.5 h-3.5 inline text-[#5AA9E6]" />).
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2 border-t border-white/[0.06]">
                    <span className="w-6 h-6 rounded-full bg-[#34D399] text-black font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-white block">Toca "Agregar a la pantalla principal":</span>
                      <span className="text-[#94A3B8] text-[11px] block mt-0.5">
                        (O en algunos celulares saldrá <b>"Instalar aplicación"</b>). Toca <b>Agregar / Instalar</b>.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-200">
                  <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    <b>¿Por qué mediante este paso?</b> Al conectarse por dirección IP local Wi-Fi (192.168.1.215), Google requiere agregarlo a la pantalla principal para crear el acceso directo de pantalla completa con su icono.
                  </span>
                </div>
              </div>
            ) : (
              /* Guía para iOS (Safari) */
              <div className="space-y-3">
                <div className="p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-3 text-xs text-[#EAF4F4]">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#5AA9E6] text-black font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-white block">Toca el botón Compartir:</span>
                      <span className="text-[#94A3B8] text-[11px] block mt-0.5">
                        En la barra inferior de Safari, toca el icono (<Share className="w-3.5 h-3.5 inline text-[#5AA9E6]" />).
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2 border-t border-white/[0.06]">
                    <span className="w-6 h-6 rounded-full bg-[#34D399] text-black font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-white block">Selecciona "Agregar a pantalla de inicio":</span>
                      <span className="text-[#94A3B8] text-[11px] block mt-0.5">
                        Baja en el menú y toca (<PlusSquare className="w-3.5 h-3.5 inline text-[#34D399]" />) <b>Agregar a pantalla de inicio</b>.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-white/[0.08] flex gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setShowGuideModal(false);
                  setIsDismissed(true);
                }}
                className="w-full font-bold h-9 text-xs"
              >
                ¡Entendido, voy a agregarlo!
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
