import React from "react";
import { cn } from "@/lib/utils";

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
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 sm:p-6 bg-card text-card-foreground shadow-sm transition-all duration-200",
        "dark:bg-[#100b17] dark:border-[#d798ff22] dark:shadow-lg dark:shadow-black/30",
        glow && "border-emerald-500/50 shadow-md shadow-emerald-500/10 dark:border-[#c22ef3aa] dark:shadow-[0_0_30px_#bf21e51f]",
        className
      )}
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
  <div
    className={cn(
      "mb-4 flex items-center justify-between border-b border-border pb-3",
      "dark:border-[#d798ff22]",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <h3
    className={cn(
      "text-lg font-bold text-foreground tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <p
    className={cn(
      "text-xs text-muted-foreground leading-relaxed",
      className
    )}
    {...props}
  >
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={cn("space-y-4", className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div
    className={cn(
      "mt-4 flex items-center justify-end gap-2 border-t border-border pt-3",
      "dark:border-[#d798ff22]",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
