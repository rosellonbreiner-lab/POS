"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone, Check, Sparkles, Share, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Inicial en true para evitar flash
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Registrar Service Worker oficial
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registrado exitosamente con scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Error al registrar Service Worker:", err);
          });
      });
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

    // 3. Detectar si es dispositivo iOS (Safari requiere paso manual)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 4. Verificar si el usuario ya lo descartó recientemente
    const dismissedTimestamp = localStorage.getItem("pos_pwa_dismissed");
    if (dismissedTimestamp) {
      const elapsed = Date.now() - parseInt(dismissedTimestamp, 10);
      // No volver a molestar por 2 días si fue descartado
      if (elapsed < 2 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } else {
      setIsDismissed(false);
    }

    // 5. Escuchar evento nativo de instalación en Android / Chrome / Edge
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
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Si ya está instalada o fue descartada, no mostrar nada
  if (isStandalone && !installedSuccess) return null;
  if (isDismissed && !installedSuccess) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalledSuccess(true);
        setTimeout(() => setIsDismissed(true), 4000);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Navegadores basados en Chromium sin evento aún
      alert("Para instalar en tu teléfono: Toca los 3 puntos del navegador (⋮) y selecciona 'Instalar aplicación' o 'Agregar a la pantalla principal'.");
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("pos_pwa_dismissed", Date.now().toString());
  };

  return (
    <>
      {/* Banner flotante inferior de instalación PWA en móvil y tablet */}
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
                      App para Celular
                    </span>
                    <Sparkles className="w-3 h-3 text-[#34D399]" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mt-1 leading-tight">
                    Instalar POS en tu Teléfono
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-relaxed">
                    Accede en 1 toque desde la pantalla de inicio, en pantalla completa y sin barra de direcciones.
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
                  <span>Instalar Ahora</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="h-8 text-xs text-[#94A3B8] hover:text-white px-2.5 cursor-pointer"
                >
                  Más tarde
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Guía para iPhone / Safari */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#13161F] border border-white/20 rounded-2xl p-5 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#5AA9E6]/20 border border-[#5AA9E6]/40 flex items-center justify-center text-[#5AA9E6] mx-auto">
              <Share className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Instalar en iPhone o iPad</h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Apple requiere 2 sencillos pasos en Safari:
              </p>
            </div>

            <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-left text-xs space-y-2 text-[#EAF4F4]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#5AA9E6] text-black font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                <span>Toca el botón <b>Compartir</b> (<Share className="w-3.5 h-3.5 inline mx-0.5" />) en la barra de Safari.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#5AA9E6] text-black font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                <span>Selecciona <b>"Agregar a la pantalla de inicio"</b> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />).</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowIOSGuide(false)}
              className="w-full font-bold"
            >
              Entendido
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
