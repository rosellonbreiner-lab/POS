"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";

interface SystemDashboardAnimeProps {
  isEntering?: boolean;
}

export function SystemDashboardAnime({ isEntering = false }: SystemDashboardAnimeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Barras de Métricas / Ventas oscilando con crecimiento escalonado
    const barAnimation = anime({
      targets: ".anime-chart-bar",
      height: (el: HTMLElement) => {
        const base = parseInt(el.getAttribute("data-height") || "60", 10);
        return [base * 0.4, base];
      },
      delay: anime.stagger(120),
      duration: 1600,
      easing: "easeInOutQuad",
      direction: "alternate",
      loop: true,
    });

    // 2. Línea de tendencia de ingresos / ventas que respira
    const trendAnimation = anime({
      targets: ".anime-trend-glow",
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: "easeInOutSine",
      duration: 2500,
      direction: "alternate",
      loop: true,
    });

    // 3. Indicador circular de inventario rotando
    const circleAnimation = anime({
      targets: ".anime-radial-progress",
      strokeDashoffset: [180, 70],
      duration: 3000,
      easing: "easeInOutCubic",
      direction: "alternate",
      loop: true,
    });

    // 4. Bloques de datos y transacciones flotantes (Tarjetas KPI en vivo)
    const floatAnimation = anime({
      targets: ".anime-kpi-card",
      translateY: [-4, 4],
      delay: anime.stagger(200),
      duration: 2200,
      easing: "easeInOutSine",
      direction: "alternate",
      loop: true,
    });

    // 5. Nodos de conexión y flujo de datos
    const dotsAnimation = anime({
      targets: ".anime-data-node",
      scale: [0.7, 1.4, 0.7],
      opacity: [0.3, 1, 0.3],
      delay: anime.stagger(150),
      duration: 1800,
      easing: "easeInOutQuad",
      loop: true,
    });

    return () => {
      barAnimation.pause();
      trendAnimation.pause();
      circleAnimation.pause();
      floatAnimation.pause();
      dotsAnimation.pause();
    };
  }, []);

  // Animación cuando el usuario pulsa ingresar
  useEffect(() => {
    if (isEntering && containerRef.current) {
      anime({
        targets: ".anime-chart-bar",
        height: (el: HTMLElement) => parseInt(el.getAttribute("data-height") || "90", 10) * 1.3,
        duration: 500,
        delay: anime.stagger(60),
        easing: "easeOutExpo",
      });

      anime({
        targets: ".anime-radial-progress",
        strokeDashoffset: 10,
        duration: 500,
        easing: "easeOutQuad",
      });

      anime({
        targets: ".anime-main-board",
        scale: [1, 1.03],
        boxShadow: "0 0 60px rgba(90, 169, 230, 0.5)",
        duration: 600,
        easing: "easeOutQuad",
      });
    }
  }, [isEntering]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[520px] select-none flex flex-col items-center"
    >
      {/* Resplandor neón difuso de fondo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#1F3A5F]/40 via-[#5AA9E6]/25 to-transparent blur-3xl pointer-events-none rounded-3xl" />

      {/* Pantalla principal del Dashboard Minimalista (#222831, #1F3A5F, #5AA9E6, #EAF4F4) */}
      <div className="anime-main-board relative z-10 w-full bg-[#181D26]/95 border border-[#5AA9E6]/30 rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl overflow-hidden transition-all duration-300">
        {/* Cabecera del Dashboard simulado */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F87171]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]"></span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#EAF4F4] ml-2 tracking-wider">
              PANEL GENERAL DE CONTROL & POS
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#222831] px-2.5 py-1 rounded-full border border-white/10 text-[10px] text-[#5AA9E6] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse"></span>
            <span>DATOS EN TIEMPO REAL</span>
          </div>
        </div>

        {/* 3 Tarjetas KPI flotantes animadas con anime.js */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="anime-kpi-card bg-[#222831]/80 border border-[#5AA9E6]/25 rounded-2xl p-3 shadow-md">
            <div className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">
              Ventas / Ingresos
            </div>
            <div className="text-base sm:text-lg font-black text-[#EAF4F4] mt-1 font-mono">
              $14,850,000
            </div>
            <div className="text-[10px] text-[#34D399] font-semibold mt-0.5 flex items-center gap-1">
              <span>▲ +18.4%</span>
              <span className="text-[#94A3B8] font-normal">mes</span>
            </div>
          </div>

          <div className="anime-kpi-card bg-[#222831]/80 border border-[#5AA9E6]/25 rounded-2xl p-3 shadow-md">
            <div className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">
              Inventario / Kardex
            </div>
            <div className="text-base sm:text-lg font-black text-[#5AA9E6] mt-1 font-mono">
              1,420 <span className="text-xs text-[#94A3B8]">Items</span>
            </div>
            <div className="text-[10px] text-[#38BDF8] font-semibold mt-0.5 flex items-center gap-1">
              <span>● 98%</span>
              <span className="text-[#94A3B8] font-normal">disponible</span>
            </div>
          </div>

          <div className="anime-kpi-card bg-[#222831]/80 border border-[#5AA9E6]/25 rounded-2xl p-3 shadow-md">
            <div className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">
              Cobros & Cartera
            </div>
            <div className="text-base sm:text-lg font-black text-[#34D399] mt-1 font-mono">
              $3,210,000
            </div>
            <div className="text-[10px] text-[#94A3B8] font-normal mt-0.5">
              Abonos al día
            </div>
          </div>
        </div>

        {/* Gráfico SVG de Barras & Tendencia interactiva anime.js */}
        <div className="bg-[#121620] border border-white/[0.08] rounded-2xl p-4 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#EAF4F4]">
              Flujo Operativo & Rendimiento Comercial
            </span>
            <div className="flex items-center gap-2 text-[10px] text-[#94A3B8] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-[#5AA9E6]"></span> Ventas
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-[#1F3A5F]"></span> Stock
              </span>
            </div>
          </div>

          {/* Gráfico interactivo con SVG */}
          <div className="h-32 flex items-end justify-between gap-2 pt-2 px-1 relative">
            {/* Líneas guía horizontales */}
            <div className="absolute inset-x-0 top-2 border-b border-white/[0.05]"></div>
            <div className="absolute inset-x-0 top-1/2 border-b border-white/[0.05]"></div>
            <div className="absolute inset-x-0 bottom-6 border-b border-white/[0.08]"></div>

            {/* Barras animadas con Anime.js */}
            {[
              { label: "Lun", h: 45, val: "45%" },
              { label: "Mar", h: 70, val: "70%" },
              { label: "Mie", h: 55, val: "55%" },
              { label: "Jue", h: 90, val: "90%" },
              { label: "Vie", h: 105, val: "105%" },
              { label: "Sab", h: 120, val: "120%" },
              { label: "Dom", h: 80, val: "80%" },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center z-10">
                <div className="w-full flex justify-center items-end h-24">
                  <div
                    data-height={item.h}
                    style={{ height: `${item.h}px` }}
                    className="anime-chart-bar w-full max-w-[24px] rounded-t-lg bg-gradient-to-t from-[#1F3A5F] via-[#5AA9E6] to-[#38BDF8] shadow-[0_0_12px_rgba(90,169,230,0.3)] transition-all"
                  />
                </div>
                <span className="text-[10px] font-mono text-[#94A3B8] mt-1.5">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Barra inferior de estado del software */}
        <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="anime-data-node w-2 h-2 rounded-full bg-[#5AA9E6]"></span>
            <span>Módulos: Ventas · Inventario · Cartera · Facturación</span>
          </div>
          <span className="font-mono text-[#5AA9E6] font-bold">POS v2.5 ONLINE</span>
        </div>
      </div>
    </div>
  );
}

