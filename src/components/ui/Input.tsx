import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="w-full relative">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-[#94A3B8] pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full h-8.5 px-3 py-1.5 text-xs text-[#EAF4F4] placeholder-[#94A3B8]/60",
              "bg-[#222831]/60 border border-[#5AA9E6]/25 rounded-xl",
              "focus:outline-none focus:border-[#5AA9E6] focus:ring-2 focus:ring-[#5AA9E6]/30",
              "transition-all duration-150",
              icon && "pl-9",
              error && "border-[#F87171] focus:border-[#F87171] focus:ring-[#F87171]/40",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-[#F87171] flex items-center gap-1">
            <span>•</span> {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
