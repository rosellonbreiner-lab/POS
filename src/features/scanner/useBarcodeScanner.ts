"use client";

import { useEffect, useRef, useCallback } from "react";

interface BarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minChars?: number;
  maxIntervalMs?: number; // < 50ms typical for laser HID barcode scanners
  enabled?: boolean;
}

export function useBarcodeScanner({
  onScan,
  minChars = 3,
  maxIntervalMs = 50,
  enabled = true,
}: BarcodeScannerOptions) {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || !e || typeof e.key !== "string") return;

      const target = e.target as HTMLElement | null;
      // If user is focused on a normal text input, don't hijack unless it's a barcode scanner input
      // However, ARCHITECTURE.md notes: "funciona aunque el foco no esté en un input"
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      const now = Date.now();
      const interval = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        if (bufferRef.current.length >= minChars) {
          // If rapid burst, trigger onScan!
          onScan(bufferRef.current);
          bufferRef.current = "";
          if (!isInput) {
            e.preventDefault();
          }
        } else {
          bufferRef.current = "";
        }
        return;
      }

      // Scanner chars come rapidly (< 50ms per key)
      if (interval > maxIntervalMs && bufferRef.current.length > 0) {
        // Reset buffer if human typing slow
        bufferRef.current = "";
      }

      // Record printable characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    },
    [enabled, minChars, maxIntervalMs, onScan]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}

