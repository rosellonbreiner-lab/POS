"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ShieldCheck, EyeOff } from "lucide-react";

interface ExecutiveAvatarProps {
  isCoveringEyes?: boolean;
  isTypingEmail?: boolean;
}

export function ExecutiveAvatar({
  isCoveringEyes = false,
  isTypingEmail = false,
}: ExecutiveAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // 1. Seguimiento 3D hiperrealista del cursor con rotación de perspectiva e iris
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isCoveringEyes) {
        setTilt({ rotateX: 0, rotateY: 0 });
        setPupilOffset({ x: 0, y: 0 });
        return;
      }

      if (isTypingEmail) {
        // Mirar atentamente hacia abajo hacia el input de correo
        setTilt({ rotateX: 8, rotateY: 0 });
        setPupilOffset({ x: 0, y: 2.8 });
        return;
      }

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Ángulo y distancia normalizada
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.hypot(deltaX, deltaY), 400);
      const intensity = distance / 400;

      // Inclinación 3D sutil y elegante de la cabeza del ejecutivo
      const maxRotY = 14; // Grados hacia los lados
      const maxRotX = 10; // Grados arriba/abajo

      const rotY = (deltaX / (window.innerWidth / 2)) * maxRotY;
      const rotX = -(deltaY / (window.innerHeight / 2)) * maxRotX;

      setTilt({
        rotateX: Math.max(-10, Math.min(10, rotX)),
        rotateY: Math.max(-14, Math.min(14, rotY)),
      });

      // Movimiento ocular del iris (±3px en radio)
      const maxEyeShift = 3.2;
      setPupilOffset({
        x: Math.cos(angle) * intensity * maxEyeShift,
        y: Math.sin(angle) * intensity * maxEyeShift,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isCoveringEyes, isTypingEmail]);

  // Si está escribiendo el correo y no cubre los ojos, inclinar cabeza hacia abajo
  useEffect(() => {
    if (isTypingEmail && !isCoveringEyes) {
      setTilt({ rotateX: 9, rotateY: 0 });
      setPupilOffset({ x: 0, y: 3.0 });
    }
  }, [isTypingEmail, isCoveringEyes]);

  // 2. Parpadeo orgánico humano
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
      className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto select-none pointer-events-none group"
      style={{ perspective: "700px" }}
      title="Seguridad Ejecutiva con IA"
    >
      {/* Resplandor ambiental de elegancia profesional */}
      <div
        className={`absolute -inset-2 rounded-full transition-all duration-500 blur-xl ${
          isCoveringEyes
            ? "bg-gradient-to-tr from-[#1F3A5F]/70 via-[#5AA9E6]/40 to-[#10B981]/30 opacity-90 scale-105"
            : "bg-gradient-to-tr from-[#1F3A5F]/60 via-[#5AA9E6]/30 to-transparent opacity-70"
        }`}
      />

      {/* Tarjeta 3D Rotativa del Personaje */}
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-[#5AA9E6]/40 shadow-[0_15px_35px_rgba(0,0,0,0.65),0_0_20px_rgba(90,169,230,0.25)] bg-[#18202F] transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${
            isCoveringEyes ? 1.02 : 1
          })`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* ========================================================================= */}
        {/* CAPA 1: EJECUTIVO MIRANDO AL FRENTE (FOTORREALISTA 3D)                     */}
        {/* ========================================================================= */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ease-out ${
            isCoveringEyes ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <img
            src="/avatar/executive-normal.jpg"
            alt="Ejecutivo de Seguridad POS"
            className="w-full h-full object-cover object-center"
          />

          {/* Micro-capa de seguimiento pupilar dinámico y destellos oculares */}
          {!isCoveringEyes && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Ojo Izquierdo (Perspectiva del usuario: ~43.0% X, 31.0% Y) */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400/30 blur-[1px] mix-blend-screen transition-transform duration-75"
                style={{
                  left: "42.5%",
                  top: "30.5%",
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                }}
              >
                {/* Catchlight blanco en la pupila */}
                <div className="w-1 h-1 bg-white rounded-full opacity-90 shadow-[0_0_2px_#fff]" />
              </div>

              {/* Ojo Derecho (Perspectiva del usuario: ~56.1% X, 31.0% Y) */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400/30 blur-[1px] mix-blend-screen transition-transform duration-75"
                style={{
                  left: "55.8%",
                  top: "30.5%",
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                }}
              >
                {/* Catchlight blanco en la pupila */}
                <div className="w-1 h-1 bg-white rounded-full opacity-90 shadow-[0_0_2px_#fff]" />
              </div>
            </div>
          )}

          {/* Efecto de Pestañeo Humano Natural */}
          <div
            className={`absolute inset-x-[36%] top-[29%] h-[6%] bg-[#2b1f1a]/85 rounded-full blur-[0.8px] transition-all duration-100 pointer-events-none ${
              isBlinking && !isCoveringEyes
                ? "opacity-100 scale-y-100"
                : "opacity-0 scale-y-0"
            }`}
          />
        </div>

        {/* ========================================================================= */}
        {/* CAPA 2: EJECUTIVO TAPÁNDOSE LOS OJOS CON LAS MANOS (FOTORREALISTA 3D)     */}
        {/* ========================================================================= */}
        <div
          className={`absolute inset-0 w-full h-full transition-all duration-350 ease-out ${
            isCoveringEyes
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105 pointer-events-none"
          }`}
        >
          <img
            src="/avatar/executive-covered.jpg"
            alt="Ejecutivo tapándose los ojos para proteger contraseña"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Brillo especular dinámico de cristal */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60"
          style={{
            transform: `translate(${pupilOffset.x * 3}px, ${pupilOffset.y * 3}px)`,
          }}
        />

        {/* Badge flotante discreto de confidencialidad al taparse los ojos */}
        <div
          className={`absolute bottom-1.5 inset-x-2 py-0.5 px-2 rounded-full backdrop-blur-md border text-[9px] font-semibold flex items-center justify-center gap-1 transition-all duration-300 shadow-md ${
            isCoveringEyes
              ? "bg-[#10B981]/20 border-[#10B981]/40 text-[#A7F3D0] opacity-100 translate-y-0"
              : "bg-[#1F3A5F]/30 border-[#5AA9E6]/30 text-[#5AA9E6] opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <EyeOff className="w-2.5 h-2.5 text-[#10B981]" />
          <span>Privacidad</span>
        </div>
      </div>
    </div>
  );
}
