import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
}

export function Card({ className, strong = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        strong ? "glass-strong" : "glass",
        "p-3.5 sm:p-4 text-[#EAF4F4] relative overflow-hidden bg-[#222831]/80 border-[#5AA9E6]/20 rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1 pb-2.5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold tracking-tight text-[#EAF4F4] font-[family-name:var(--font-space-grotesk)]", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-[#94A3B8]", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
}
