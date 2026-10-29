import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "neon";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-bold transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-md gap-1.5",
    md: "px-4 py-2 text-sm rounded-lg gap-2",
    lg: "px-6 py-3 text-base rounded-xl gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-[#c22ef3] to-[#f33199] text-white shadow-lg shadow-[#c22ef333] hover:brightness-110 active:scale-95",
    secondary:
      "bg-[#160d20] text-[#f7f2ff] border border-[#d798ff44] hover:bg-[#20122e] hover:border-[#c22ef3] active:scale-95",
    danger:
      "bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-900/30 hover:brightness-110 active:scale-95",
    ghost:
      "bg-transparent text-[#baacc7] hover:text-[#f7f2ff] hover:bg-[#c783ff15] active:scale-95",
    neon:
      "bg-gradient-to-r from-[#c22ef3] to-[#f33199] text-white font-extrabold uppercase tracking-wider shadow-[0_0_25px_#bf21e566] hover:brightness-125 active:scale-95",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};

