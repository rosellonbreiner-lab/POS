"use client";

import { useState } from "react";
import { Lock, Mail, ShieldAlert, ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SystemDashboardAnime } from "./SystemDashboardAnime";

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export function LoginForm({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsEntering(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsEntering(false);
        setLoading(false);
        throw new Error(data.error || "Error al iniciar sesión");
      }

      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 700);
    } catch (err: any) {
      setIsEntering(false);
      setError(err.message || "Error al conectar con el servidor");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0D1117] flex flex-col justify-between">
      {/* Fondo Tech / Grid cibernético animado */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(90, 169, 230, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(90, 169, 230, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Resplandor radial de alta potencia */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#1F3A5F]/40 via-[#5AA9E6]/25 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Header superior general de gestión */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1F3A5F]/70 border border-[#5AA9E6]/40 flex items-center justify-center text-[#5AA9E6] shadow-[0_0_20px_rgba(90,169,230,0.35)]">
            <Layers className="w-5 h-5 text-[#5AA9E6]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#EAF4F4] tracking-wider uppercase font-[family-name:var(--font-space-grotesk)]">
              SISTEMA DE <span className="text-[#5AA9E6]">GESTIÓN POS</span>
            </h1>
            <p className="text-[10px] text-[#94A3B8] tracking-widest font-mono">
              CONTROL COMERCIAL & ADMINISTRATIVO
            </p>
          </div>
        </div>
      </header>

      {/* Contenido Central: Panel Visual de Gestión + Tarjeta de Acceso */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center max-w-6xl mx-auto w-full px-4 py-4 gap-8 lg:gap-12">
        {/* Lado Izquierdo: Presentación animada del Sistema de Gestión */}
        <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left relative">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#EAF4F4] tracking-tight leading-tight">
            Control Integral y <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5AA9E6] via-[#EAF4F4] to-[#5AA9E6]">
              Gestión Comercial
            </span>
          </h2>
          <p className="mt-2 text-sm text-[#94A3B8] max-w-md">
            Plataforma centralizada para facturación, control de existencias, flujo de caja y administración de créditos.
          </p>

          {/* Visualización animada en vivo con Anime.js */}
          <div className="mt-6 w-full flex justify-center lg:justify-start">
            <SystemDashboardAnime isEntering={isEntering} />
          </div>
        </div>

        {/* Lado Derecho: Tarjeta de Acceso Minimal Dashboard (#222831, #1F3A5F, #5AA9E6, #EAF4F4) */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="bg-[#222831]/90 backdrop-blur-2xl border border-[#5AA9E6]/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.65)] relative overflow-hidden">
            {/* Barra superior con gradiente de la paleta */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1F3A5F] via-[#5AA9E6] to-[#1F3A5F]"></div>

            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-[#1F3A5F]/80 border border-[#5AA9E6]/40 flex items-center justify-center text-[#5AA9E6] shadow-lg shadow-[#1F3A5F]/50 mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#EAF4F4]">
                Acceso al Sistema
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Ingresa con tus credenciales de usuario
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#F87171]/15 border border-[#F87171]/30 flex items-center gap-2 text-xs text-[#F87171]">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  required
                  icon={<Mail className="w-4 h-4 text-[#5AA9E6]" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@sistema.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Contraseña
                </label>
                <Input
                  type="password"
                  required
                  icon={<Lock className="w-4 h-4 text-[#5AA9E6]" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full justify-center h-11 text-sm font-bold shadow-xl shadow-[#1F3A5F]/40 cursor-pointer"
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      Ingresando al Sistema...
                    </span>
                  ) : (
                    <>
                      <span>Ingresar al Sistema</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="relative z-10 p-4 text-center text-xs text-[#94A3B8]/80 max-w-7xl mx-auto w-full">
        Sistema de Gestión Comercial & POS © 2026 · Eficiencia y Control
      </footer>
    </div>
  );
}
