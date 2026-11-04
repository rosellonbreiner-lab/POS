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

  // 1. Seguimiento ocular suave e inteligente del cursor del ratón
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isCoveringEyes) return; // Si se cubre los ojos, no rastrea

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height * 0.38;

      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.hypot(deltaX, deltaY), 350);

      // Movimiento natural y contenido de la pupila
      const maxDistance = 3.6;
      const normalizedDist = (distance / 350) * maxDistance;

      const px = Math.cos(angle) * normalizedDist;
      const py = Math.sin(angle) * normalizedDist;

      setPupilOffset({ x: px, y: py });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isCoveringEyes]);

  // Si está escribiendo el correo, mirar con elegancia hacia abajo
  useEffect(() => {
    if (isTypingEmail && !isCoveringEyes) {
      setPupilOffset({ x: 0, y: 3.0 });
    }
  }, [isTypingEmail, isCoveringEyes]);

  // 2. Parpadeo orgánico humano
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (!isCoveringEyes) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 170);
      }
    }, 4800);

    return () => clearInterval(blinkInterval);
  }, [isCoveringEyes]);

  return (
    <div
      ref={containerRef}
      className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto select-none pointer-events-none"
      title="Seguridad Ejecutiva"
    >
      {/* Resplandor ambiental de elegancia */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#1F3A5F]/60 via-[#5AA9E6]/25 to-transparent blur-md opacity-75" />

      <svg
        viewBox="0 0 120 126"
        className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.65)]"
      >
        <defs>
          {/* Tono de piel humano realista (Cálido con sombras de oclusión) */}
          <linearGradient id="realSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE4D0" />
            <stop offset="55%" stopColor="#F4C7A8" />
            <stop offset="100%" stopColor="#DB9C75" />
          </linearGradient>

          {/* Sombra de mandíbula y cuello */}
          <linearGradient id="neckGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#BF7D57" />
            <stop offset="40%" stopColor="#CC8A63" />
            <stop offset="100%" stopColor="#E2A580" />
          </linearGradient>

          {/* Traje Ejecutivo Midnight Navy con reflejos sutiles */}
          <linearGradient id="realSuitGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#253852" />
            <stop offset="45%" stopColor="#1B293C" />
            <stop offset="100%" stopColor="#0F1724" />
          </linearGradient>

          {/* Solapa del traje con brillo */}
          <linearGradient id="lapelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334B6B" />
            <stop offset="100%" stopColor="#172232" />
          </linearGradient>

          {/* Cabello ejecutivo castaño oscuro con volumen */}
          <linearGradient id="realHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A3428" />
            <stop offset="50%" stopColor="#32221A" />
            <stop offset="100%" stopColor="#1A110D" />
          </linearGradient>

          {/* Reflejo de luz en el cabello */}
          <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6E503E" stopOpacity="0" />
            <stop offset="50%" stopColor="#7D5C48" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6E503E" stopOpacity="0" />
          </linearGradient>

          {/* Corbata de Seda Cyan & Zafiro */}
          <linearGradient id="realTieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Iris realista con profundidad azul zafiro */}
          <radialGradient id="irisGrad" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="55%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </radialGradient>

          {/* Sombra de ojos superior */}
          <filter id="eyeShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ========================================== */}
        {/* 1. CUERPO: TRAJE EJECUTIVO & HOMBROS       */}
        {/* ========================================== */}
        {/* Hombros anchos estructurados */}
        <path
          d="M 6 126 C 6 102 24 88 50 86 L 70 86 C 96 88 114 102 114 126 Z"
          fill="url(#realSuitGrad)"
          stroke="#5AA9E6"
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />

        {/* Camisa de vestir blanca cuello estructurado */}
        <path d="M 47 85 L 73 85 L 67 106 L 53 106 Z" fill="#F8FAFC" />
        <path d="M 44 85 L 53 98 L 49 85 Z" fill="#E2E8F0" />
        <path d="M 76 85 L 67 98 L 71 85 Z" fill="#CBD5E1" />

        {/* Corbata de seda estilizada con nudo Windsor */}
        {/* Nudo de la corbata */}
        <polygon points="56,90 64,90 62,96 58,96" fill="#0284C7" />
        {/* Cuerpo de la corbata cayendo al pecho */}
        <polygon points="57.5,95 62.5,95 64.5,124 60,126 55.5,124" fill="url(#realTieGrad)" />
        {/* Pliegue de volumen en la corbata */}
        <path d="M 60 96 L 60 125" stroke="#0369A1" strokeWidth="0.8" strokeOpacity="0.6" />

        {/* Solapas del Traje cruzadas con costura fina */}
        <path d="M 28 98 L 50 114 L 47 126" stroke="#475569" strokeWidth="1.2" fill="none" />
        <path d="M 92 98 L 70 114 L 73 126" stroke="#475569" strokeWidth="1.2" fill="none" />
        <polygon points="26,100 48,114 38,126 18,126" fill="url(#lapelGrad)" opacity="0.4" />
        <polygon points="94,100 72,114 82,126 102,126" fill="url(#lapelGrad)" opacity="0.4" />

        {/* ========================================== */}
        {/* 2. CUELLO HUMANO REALISTA                  */}
        {/* ========================================== */}
        <path
          d="M 52 68 L 52 87 C 52 89 68 89 68 87 L 68 68 Z"
          fill="url(#neckGrad)"
        />
        {/* Sombra de la nuez / esternocleidomastoideo */}
        <path d="M 57 73 Q 60 76 63 73" stroke="#B06A44" strokeWidth="1" fill="none" strokeLinecap="round" />

        {/* ========================================== */}
        {/* 3. CABEZA & OREJAS ANATÓMICAS              */}
        {/* ========================================== */}
        {/* Oreja Izquierda */}
        <g transform="translate(29, 48)">
          <path d="M 4 0 C 0 0 -2 5 -1 10 C 0 14 3 16 5 15 C 3 13 2 9 3 5 Z" fill="#F4C7A8" />
          <path d="M 3 4 Q 1 7 3 11" stroke="#C7835B" strokeWidth="0.8" fill="none" />
        </g>
        {/* Oreja Derecha */}
        <g transform="translate(86, 48)">
          <path d="M 1 0 C 5 0 7 5 6 10 C 5 14 2 16 0 15 C 2 13 3 9 2 5 Z" fill="#F4C7A8" />
          <path d="M 2 4 Q 4 7 2 11" stroke="#C7835B" strokeWidth="0.8" fill="none" />
        </g>

        {/* Rostro Masculino Esculpido (Mandíbula definida, pómulos elegantes) */}
        <path
          d="M 33 38 C 33 24 45 16 60 16 C 75 16 87 24 87 38 C 87 54 84 66 74 72 C 68 76 64 77 60 77 C 56 77 52 76 46 72 C 36 66 33 54 33 38 Z"
          fill="url(#realSkinGrad)"
          filter="url(#eyeShadow)"
        />

        {/* Sombra suave de los pómulos */}
        <path d="M 36 46 Q 42 54 48 57" stroke="#DB9C75" strokeWidth="1.2" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
        <path d="M 84 46 Q 78 54 72 57" stroke="#DB9C75" strokeWidth="1.2" strokeOpacity="0.4" fill="none" strokeLinecap="round" />

        {/* ========================================== */}
        {/* 4. CABELLO EJECUTIVO MODERNO REALISTA      */}
        {/* ========================================== */}
        {/* Masa principal peinada hacia el lado con textura */}
        <path
          d="M 30 38 C 29 20 42 10 60 10 C 78 10 90 19 89 36 C 85 24 74 18 58 19 C 44 20 35 28 30 38 Z"
          fill="url(#realHairGrad)"
        />
        {/* Volumen superior peinado */}
        <path
          d="M 35 24 C 44 14 62 13 78 18 C 85 21 88 27 88 32 C 84 24 73 20 59 20 C 46 20 38 23 35 24 Z"
          fill="#4A3428"
        />
        {/* Brillo de luz superior sobre el peinado */}
        <path
          d="M 44 16 Q 60 13 74 18"
          stroke="url(#hairHighlight)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Patillas prolijas perfiladas */}
        <path d="M 33 36 L 33 46 L 35 44 L 35 36 Z" fill="#2D1C15" />
        <path d="M 87 36 L 87 46 L 85 44 L 85 36 Z" fill="#2D1C15" />

        {/* ========================================== */}
        {/* 5. CEJAS Y OJOS CON SEGUIMIENTO DE MIRADA  */}
        {/* ========================================== */}
        {/* Ceja Izquierda perfilada */}
        <path
          d={
            isCoveringEyes
              ? "M 40 37 Q 48 39 54 39"
              : "M 40 38 Q 47 34 54 37"
          }
          stroke="#261710"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Ceja Derecha perfilada */}
        <path
          d={
            isCoveringEyes
              ? "M 66 39 Q 72 39 80 37"
              : "M 66 37 Q 73 34 80 38"
          }
          stroke="#261710"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* OJO IZQUIERDO HUMANO REALISTA */}
        <g transform="translate(47, 47)">
          {/* Esclerótica (blanco del ojo con forma almendrada) */}
          <path
            d={
              isBlinking
                ? "M -8 0 Q 0 1 8 0"
                : "M -8 0 Q 0 -5 8 0 Q 0 5 -8 0 Z"
            }
            fill={isBlinking ? "none" : "#F8FAFC"}
            stroke="#4A2F20"
            strokeWidth={isBlinking ? 1.6 : 0.8}
            strokeLinecap="round"
          />

          {!isBlinking && (
            <g clipPath="url(#eyeClipLeft)">
              {/* Sombra superior del párpado */}
              <ellipse cx="0" cy="-2.5" rx="7.5" ry="3.5" fill="#C7835B" opacity="0.35" />

              {/* Iris azul zafiro realista con pupila que sigue el cursor */}
              <circle
                cx={pupilOffset.x * 0.75}
                cy={pupilOffset.y * 0.75}
                r="3.8"
                fill="url(#irisGrad)"
              />
              {/* Pupila negra */}
              <circle
                cx={pupilOffset.x * 0.75}
                cy={pupilOffset.y * 0.75}
                r="2.1"
                fill="#0A0F1D"
              />
              {/* Reflejo corneal de luz (catchlight) */}
              <circle
                cx={pupilOffset.x * 0.75 - 1.1}
                cy={pupilOffset.y * 0.75 - 1.1}
                r="1"
                fill="#FFFFFF"
              />
              <circle
                cx={pupilOffset.x * 0.75 + 1.2}
                cy={pupilOffset.y * 0.75 + 1.0}
                r="0.5"
                fill="#FFFFFF"
                opacity="0.7"
              />
            </g>
          )}
        </g>

        {/* OJO DERECHO HUMANO REALISTA */}
        <g transform="translate(73, 47)">
          {/* Esclerótica almendrada */}
          <path
            d={
              isBlinking
                ? "M -8 0 Q 0 1 8 0"
                : "M -8 0 Q 0 -5 8 0 Q 0 5 -8 0 Z"
            }
            fill={isBlinking ? "none" : "#F8FAFC"}
            stroke="#4A2F20"
            strokeWidth={isBlinking ? 1.6 : 0.8}
            strokeLinecap="round"
          />

          {!isBlinking && (
            <g clipPath="url(#eyeClipRight)">
              {/* Sombra superior del párpado */}
              <ellipse cx="0" cy="-2.5" rx="7.5" ry="3.5" fill="#C7835B" opacity="0.35" />

              {/* Iris azul zafiro realista con pupila que sigue el cursor */}
              <circle
                cx={pupilOffset.x * 0.75}
                cy={pupilOffset.y * 0.75}
                r="3.8"
                fill="url(#irisGrad)"
              />
              {/* Pupila negra */}
              <circle
                cx={pupilOffset.x * 0.75}
                cy={pupilOffset.y * 0.75}
                r="2.1"
                fill="#0A0F1D"
              />
              {/* Reflejos de luz */}
              <circle
                cx={pupilOffset.x * 0.75 - 1.1}
                cy={pupilOffset.y * 0.75 - 1.1}
                r="1"
                fill="#FFFFFF"
              />
              <circle
                cx={pupilOffset.x * 0.75 + 1.2}
                cy={pupilOffset.y * 0.75 + 1.0}
                r="0.5"
                fill="#FFFFFF"
                opacity="0.7"
              />
            </g>
          )}
        </g>

        {/* ========================================== */}
        {/* 6. NARIZ Y BOCA NATURALES                  */}
        {/* ========================================== */}
        {/* Puente y aletas nasales suaves */}
        <path d="M 59 47 L 58 57 Q 60 59 62 57" stroke="#C47E55" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <ellipse cx="57" cy="57.5" rx="1" ry="0.6" fill="#A86139" opacity="0.6" />
        <ellipse cx="63" cy="57.5" rx="1" ry="0.6" fill="#A86139" opacity="0.6" />

        {/* Labios Humanos Naturales */}
        {/* Labio superior con arco de cupido */}
        <path
          d={
            isCoveringEyes
              ? "M 54 67 Q 60 66 66 67" // Sonrisa discreta y profesional
              : "M 53 66 Q 57 65 60 66 Q 63 65 67 66" // Sonrisa ejecutiva agradable
          }
          stroke="#9F5144"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Sombra de apoyo en labio inferior */}
        <path
          d={
            isCoveringEyes
              ? "M 56 69 Q 60 70.5 64 69"
              : "M 55 69 Q 60 72 65 69"
          }
          stroke="#C27367"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* ========================================================================= */}
        {/* 7. BRAZOS Y MANOS ANATÓMICOS: EMERGEN DEL PECHO/HOMBROS (NO DE LAS OREJAS) */}
        {/* ========================================================================= */}
        <g
          className="transition-all duration-350 ease-out"
          style={{
            transform: isCoveringEyes
              ? "translateY(0px) scale(1)"
              : "translateY(60px) scale(0.7)",
            opacity: isCoveringEyes ? 1 : 0,
            transformOrigin: "60px 126px",
          }}
        >
          {/* --- BRAZO IZQUIERDO: Viene desde abajo del torso (x: 10, y: 126) --- */}
          {/* Manga del traje azul navy con pliegue anatómico */}
          <path
            d="M 12 126 L 24 95 L 38 68 L 48 72 L 34 102 L 24 126 Z"
            fill="url(#realSuitGrad)"
            stroke="#334B6B"
            strokeWidth="0.8"
          />
          {/* Puño de la camisa blanca asomando */}
          <polygon points="36,66 45,70 43,74 34,70" fill="#FFFFFF" />

          {/* Mano Izquierda Realista (Cubre el ojo izquierdo desde abajo/mejilla) */}
          <g transform="translate(46, 48)">
            {/* Palma / dorso de la mano */}
            <path
              d="M -7 18 C -9 12 -7 4 -2 0 C 4 -3 10 0 11 5 C 12 11 9 18 3 20 Z"
              fill="url(#realSkinGrad)"
              stroke="#B36F49"
              strokeWidth="0.7"
            />
            {/* Dedos perfilados cubriendo el ojo izquierdo */}
            {/* Dedo Meñique */}
            <path d="M -6 10 C -8 5 -6 0 -4 -1 C -2 -1 -2 3 -3 8" stroke="#A86139" strokeWidth="1" fill="none" />
            {/* Dedo Anular */}
            <path d="M -2 7 C -3 0 -1 -4 1 -4 C 3 -4 2 1 1 7" stroke="#A86139" strokeWidth="1.1" fill="none" />
            {/* Dedo Medio (el más largo) */}
            <path d="M 3 6 C 3 -2 6 -6 8 -5 C 9 -4 8 1 6 7" stroke="#A86139" strokeWidth="1.1" fill="none" />
            {/* Dedo Índice */}
            <path d="M 8 7 C 9 1 12 -1 13 1 C 14 3 12 7 10 9" stroke="#A86139" strokeWidth="1" fill="none" />
          </g>

          {/* --- BRAZO DERECHO: Viene desde abajo del torso (x: 108, y: 126) --- */}
          {/* Manga del traje azul navy con pliegue anatómico */}
          <path
            d="M 108 126 L 96 95 L 82 68 L 72 72 L 86 102 L 96 126 Z"
            fill="url(#realSuitGrad)"
            stroke="#334B6B"
            strokeWidth="0.8"
          />
          {/* Puño de la camisa blanca asomando */}
          <polygon points="84,66 75,70 77,74 86,70" fill="#FFFFFF" />

          {/* Mano Derecha Realista (Cubre el ojo derecho desde abajo/mejilla) */}
          <g transform="translate(74, 48)">
            {/* Palma / dorso de la mano */}
            <path
              d="M 7 18 C 9 12 7 4 2 0 C -4 -3 -10 0 -11 5 C -12 11 -9 18 -3 20 Z"
              fill="url(#realSkinGrad)"
              stroke="#B36F49"
              strokeWidth="0.7"
            />
            {/* Dedos perfilados cubriendo el ojo derecho */}
            {/* Dedo Meñique */}
            <path d="M 6 10 C 8 5 6 0 4 -1 C 2 -1 2 3 3 8" stroke="#A86139" strokeWidth="1" fill="none" />
            {/* Dedo Anular */}
            <path d="M 2 7 C 3 0 1 -4 -1 -4 C -3 -4 -2 1 -1 7" stroke="#A86139" strokeWidth="1.1" fill="none" />
            {/* Dedo Medio */}
            <path d="M -3 6 C -3 -2 -6 -6 -8 -5 C -9 -4 -8 1 -6 7" stroke="#A86139" strokeWidth="1.1" fill="none" />
            {/* Dedo Índice */}
            <path d="M -8 7 C -9 1 -12 -1 -13 1 C -14 3 -12 7 -10 9" stroke="#A86139" strokeWidth="1" fill="none" />
          </g>
        </g>
      </svg>
    </div>
  );
}
