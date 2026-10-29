import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glow = false,
  className = "",
  ...props
}) => {
  const glowStyle = glow
    ? "border-[#c22ef3aa] shadow-[0_0_30px_#bf21e51f]"
    : "border-[#d798ff33] shadow-lg shadow-black/40";

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-[#c783ff14] to-[#20122e66] backdrop-blur-xl border ${glowStyle} p-5 transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`mb-4 flex items-center justify-between border-b border-[#d798ff22] pb-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <h3 className={`text-lg font-bold text-[#f7f2ff] tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <p className={`text-xs text-[#baacc7] ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`text-[#eee3f7] ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`mt-4 pt-3 border-t border-[#d798ff22] flex items-center justify-between text-xs text-[#baacc7] ${className}`} {...props}>
    {children}
  </div>
);

