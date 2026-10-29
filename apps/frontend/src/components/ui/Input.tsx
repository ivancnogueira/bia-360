import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label htmlFor={generatedId} className="block text-xs font-semibold text-[#eee3f7]">
            {label}
          </label>
        ) : null}
        <input
          id={generatedId}
          ref={ref}
          className={`w-full bg-[#160d20] border ${
            error ? "border-rose-500" : "border-[#d798ff33]"
          } rounded-lg px-3.5 py-2 text-sm text-[#f7f2ff] placeholder-[#887591] focus:outline-none focus:border-[#c22ef3] focus:ring-1 focus:ring-[#c22ef3] transition-colors ${className}`}
          {...props}
        />
        {error ? <p className="text-[11px] text-rose-400 font-medium">{error}</p> : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = "", id, children, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label htmlFor={generatedId} className="block text-xs font-semibold text-[#eee3f7]">
            {label}
          </label>
        ) : null}
        <select
          id={generatedId}
          ref={ref}
          className={`w-full bg-[#160d20] border ${
            error ? "border-rose-500" : "border-[#d798ff33]"
          } rounded-lg px-3.5 py-2 text-sm text-[#f7f2ff] focus:outline-none focus:border-[#c22ef3] focus:ring-1 focus:ring-[#c22ef3] transition-colors ${className}`}
          {...props}
        >
          {children}
        </select>
        {error ? <p className="text-[11px] text-rose-400 font-medium">{error}</p> : null}
      </div>
    );
  }
);
Select.displayName = "Select";

