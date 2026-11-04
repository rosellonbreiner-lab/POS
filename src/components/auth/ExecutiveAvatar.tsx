"use client";

import { useEffect, useRef, useState } from "react";

interface ExecutiveAvatarProps {
  isCoveringEyes?: boolean;
  isTypingEmail?: boolean;
}

export function ExecutiveAvatar({
  isCoveringEyes = false,
  isTypingEmail = false,
}: ExecutiveAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // 1. Seguimiento ocular interactivo del cursor del mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isCoveringEyes) return; // Si se tapa los ojos, no rastrea

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height * 0.42;

      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.hypot(deltaX, deltaY), 400);

      // Limitar rango de movimiento de las pupilas (máximo 4.5px de desplazamiento)
      const maxDistance = 4.5;
      const normalizedDist = (distance / 400) * maxDistance;

      const px = Math.cos(angle) * normalizedDist;
      const py = Math.sin(angle) * normalizedDist;

      setPupilOffset({ x: px, y: py });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isCoveringEyes]);

  // Si está escribiendo el correo, mirar sutilmente hacia abajo (al campo de texto)
  useEffect(() => {
    if (isTypingEmail && !isCoveringEyes) {
      setPupilOffset({ x: 0, y: 3.5 });
    }
  }, [isTypingEmail, isCoveringEyes]);

  // 2. Parpadeo orgánico cada 4 a 6 segundos
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (!isCoveringEyes) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 160);
      }
    }, 4500);

    return () => clearInterval(blinkInterval);
  }, [isCoveringEyes]);

  return (
    <div
      ref={containerRef}
      className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto select-none pointer-events-none"
      title="Seguridad Interactiva"
    >
      {/* Halo de energía neón detrás del ejecutivo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#1F3A5F] via-[#5AA9E6]/30 to-transparent blur-md opacity-75 animate-pulse" />

      <svg
        viewBox="0 0 120 120"
        className="w-full h-full relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Gradiente para el traje ejecutivo */}
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F3A5F" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Gradiente para la corbata cian tecnológica */}
          <linearGradient id="tieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5AA9E6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>

          {/* Tono de piel elegante */}
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Pelo ejecutivo oscuro */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Sombra de la cabeza */}
          <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 1. Traje Ejecutivo & Hombros */}
        <path
          d="M 22 120 C 22 96 36 86 60 86 C 84 86 98 96 98 120 Z"
          fill="url(#suitGrad)"
          stroke="#5AA9E6"
          strokeWidth="1.2"
        />

        {/* Camisa Blanca Cuello Formal */}
        <polygon points="50,86 70,86 64,104 56,104" fill="#FFFFFF" />
        <polygon points="46,86 54,97 50,86" fill="#E2E8F0" />
        <polygon points="74,86 66,97 70,86" fill="#CBD5E1" />

        {/* Corbata Ejecutiva Neón */}
        <polygon points="58,95 62,95 64,118 60,121 56,118" fill="url(#tieGrad)" />
        {/* Nudo de la corbata */}
        <polygon points="57,91 63,91 61,96 59,96" fill="#38BDF8" />

        {/* Solapas del Traje */}
        <path d="M 36 94 L 52 108 L 48 120" stroke="#334155" strokeWidth="1.5" fill="none" />
        <path d="M 84 94 L 68 108 L 72 120" stroke="#334155" strokeWidth="1.5" fill="none" />

        {/* 2. Cuello */}
        <rect x="53" y="72" width="14" height="18" rx="4" fill="url(#skinGrad)" />

        {/* 3. Orejas */}
        <circle cx="34" cy="54" r="6" fill="url(#skinGrad)" />
        <circle cx="34" cy="54" r="3" fill="#D97706" opacity="0.4" />
        <circle cx="86" cy="54" r="6" fill="url(#skinGrad)" />
        <circle cx="86" cy="54" r="3" fill="#D97706" opacity="0.4" />

        {/* 4. Cabeza / Rostro */}
        <rect
          x="35"
          y="28"
          width="50"
          height="50"
          rx="22"
          fill="url(#skinGrad)"
          filter="url(#shadowFilter)"
        />

        {/* Pelo Ejecutivo Moderno Peinado de Lado */}
        <path
          d="M 33 42 C 32 26 44 14 60 14 C 76 14 88 24 87 40 C 83 26 69 22 55 24 C 44 26 36 34 33 42 Z"
          fill="url(#hairGrad)"
        />
        {/* Mechón elegante */}
        <path
          d="M 40 24 C 54 18 72 20 78 28 C 66 22 50 22 40 24 Z"
          fill="#475569"
        />

        {/* Cejas Expresivas */}
        <path
          d={
            isCoveringEyes
              ? "M 42 41 Q 48 42 53 43"
              : "M 42 41 Q 48 38 53 41"
          }
          stroke="#1E293B"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={
            isCoveringEyes
              ? "M 67 43 Q 72 42 78 41"
              : "M 67 41 Q 72 38 78 41"
          }
          stroke="#1E293B"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* 5. Ojos & Pupilas Móviles */}
        {/* Ojo Izquierdo */}
        <g transform="translate(48, 50)">
          <ellipse cx="0" cy="0" rx="6" ry={isBlinking ? 0.6 : 6} fill="#FFFFFF" />
          {!isBlinking && (
            <>
              {/* Iris y Pupila con movimiento dinámico */}
              <circle
                cx={pupilOffset.x * 0.9}
                cy={pupilOffset.y * 0.9}
                r="3.2"
                fill="#1F3A5F"
              />
              <circle
                cx={pupilOffset.x * 0.9}
                cy={pupilOffset.y * 0.9}
                r="2"
                fill="#0F172A"
              />
              {/* Brillo en el ojo */}
              <circle
                cx={pupilOffset.x * 0.9 - 1}
                cy={pupilOffset.y * 0.9 - 1}
                r="1"
                fill="#FFFFFF"
              />
            </>
          )}
        </g>

        {/* Ojo Derecho */}
        <g transform="translate(72, 50)">
          <ellipse cx="0" cy="0" rx="6" ry={isBlinking ? 0.6 : 6} fill="#FFFFFF" />
          {!isBlinking && (
            <>
              {/* Iris y Pupila con movimiento dinámico */}
              <circle
                cx={pupilOffset.x * 0.9}
                cy={pupilOffset.y * 0.9}
                r="3.2"
                fill="#1F3A5F"
              />
              <circle
                cx={pupilOffset.x * 0.9}
                cy={pupilOffset.y * 0.9}
                r="2"
                fill="#0F172A"
              />
              {/* Brillo en el ojo */}
              <circle
                cx={pupilOffset.x * 0.9 - 1}
                cy={pupilOffset.y * 0.9 - 1}
                r="1"
                fill="#FFFFFF"
              />
            </>
          )}
        </g>

        {/* Nariz sutil */}
        <path d="M 59 55 Q 60 59 62 59" stroke="#D97706" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Sonrisa ejecutiva amable */}
        <path
          d={
            isCoveringEyes
              ? "M 55 67 Q 60 69 65 67" // Sonrisa pequeña y discreta cuando se tapa los ojos
              : "M 53 66 Q 60 72 67 66" // Sonrisa agradable normal
          }
          stroke="#78350F"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* 6. Brazos & Manos que se tapan los ojos (Animadas con CSS transition) */}
        {/* Mano Izquierda */}
        <g
          className="transition-all duration-300 ease-out"
          style={{
            transformOrigin: "35px 95px",
            transform: isCoveringEyes
              ? "translate(10px, -42px) rotate(18deg)"
              : "translate(0px, 16px) scale(0.65)",
            opacity: isCoveringEyes ? 1 : 0,
          }}
        >
          {/* Manga del traje */}
          <path d="M 24 102 L 38 88 L 44 94 L 30 110 Z" fill="url(#suitGrad)" />
          {/* Puño de la camisa */}
          <rect x="36" y="86" width="8" height="3" rx="1" fill="#FFFFFF" transform="rotate(-30 40 88)" />
          {/* Mano / Dedos que cubren el ojo izquierdo */}
          <ellipse cx="45" cy="85" rx="7.5" ry="6" fill="url(#skinGrad)" transform="rotate(-15 45 85)" />
          {/* Dedos estilizados */}
          <line x1="42" y1="81" x2="49" y2="80" stroke="#D97706" strokeWidth="0.8" />
          <line x1="41" y1="84" x2="49" y2="83" stroke="#D97706" strokeWidth="0.8" />
          <line x1="42" y1="88" x2="48" y2="87" stroke="#D97706" strokeWidth="0.8" />
        </g>

        {/* Mano Derecha */}
        <g
          className="transition-all duration-300 ease-out"
          style={{
            transformOrigin: "85px 95px",
            transform: isCoveringEyes
              ? "translate(-10px, -42px) rotate(-18deg)"
              : "translate(0px, 16px) scale(0.65)",
            opacity: isCoveringEyes ? 1 : 0,
          }}
        >
          {/* Manga del traje */}
          <path d="M 96 102 L 82 88 L 76 94 L 90 110 Z" fill="url(#suitGrad)" />
          {/* Puño de la camisa */}
          <rect x="76" y="86" width="8" height="3" rx="1" fill="#FFFFFF" transform="rotate(30 80 88)" />
          {/* Mano / Dedos que cubren el ojo derecho */}
          <ellipse cx="75" cy="85" rx="7.5" ry="6" fill="url(#skinGrad)" transform="rotate(15 75 85)" />
          {/* Dedos estilizados */}
          <line x1="71" y1="80" x2="78" y2="81" stroke="#D97706" strokeWidth="0.8" />
          <line x1="71" y1="83" x2="79" y2="84" stroke="#D97706" strokeWidth="0.8" />
          <line x1="72" y1="87" x2="78" y2="88" stroke="#D97706" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
}
