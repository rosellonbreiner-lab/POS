"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";

interface WorkshopAnimeDisplayProps {
  isEntering?: boolean;
}

export function WorkshopAnimeDisplay({ isEntering = false }: WorkshopAnimeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tachNeedleRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Engranajes girando continuamente en sentidos opuestos
    const gearAnimation = anime({
      targets: ".anime-gear-cw",
      rotate: "1turn",
      duration: 7000,
      easing: "linear",
      loop: true,
    });

    const gearCcwAnimation = anime({
      targets: ".anime-gear-ccw",
      rotate: "-1turn",
      duration: 7000,
      easing: "linear",
      loop: true,
    });

    // 2. Pistones mecánicos subiendo y bajando en tiempos alternados
    const pistonAnimation = anime({
      targets: ".anime-piston-1",
      translateY: [-16, 16],
      duration: 600,
      easing: "easeInOutQuad",
      direction: "alternate",
      loop: true,
    });

    const piston2Animation = anime({
      targets: ".anime-piston-2",
      translateY: [16, -16],
      duration: 600,
      easing: "easeInOutQuad",
      direction: "alternate",
      loop: true,
    });

    // 3. Cadena de transmisión de moto moviéndose
    const chainAnimation = anime({
      targets: ".anime-chain-link",
      translateX: [-8, 8],
      duration: 400,
      easing: "easeInOutSine",
      direction: "alternate",
      loop: true,
    });

    // 4. Aguja del Tacómetro / Diagnóstico oscilando
    const tachAnimation = anime({
      targets: tachNeedleRef.current,
      rotate: [-35, 45],
      duration: 1800,
      easing: "easeInOutCubic",
      direction: "alternate",
      loop: true,
    });

    // 5. Partículas de chispa de taller brotando
    const sparksAnimation = anime({
      targets: ".anime-spark-dot",
      translateY: () => anime.random(-30, 30),
      translateX: () => anime.random(-40, 40),
      scale: [0, 1.3, 0],
      opacity: [0, 1, 0],
      duration: () => anime.random(800, 1500),
      delay: anime.stagger(150),
      easing: "easeOutExpo",
      loop: true,
    });

    return () => {
      gearAnimation.pause();
      gearCcwAnimation.pause();
      pistonAnimation.pause();
      piston2Animation.pause();
      chainAnimation.pause();
      tachAnimation.pause();
      sparksAnimation.pause();
    };
  }, []);

  // Efecto cuando el usuario da click en "Ingresar al Taller"
  useEffect(() => {
    if (isEntering && containerRef.current) {
      anime({
        targets: tachNeedleRef.current,
        rotate: 110,
        duration: 500,
        easing: "easeOutElastic(1, .5)",
      });

      anime({
        targets: ".anime-piston-1, .anime-piston-2",
        translateY: [0, -25],
        duration: 250,
        easing: "easeInOutQuad",
        direction: "alternate",
        loop: 4,
      });

      anime({
        targets: ".anime-gear-cw, .anime-gear-ccw",
        scale: [1, 1.08, 1],
        duration: 600,
        easing: "easeInOutSine",
      });

      anime({
        targets: ".anime-enter-glow",
        opacity: [0.3, 1],
        scale: [1, 1.25],
        duration: 600,
        easing: "easeOutQuad",
      });
    }
  }, [isEntering]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[500px] h-[340px] flex items-center justify-center p-3 select-none"
    >
      {/* Resplandor radial de alta energía con Anime.js */}
      <div className="anime-enter-glow absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#1F3A5F]/50 via-[#5AA9E6]/30 to-transparent blur-3xl pointer-events-none transition-all duration-300"></div>

      {/* SVG del motor, engranajes y diagnóstico anime.js */}
      <svg
        className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
        viewBox="0 0 500 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fondo del banco de prueba */}
        <rect
          x="30"
          y="25"
          width="440"
          height="290"
          rx="24"
          fill="#13161F"
          stroke="#5AA9E6"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />

        {/* Rejilla técnica de fondo */}
        <line x1="30" y1="95" x2="470" y2="95" stroke="#5AA9E6" strokeWidth="1" strokeOpacity="0.1" />
        <line x1="30" y1="170" x2="470" y2="170" stroke="#5AA9E6" strokeWidth="1" strokeOpacity="0.1" />
        <line x1="30" y1="245" x2="470" y2="245" stroke="#5AA9E6" strokeWidth="1" strokeOpacity="0.1" />
        <line x1="140" y1="25" x2="140" y2="315" stroke="#5AA9E6" strokeWidth="1" strokeOpacity="0.1" />
        <line x1="250" y1="25" x2="250" y2="315" stroke="#5AA9E6" strokeWidth="1" strokeOpacity="0.1" />
        <line x1="360" y1="25" x2="360" y2="315" stroke="#5AA9E6" strokeWidth="1" strokeOpacity="0.1" />

        {/* 1. SECCIÓN IZQUIERDA: PISTONES DE MOTOR (BIELAS & CILINDROS) */}
        <g id="pistons" transform="translate(45, 60)">
          {/* Cilindro 1 */}
          <rect x="25" y="40" width="36" height="90" rx="8" fill="#1F2937" stroke="#5AA9E6" strokeWidth="1.5" strokeOpacity="0.4" />
          <g className="anime-piston-1">
            {/* Cabeza del pistón 1 */}
            <rect x="27" y="65" width="32" height="30" rx="4" fill="#5AA9E6" />
            <line x1="43" y1="95" x2="43" y2="140" stroke="#EAF4F4" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Cilindro 2 */}
          <rect x="75" y="40" width="36" height="90" rx="8" fill="#1F2937" stroke="#5AA9E6" strokeWidth="1.5" strokeOpacity="0.4" />
          <g className="anime-piston-2">
            {/* Cabeza del pistón 2 */}
            <rect x="77" y="65" width="32" height="30" rx="4" fill="#38BDF8" />
            <line x1="93" y1="95" x2="93" y2="140" stroke="#EAF4F4" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Etiquetas */}
          <text x="32" y="25" fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="bold">
            MOTOR BANCADA
          </text>
          <text x="36" y="160" fill="#5AA9E6" fontSize="9" fontFamily="monospace">
            2 CILINDROS
          </text>
        </g>

        {/* 2. SECCIÓN CENTRAL: ENGRANAJES DE TRANSMISIÓN PRINCIPAL */}
        <g id="gears" transform="translate(250, 160)">
          {/* Engranaje Grande (Horario) */}
          <g className="anime-gear-cw" style={{ transformOrigin: "0px 0px" }}>
            <circle cx="0" cy="0" r="50" fill="#1F3A5F" stroke="#5AA9E6" strokeWidth="3" />
            <circle cx="0" cy="0" r="32" fill="#13161F" stroke="#5AA9E6" strokeWidth="1.5" strokeOpacity="0.5" />
            <circle cx="0" cy="0" r="14" fill="#5AA9E6" />
            {/* Dientes del engranaje grande */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <rect
                key={deg}
                x="-5"
                y="-57"
                width="10"
                height="10"
                rx="2"
                fill="#5AA9E6"
                transform={`rotate(${deg})`}
              />
            ))}
          </g>

          {/* Engranaje Secundario Piñón (Anti-horario) */}
          <g className="anime-gear-ccw" transform="translate(68, -48)" style={{ transformOrigin: "0px 0px" }}>
            <circle cx="0" cy="0" r="30" fill="#222831" stroke="#38BDF8" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="18" fill="#13161F" />
            <circle cx="0" cy="0" r="8" fill="#38BDF8" />
            {/* Dientes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <rect
                key={deg}
                x="-4"
                y="-36"
                width="8"
                height="8"
                rx="2"
                fill="#38BDF8"
                transform={`rotate(${deg})`}
              />
            ))}
          </g>

          {/* Cadena o eslabones de transmisión */}
          <g className="anime-chain-link" transform="translate(-100, 75)">
            <rect x="0" y="0" width="16" height="8" rx="4" fill="#34D399" />
            <rect x="22" y="0" width="16" height="8" rx="4" fill="#34D399" />
            <rect x="44" y="0" width="16" height="8" rx="4" fill="#34D399" />
            <rect x="66" y="0" width="16" height="8" rx="4" fill="#34D399" />
            <line x1="8" y1="4" x2="74" y2="4" stroke="#EAF4F4" strokeWidth="1.5" />
          </g>

          {/* Chispas flotantes animadas con anime.stagger */}
          <circle className="anime-spark-dot" cx="-20" cy="-20" r="2.5" fill="#5AA9E6" />
          <circle className="anime-spark-dot" cx="30" cy="-10" r="3" fill="#38BDF8" />
          <circle className="anime-spark-dot" cx="-10" cy="30" r="2" fill="#EAF4F4" />
          <circle className="anime-spark-dot" cx="40" cy="20" r="2.5" fill="#34D399" />
          <circle className="anime-spark-dot" cx="0" cy="-35" r="3" fill="#5AA9E6" />
        </g>

        {/* 3. SECCIÓN DERECHA: TACÓMETRO DE RPM & DIAGNÓSTICO DIGITAL */}
        <g id="tachometer" transform="translate(370, 105)">
          <circle cx="45" cy="45" r="42" fill="#1A2333" stroke="#5AA9E6" strokeWidth="2" />
          <circle cx="45" cy="45" r="38" fill="#13161F" />

          {/* Marcas de velocidad */}
          <line x1="20" y1="45" x2="26" y2="45" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="45" y1="20" x2="45" y2="26" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="70" y1="45" x2="64" y2="45" stroke="#F87171" strokeWidth="1.5" />

          {/* Aguja del tacómetro */}
          <g style={{ transformOrigin: "45px 45px" }}>
            <line
              ref={tachNeedleRef}
              x1="45"
              y1="45"
              x2="45"
              y2="15"
              stroke="#5AA9E6"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ transformOrigin: "45px 45px" }}
            />
          </g>
          <circle cx="45" cy="45" r="5" fill="#EAF4F4" />

          {/* Display digital debajo */}
          <rect x="18" y="98" width="54" height="20" rx="4" fill="#0D1117" stroke="#5AA9E6" strokeWidth="1" strokeOpacity="0.4" />
          <text x="25" y="112" fill="#34D399" fontSize="10" fontFamily="monospace" fontWeight="bold">
            DIAG OK
          </text>
        </g>

        {/* Barra de estado inferior */}
        <rect x="50" y="275" width="400" height="24" rx="8" fill="#1A2333" stroke="#5AA9E6" strokeWidth="1" strokeOpacity="0.25" />
        <circle cx="70" cy="287" r="4" fill="#34D399" className="animate-pulse" />
        <text x="82" y="291" fill="#EAF4F4" fontSize="10" fontFamily="monospace" letterSpacing="1">
          MOTOTALLER · SISTEMA POS & FACTURACIÓN EN LÍNEA
        </text>
      </svg>
    </div>
  );
}

