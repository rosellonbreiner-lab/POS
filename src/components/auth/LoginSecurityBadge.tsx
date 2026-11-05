"use client";

import { ShieldCheck, Lock, Shield, KeyRound, Sparkles } from "lucide-react";

interface LoginSecurityBadgeProps {
  isPasswordFocused?: boolean;
  isEmailFocused?: boolean;
}

export function LoginSecurityBadge({
  isPasswordFocused = false,
  isEmailFocused = false,
}: LoginSecurityBadgeProps) {
  return (
    <div className="relative w-24 h-24 mx-auto mb-3 select-none flex items-center justify-center">
      {/* Resplandor dinámico de fondo */}
      <div
        className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-500 ${
          isPasswordFocused
            ? "bg-emerald-500/25 scale-110"
            : isEmailFocused
            ? "bg-[#5AA9E6]/30 scale-105"
            : "bg-[#1F3A5F]/40 scale-95"
        }`}
      />

      {/* Contenedor principal con vidrio glassmorphism y borde neón */}
      <div
        className={`relative w-20 h-20 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
          isPasswordFocused
            ? "bg-[#131E29]/90 border-emerald-500/50 shadow-emerald-950/60"
            : isEmailFocused
            ? "bg-[#162234]/90 border-[#5AA9E6]/50 shadow-cyan-950/60"
            : "bg-[#18202F]/80 border-[#5AA9E6]/30 shadow-black/60"
        }`}
      >
        {/* Esquinas tecnológicas decorativas */}
        <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[#5AA9E6]/40" />
        <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#5AA9E6]/40" />
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-[#5AA9E6]/40" />
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-[#5AA9E6]/40" />

        {/* Ícono dinámico según el estado del formulario */}
        <div className="relative">
          {isPasswordFocused ? (
            <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)]">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          ) : isEmailFocused ? (
            <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
              <div className="w-10 h-10 rounded-xl bg-[#5AA9E6]/20 border border-[#5AA9E6]/40 flex items-center justify-center text-[#5AA9E6] shadow-[0_0_15px_rgba(90,169,230,0.35)]">
                <KeyRound className="w-5 h-5 text-[#5AA9E6]" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-[#1F3A5F]/70 border border-[#5AA9E6]/30 flex items-center justify-center text-[#5AA9E6] shadow-[0_0_15px_rgba(31,58,95,0.5)]">
                <ShieldCheck className="w-5 h-5 text-[#5AA9E6]" />
              </div>
            </div>
          )}
        </div>

        {/* Micro-etiqueta inferior de estado */}
        <div className="mt-1">
          <span
            className={`text-[9px] font-mono tracking-wider uppercase font-semibold transition-colors duration-300 ${
              isPasswordFocused
                ? "text-emerald-400"
                : isEmailFocused
                ? "text-[#5AA9E6]"
                : "text-[#94A3B8]"
            }`}
          >
            {isPasswordFocused ? "Protegido" : isEmailFocused ? "Identidad" : "POS Seguro"}
          </span>
        </div>
      </div>
    </div>
  );
}

