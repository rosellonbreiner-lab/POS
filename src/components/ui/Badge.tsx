import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "info" | "success" | "warning" | "danger" | "neutral";
}

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  const variantStyles = {
    primary: "bg-[#5AA9E6]/15 text-[#5AA9E6] border-[#5AA9E6]/30",
    info: "bg-[#22D3EE]/15 text-[#22D3EE] border-[#22D3EE]/30",
    success: "bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30",
    warning: "bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30",
    danger: "bg-[#F87171]/15 text-[#F87171] border-[#F87171]/30",
    neutral: "bg-white/[0.08] text-[#9CA3AF] border-white/10",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border tabular-nums",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

