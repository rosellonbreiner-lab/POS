"use client";

import * as React from "react";
import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "danger" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#5AA9E6]/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-[#1F3A5F] to-[#5AA9E6] text-[#EAF4F4] hover:from-[#19304e] hover:to-[#468ec7] shadow-lg shadow-[#1F3A5F]/40 border border-[#5AA9E6]/30",
      secondary:
        "bg-[#5AA9E6]/10 text-[#5AA9E6] border border-[#5AA9E6]/30 hover:bg-[#5AA9E6]/20",
      accent:
        "bg-[#1F3A5F] text-[#EAF4F4] border border-[#5AA9E6]/40 hover:bg-[#254673]",
      glass:
        "glass text-[#EAF4F4] hover:bg-white/[0.12] hover:border-white/20 active:bg-white/[0.15]",
      danger:
        "bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/30 hover:bg-[#F87171]/20",
      ghost:
        "text-[#94A3B8] hover:text-[#EAF4F4] hover:bg-white/[0.05]",
    };

    const sizeStyles = {
      sm: "h-7.5 px-2.5 text-xs gap-1",
      md: "h-8.5 px-3.5 text-xs gap-1.5",
      lg: "h-10 px-5 text-sm gap-2",
    };

    // Cast motion.button to avoid type mismatch on event handlers with ref
    const MotionButton = motion.button as unknown as React.ForwardRefExoticComponent<
      HTMLMotionProps<"button"> & React.RefAttributes<HTMLButtonElement>
    >;

    return (
      <MotionButton
        ref={ref}
        whileTap={{ scale: 0.97 }} // Emil Kowalski principle: active { transform: scale(0.97) }
        transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...(props as HTMLMotionProps<"button">)}
      >
        {children}
      </MotionButton>
    );
  }
);
Button.displayName = "Button";
