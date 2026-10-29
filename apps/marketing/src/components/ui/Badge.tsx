import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "purple" | "neutral";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "purple",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    purple: "bg-[#c22ef322] text-[#de74f6] border border-[#c22ef355]",
    success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    info: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
    neutral: "bg-zinc-800/60 text-zinc-300 border border-zinc-700/50",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full uppercase tracking-wider backdrop-blur-sm ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

